/**
 * event-recap.mts — attach a post-event recap to a public event.
 *
 * Interactive, checkpoint-driven flow that:
 *   1. Picks a past public event from src/data/public-events.data.json
 *   2. Links a groovenet playlist and pulls its tracklist (title/artist +
 *      Discogs/Apple Music/YouTube links per track)
 *   3. Compresses a WAV of the set to MP3 (192 kbps) with ffmpeg
 *   4. Uploads the MP3 to Cloudflare R2 (events/<slug>.mp3)
 *   5. Writes audioUrl + playlistId + tracklist back into the event's JSON
 *
 * The recap renders on the event page via public-event-template.tsx.
 *
 * Usage:
 *   op run --env-file=.env.op -- node scripts/event-recap.mts
 *   op run --env-file=.env.op -- node scripts/event-recap.mts --dry-run
 *   npm run event:recap
 *
 * Requirements:
 *   - ffmpeg on PATH
 *   - R2 credentials in the environment (see .env.example): R2_ACCOUNT_ID,
 *     R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 *   - The groovenet CLI build. Path resolves from GROOVENET_BIN or defaults to
 *     ~/Projects/dj-playlist/packages/groovenet-cli/build/bin/groovenet.js
 */
import { existsSync, statSync, mkdtempSync, rmSync } from 'node:fs'
import { dirname, resolve, join, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { uploadFile, r2PublicUrl } from './lib/r2.mts'
import { readEvents, writeEvents, isPastEvent, publicEventsPath } from './lib/events.mts'
import type { PublicEvent } from '../src/data/public-events.ts'
import type { TrackItem } from '../src/types/content.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

const GROOVENET_BIN =
  process.env.GROOVENET_BIN ||
  join(homedir(), 'Projects/dj-playlist/packages/groovenet-cli/build/bin/groovenet.js')

const MP3_BITRATE = '192k'

const rel = (p: string) => p.replace(`${root}/`, '')

// ── groovenet CLI (returns parsed JSON from `<command> --json`) ──
function groovenetJson<T>(args: string[]): T {
  if (!existsSync(GROOVENET_BIN)) {
    throw new Error(
      `groovenet CLI not found at ${GROOVENET_BIN}. Build it or set GROOVENET_BIN to the built groovenet.js.`
    )
  }
  // groovenet's API uses a cert signed by a private/local CA. Node doesn't use
  // the macOS keychain, so trust the system store via --use-system-ca (Node
  // >=22.15). If NODE_EXTRA_CA_CERTS is set, defer to that CA bundle instead.
  const tlsArgs = process.env.NODE_EXTRA_CA_CERTS ? [] : ['--use-system-ca']
  const stdout = execFileSync('node', [...tlsArgs, GROOVENET_BIN, ...args, '--json'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  try {
    return JSON.parse(stdout) as T
  } catch {
    throw new Error(`Could not parse JSON from: groovenet ${args.join(' ')} --json`)
  }
}

type CliPlaylist = { id: string | number; name: string; tracks?: unknown[] }
type CliTrack = {
  track_id: string
  title: string
  artist: string
  album?: string | null
  year?: string | number | null
  duration_seconds?: number | null
  discogs_url?: string | null
  apple_music_url?: string | null
  youtube_url?: string | null
}

// Map to the shared TrackItem shape (snake_case) used by the show + event
// tracklist components. Spotify is intentionally omitted for event recaps.
const toTrack = (t: CliTrack): TrackItem => ({
  title: t.title,
  artist: t.artist,
  ...(t.album ? { album: t.album } : {}),
  ...(t.year != null && t.year !== '' ? { year: String(t.year) } : {}),
  ...(t.duration_seconds != null ? { duration_seconds: t.duration_seconds } : {}),
  ...(t.discogs_url ? { discogs_url: t.discogs_url } : {}),
  ...(t.apple_music_url ? { apple_music_url: t.apple_music_url } : {}),
  ...(t.youtube_url ? { youtube_url: t.youtube_url } : {}),
})

const fmtBytes = (n: number) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`

async function main() {
  const rl = createInterface({ input, output })
  const ask = async (label: string, fallback?: string) => {
    const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return answer || fallback || ''
  }
  const yesNo = async (label: string, fallback = true) =>
    ['y', 'yes'].includes((await ask(`${label} (y/n)`, fallback ? 'y' : 'n')).toLowerCase())

  let tmpDir: string | undefined
  try {
    if (dryRun) console.log('— DRY RUN: no upload, no file writes —\n')

    // 1) Pick a past event
    const events = readEvents()
    const past = events.filter((e) => isPastEvent(e))
    if (past.length === 0) throw new Error('No past events found in public-events.data.json.')
    console.log('Past events:')
    past.forEach((e, i) => console.log(`  ${i + 1}. ${e.title}  (${e.slug})`))
    const pick = Number(await ask('Pick an event by number'))
    const event = past[pick - 1]
    if (!event) throw new Error('Invalid selection.')
    if (event.audioUrl && !(await yesNo(`"${event.slug}" already has a recap. Overwrite`, false))) {
      console.log('Cancelled.')
      return
    }

    // 2) Link a playlist + pull tracklist
    console.log('\nFetching playlists from groovenet…')
    const playlists = groovenetJson<CliPlaylist[]>(['playlists', 'list'])
    if (playlists.length === 0) throw new Error('No playlists returned by groovenet.')
    playlists.forEach((p) =>
      console.log(`  ${p.id}  ${p.name}${p.tracks ? `  (${p.tracks.length} tracks)` : ''}`)
    )
    const playlistId = await ask('Playlist id')
    if (!playlistId) throw new Error('A playlist id is required.')
    const cliTracks = groovenetJson<CliTrack[]>(['playlists', 'show', playlistId])
    if (cliTracks.length === 0) throw new Error('That playlist is empty.')
    const tracklist = cliTracks.map(toTrack)

    console.log(`\nTracklist (${tracklist.length}):`)
    tracklist.forEach((t, i) => {
      const links = [t.discogs_url && 'Discogs', t.apple_music_url && 'Apple', t.youtube_url && 'YouTube']
        .filter(Boolean)
        .join(', ')
      console.log(`  ${String(i + 1).padStart(2)}. ${t.title} — ${t.artist}${links ? `   [${links}]` : ''}`)
    })
    if (!(await yesNo('\nUse this tracklist'))) {
      console.log('Cancelled.')
      return
    }

    // 3) Compress WAV → MP3
    let audioUrl: string | undefined
    if (await yesNo('\nAdd a recorded set (WAV → MP3 → R2)', true)) {
      let wav = await ask('Path to the WAV file')
      wav = wav.replace(/^~(?=$|\/)/, homedir())
      if (!isAbsolute(wav)) wav = resolve(process.cwd(), wav)
      if (!existsSync(wav)) throw new Error(`WAV not found: ${wav}`)

      tmpDir = mkdtempSync(join(tmpdir(), 'pvr-recap-'))
      const mp3 = join(tmpDir, `${event.slug}.mp3`)
      console.log(`Compressing to MP3 (${MP3_BITRATE})…`)
      execFileSync('ffmpeg', ['-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', MP3_BITRATE, mp3], {
        stdio: 'inherit',
      })
      console.log(`  ${fmtBytes(statSync(wav).size)} WAV → ${fmtBytes(statSync(mp3).size)} MP3`)

      const key = `events/${event.slug}.mp3`
      if (dryRun) {
        console.log(`Would upload ${rel(mp3)} → r2://${key}`)
        audioUrl = r2PublicUrl(key)
      } else if (await yesNo(`Upload to R2 as ${key}`, true)) {
        console.log('Uploading…')
        audioUrl = await uploadFile(key, mp3, 'audio/mpeg')
        console.log(`  ✓ ${audioUrl}`)
      }
    }

    // 4) Write back into the event JSON
    const updated: PublicEvent = {
      ...event,
      playlistId,
      tracklist,
      ...(audioUrl ? { audioUrl } : {}),
    }
    console.log(`\n${dryRun ? 'Would write' : 'Writing'} recap to ${rel(publicEventsPath)}:`)
    console.log(
      JSON.stringify(
        { slug: updated.slug, playlistId, tracks: tracklist.length, audioUrl: audioUrl ?? '(none)' },
        null,
        2
      )
    )
    if (!(await yesNo(`${dryRun ? 'Preview' : 'Save'} this recap`, true))) {
      console.log('Cancelled. No files were changed.')
      return
    }

    if (!dryRun) {
      const next = events.map((e) => (e.slug === event.slug ? updated : e))
      writeEvents(next)
      console.log(`✓ Saved recap for "${event.slug}".`)
    } else {
      console.log('Preview complete. No files were changed.')
    }
  } finally {
    rl.close()
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
