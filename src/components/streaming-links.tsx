import React, { useEffect, useRef, useState } from 'react'
import { FaApple, FaSpotify, FaPlay, FaYoutube } from 'react-icons/fa'
import { SiDiscogs } from 'react-icons/si'
import { IoEllipsisHorizontal } from 'react-icons/io5'
import { trackStreamClickDeduped } from '../utils/analytics'

type Props = {
  discogs_url?: string | null
  apple_music_url?: string | null
  spotify_url?: string | null
  soundcloud_url?: string | null
  youtube_url?: string | null
  trackingLocation?: string
  showSlug?: string
  trackTitle?: string
}

const SERVICES = [
  { key: 'discogs',     label: 'Discogs',      Icon: SiDiscogs  },
  { key: 'apple_music', label: 'Apple Music',  Icon: FaApple    },
  { key: 'spotify',     label: 'Spotify',      Icon: FaSpotify  },
  { key: 'soundcloud',  label: 'SoundCloud',   Icon: FaPlay     },
  { key: 'youtube',     label: 'YouTube',      Icon: FaYoutube  },
] as const

const StreamingLinks: React.FC<Props> = ({
  discogs_url,
  apple_music_url,
  spotify_url,
  soundcloud_url,
  youtube_url,
  trackingLocation = 'streaming_links',
  showSlug,
  trackTitle,
}) => {
  const urlMap: Record<string, string | null | undefined> = {
    discogs: discogs_url,
    apple_music: apple_music_url,
    spotify: spotify_url,
    soundcloud: soundcloud_url,
    youtube: youtube_url,
  }

  const available = SERVICES.filter((s) => !!urlMap[s.key])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (available.length === 0) return null

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v) }}
        className="w-7 h-7 flex items-center justify-center text-fg/35 hover:text-fg transition-colors duration-150"
        aria-label="Streaming links"
      >
        <IoEllipsisHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 z-50 border border-fg/16 bg-bg min-w-[160px]">
          {available.map(({ key, label, Icon }) => {
            const url = urlMap[key] as string
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-fg/60 hover:text-fg hover:bg-fg/[0.04] transition-colors duration-100"
                onMouseDown={() =>
                  trackStreamClickDeduped({
                    service: key,
                    linkUrl: url,
                    location: trackingLocation,
                    showSlug,
                    trackTitle,
                  })
                }
                onClick={() => setOpen(false)}
              >
                <Icon size={14} />
                <span className="tracking-[0.5px]">{label}</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StreamingLinks
