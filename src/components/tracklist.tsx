import React from 'react'
import TracklistRow from './tracklist-row'
import type { TrackItem } from '../types/content'

const PREVIEW_COUNT = 10

/**
 * Renders a tracklist preview (first PREVIEW_COUNT rows) with a "View all"
 * button that opens the complete list in a full-screen modal. Keeps long
 * playlists from burying the content below them (photos, RSVP, etc.).
 *
 * Shared by show-template and public-event-template.
 */
const Tracklist: React.FC<{ tracks: TrackItem[] }> = ({ tracks }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const scrollPosition = React.useRef(0)

  // iOS Safari lets the document scroll behind a fixed overlay unless the
  // document itself is frozen. Keeping its current offset lets us restore the
  // page exactly where the listener opened the tracklist when the modal closes.
  React.useEffect(() => {
    if (!isOpen) return

    const { body, documentElement } = document
    scrollPosition.current = window.scrollY
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    const previousHtmlOverflow = documentElement.style.overflow

    body.style.position = 'fixed'
    body.style.top = `-${scrollPosition.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'

    return () => {
      Object.assign(body.style, previousBodyStyles)
      documentElement.style.overflow = previousHtmlOverflow
      window.scrollTo(0, scrollPosition.current)
    }
  }, [isOpen])

  if (!tracks || tracks.length === 0) return null

  return (
    <>
      {tracks.slice(0, PREVIEW_COUNT).map((track, index) => (
        <TracklistRow key={`${track.artist}-${track.title}-${index}`} track={track} index={index} />
      ))}
      {tracks.length > PREVIEW_COUNT && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs tracking-[1.5px] uppercase border border-fg px-4 py-3 hover:bg-fg hover:text-bg transition-colors"
          >
            View all {tracks.length} tracks
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Full tracklist"
        >
          <div className="shrink-0 bg-bg border-b border-fg/12">
            <div className="max-w-3xl mx-auto px-8 py-5 sm:px-12 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[2px] uppercase text-fg/55">Tracklist</p>
                <p className="mt-1 text-xs text-fg/55">{tracks.length} tracks</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs tracking-[1.5px] uppercase border border-fg px-4 py-3 hover:bg-fg hover:text-bg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="flex-1 min-h-0 overflow-y-scroll"
            style={{
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
          >
            <div className="max-w-3xl mx-auto px-8 pb-8 sm:px-12 sm:pb-12">
              {tracks.map((track, index) => (
                <TracklistRow key={`${track.artist}-${track.title}-${index}`} track={track} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Tracklist
