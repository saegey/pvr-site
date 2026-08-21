/**
 * event-tracklist.mts — re-sync a public event's tracklist from groovenet.
 *
 * For corrections: fix the tracks in groovenet, then run this to re-fetch the
 * playlist (via the event's stored playlistId) and rewrite ONLY the tracklist.
 * Audio, photos, and everything else on the event are left untouched.
 *
 * Interactive, checkpoint-driven, supports --dry-run. Shows an old→new diff
 * before writing.
 *
 * Usage:
 *   npm run event:tracklist            (= node scripts/event-tracklist.mts)
 *   npm run event:tracklist:dry        (adds --dry-run)
 *
 * No R2 credentials needed (only groovenet, which uses ~/.groovenet/config.json).
 * groovenet must be reachable — see the groovenet notes in event-recap.mts.
 */
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { readEvents, writeEvents, isPastEvent, publicEventsPath } from './lib/events.mts'
import { listPlaylists, fetchPlaylistTracks } from './lib/groovenet.mts'
import type { PublicEvent } from '../src/data/public-events.ts'
import type { TrackItem } from '../src/types/content.ts'

const dryRun = process.argv.includes('--dry-run')

const label = (t: TrackItem) => `${t.title ?? '?'} — ${t.artist ?? '?'}`

/** Print an index-aligned diff so corrections are easy to spot. */
function printDiff(before: TrackItem[], after: TrackItem[]): number {
  let changes = 0
  const max = Math.max(before.length, after.length)
  for (let i = 0; i < max; i++) {
    const a = before[i]
    const b = after[i]
    const n = String(i + 1).padStart(2)
    if (a && b) {
      if (label(a) === label(b)) {
        console.log(`  ${n}  =  ${label(b)}`)
      } else {
        changes++
        console.log(`  ${n}  ~  ${label(a)}`)
        console.log(`      →  ${label(b)}`)
      }
    } else if (b) {
      changes++
      console.log(`  ${n}  +  ${label(b)}`)
    } else if (a) {
      changes++
      console.log(`  ${n}  -  ${label(a)}`)
    }
  }
  return changes
}

async function main() {
  const rl = createInterface({ input, output })
  const ask = async (labelText: string, fallback?: string) => {
    const answer = (await rl.question(`${labelText}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return answer || fallback || ''
  }
  const yesNo = async (labelText: string, fallback = true) =>
    ['y', 'yes'].includes((await ask(`${labelText} (y/n)`, fallback ? 'y' : 'n')).toLowerCase())

  try {
    if (dryRun) console.log('— DRY RUN: no file writes —\n')

    // 1) Pick an event that has a tracklist/playlist
    const events = readEvents()
    const candidates = events.filter((e) => isPastEvent(e) && (e.tracklist?.length || e.playlistId))
    if (candidates.length === 0) {
      throw new Error('No past events with a tracklist or playlistId found.')
    }
    console.log('Events with a tracklist:')
    candidates.forEach((e, i) =>
      console.log(
        `  ${i + 1}. ${e.title}  (${e.slug})` +
          `${e.playlistId ? ` — playlist ${e.playlistId}` : ' — no playlistId'}` +
          `${e.tracklist?.length ? `, ${e.tracklist.length} tracks` : ''}`
      )
    )
    const event = candidates[Number(await ask('Pick an event by number')) - 1]
    if (!event) throw new Error('Invalid selection.')

    // 2) Resolve the playlist id (stored by default; can override)
    let playlistId = event.playlistId ?? ''
    if (!playlistId) {
      console.log('\nThis event has no stored playlistId. Fetching playlists…')
      const playlists = listPlaylists()
      playlists.forEach((p) =>
        console.log(`  ${p.id}  ${p.name}${p.tracks ? `  (${p.tracks.length} tracks)` : ''}`)
      )
    }
    playlistId = await ask('Playlist id', playlistId || undefined)
    if (!playlistId) throw new Error('A playlist id is required.')

    // 3) Re-fetch + diff
    console.log(`\nFetching playlist ${playlistId} from groovenet…`)
    const nextTracklist = fetchPlaylistTracks(playlistId)
    if (nextTracklist.length === 0) throw new Error('That playlist is empty.')

    console.log('\nTracklist changes (old → new):')
    const changes = printDiff(event.tracklist ?? [], nextTracklist)
    if (changes === 0 && playlistId === event.playlistId) {
      console.log('\nNo changes — tracklist already matches groovenet. Nothing to do.')
      return
    }
    console.log(`\n${changes} change(s).`)

    if (!(await yesNo(`${dryRun ? 'Preview' : 'Save'} updated tracklist for "${event.slug}"`, true))) {
      console.log('Cancelled. No files were changed.')
      return
    }

    if (!dryRun) {
      const updated: PublicEvent = { ...event, playlistId, tracklist: nextTracklist }
      writeEvents(events.map((e) => (e.slug === event.slug ? updated : e)))
      console.log(`✓ Updated tracklist for "${event.slug}" in ${publicEventsPath.split('/').pop()}.`)
    } else {
      console.log('Preview complete. No files were changed.')
    }
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
