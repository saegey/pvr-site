/**
 * Shared groovenet CLI helpers for the event scripts.
 *
 * Shells out to the built groovenet CLI (JSON output). Path resolves from
 * GROOVENET_BIN or defaults to the local dj-playlist build. Set the API base
 * once with `groovenet config set api_base <url>`.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execFileSync } from 'node:child_process'
import type { TrackItem } from '../../src/types/content.ts'

const GROOVENET_BIN =
  process.env.GROOVENET_BIN ||
  join(homedir(), 'Projects/dj-playlist/packages/groovenet-cli/build/bin/groovenet.js')

export type CliPlaylist = { id: string | number; name: string; tracks?: unknown[] }

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

/** Run `groovenet <args> --json` and parse the result. */
export function groovenetJson<T>(args: string[]): T {
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

/**
 * Map a groovenet track to the shared TrackItem shape (snake_case) used by the
 * show + event tracklist components. Spotify is intentionally omitted.
 */
export const toTrack = (t: CliTrack): TrackItem => ({
  title: t.title,
  artist: t.artist,
  ...(t.album ? { album: t.album } : {}),
  ...(t.year != null && t.year !== '' ? { year: String(t.year) } : {}),
  ...(t.duration_seconds != null ? { duration_seconds: t.duration_seconds } : {}),
  ...(t.discogs_url ? { discogs_url: t.discogs_url } : {}),
  ...(t.apple_music_url ? { apple_music_url: t.apple_music_url } : {}),
  ...(t.youtube_url ? { youtube_url: t.youtube_url } : {}),
})

/** List all playlists. */
export const listPlaylists = (): CliPlaylist[] => groovenetJson<CliPlaylist[]>(['playlists', 'list'])

/** Fetch a playlist's tracks, mapped to TrackItem. */
export const fetchPlaylistTracks = (id: string): TrackItem[] =>
  groovenetJson<CliTrack[]>(['playlists', 'show', id]).map(toTrack)
