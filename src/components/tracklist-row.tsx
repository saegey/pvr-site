import React from 'react'
import StreamingLinks from './streaming-links'
import type { TrackItem } from '../types/content'

const formatDuration = (seconds?: number) => {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * A single track row used by both the show tracklist (show-template) and the
 * event recap tracklist (public-event-template). Expects the groovenet track
 * shape (snake_case URLs); missing links are hidden by StreamingLinks.
 */
const TracklistRow = ({ track, index }: { track: TrackItem; index: number }) => (
  <div className="flex items-center gap-4 py-4 border-b border-fg/12 hover:bg-fg/[0.02] transition-colors -mx-4 px-4">
    <span className="text-xs text-fg/30 w-6 shrink-0 tabular-nums">
      {String(index + 1).padStart(2, '0')}
    </span>
    <div className="flex-1 min-w-0">
      <p
        className="text-fg leading-snug truncate"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '15px' }}
      >
        {track.title}
      </p>
      <p className="text-xs text-fg/55 truncate mt-0.5">
        {track.artist}
        {track.album && (
          <span className="text-fg/35">
            {' — '}{track.album}{track.year ? ` (${track.year})` : ''}
          </span>
        )}
      </p>
    </div>
    {!!track.duration_seconds && (
      <span className="text-xs text-fg/35 tabular-nums shrink-0">
        {formatDuration(track.duration_seconds)}
      </span>
    )}
    <StreamingLinks
      discogs_url={track.discogs_url}
      apple_music_url={track.apple_music_url}
      spotify_url={track.spotify_url}
      soundcloud_url={track.soundcloud_url}
      youtube_url={track.youtube_url}
    />
  </div>
)

export default TracklistRow
