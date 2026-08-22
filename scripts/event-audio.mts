/**
 * event-audio.mts — swap ONLY the recap audio on a past public event.
 *
 * For re-uploads: point it at a new WAV/MP3 and it compresses (if needed),
 * uploads to R2, and rewrites the event's audioUrl. The tracklist, photos, and
 * everything else on the event are left untouched. Pairs with `audio:prep`.
 *
 * The R2 key is deterministic — events/<slug>.mp3 — so re-uploading overwrites
 * the existing object in place. There's no orphan to delete and audioUrl is
 * unchanged; the file's bytes are simply replaced.
 *
 * Interactive, checkpoint-driven, supports --dry-run.
 *
 * Usage:
 *   npm run event:audio            (= op run --env-file=.env.r2.op -- node scripts/event-audio.mts)
 *   npm run event:audio:dry        (adds --dry-run)
 *
 * Requirements:
 *   - ffmpeg on PATH (only when the input is not already an MP3)
 *   - R2 credentials in the environment (see .env.r2.op / .env.example): R2_ACCOUNT_ID,
 *     R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 */
import { existsSync, statSync, mkdtempSync, rmSync } from 'node:fs'
import { dirname, resolve, join, isAbsolute, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { uploadFile, r2PublicUrl } from './lib/r2.mts'
import { readEvents, writeEvents, isPastEvent, publicEventsPath } from './lib/events.mts'
import type { PublicEvent } from '../src/data/public-events.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

const MP3_BITRATE = '192k'

const rel = (p: string) => p.replace(`${root}/`, '')

const fmtBytes = (n: number) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`

const expandPath = (p: string) => {
  const out = p.trim().replace(/^~(?=$|\/)/, homedir())
  return isAbsolute(out) ? out : resolve(process.cwd(), out)
}

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
    past.forEach((e, i) =>
      console.log(`  ${i + 1}. ${e.title}  (${e.slug})${e.audioUrl ? '  — has audio' : ''}`)
    )
    const event = past[Number(await ask('Pick an event by number')) - 1]
    if (!event) throw new Error('Invalid selection.')
    if (event.audioUrl) {
      console.log(`  current audio: ${event.audioUrl}`)
      if (!(await yesNo('Replace this audio', true))) {
        console.log('Cancelled.')
        return
      }
    }

    // 2) Resolve the input audio; compress to MP3 unless already MP3
    const src = expandPath(await ask('Path to the new audio (WAV or MP3)'))
    if (!existsSync(src)) throw new Error(`Audio not found: ${src}`)

    const key = `events/${event.slug}.mp3`
    let upload = src
    if (extname(src).toLowerCase() === '.mp3') {
      console.log(`Input is already MP3 (${fmtBytes(statSync(src).size)}); uploading as-is.`)
    } else {
      tmpDir = mkdtempSync(join(tmpdir(), 'pvr-audio-'))
      upload = join(tmpDir, `${event.slug}.mp3`)
      console.log(`Compressing to MP3 (${MP3_BITRATE})…`)
      execFileSync('ffmpeg', ['-y', '-i', src, '-codec:a', 'libmp3lame', '-b:a', MP3_BITRATE, upload], {
        stdio: 'inherit',
      })
      console.log(`  ${fmtBytes(statSync(src).size)} in → ${fmtBytes(statSync(upload).size)} MP3`)
    }

    // 3) Upload — same key overwrites the old object in place (no orphan)
    let audioUrl: string
    if (dryRun) {
      console.log(`Would upload ${rel(upload)} → r2://${key} (overwrites existing)`)
      audioUrl = r2PublicUrl(key)
    } else {
      if (!(await yesNo(`Upload to R2 as ${key} (overwrites the old file)`, true))) {
        console.log('Cancelled. Nothing uploaded.')
        return
      }
      console.log('Uploading…')
      audioUrl = await uploadFile(key, upload, 'audio/mpeg')
      console.log(`  ✓ ${audioUrl}`)
    }

    // 4) Write audioUrl back (unchanged when the key matches, set for safety)
    const updated: PublicEvent = { ...event, audioUrl }
    if (!dryRun) {
      writeEvents(events.map((e) => (e.slug === event.slug ? updated : e)))
      console.log(`✓ Updated audio for "${event.slug}" in ${rel(publicEventsPath)}.`)
      console.log('  Note: the public URL is unchanged, so a CDN/browser cache may still serve the old file for a while.')
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
