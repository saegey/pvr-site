import React, { useRef, useState } from 'react'
import { IoPlay, IoPause, IoVolumeHigh, IoVolumeMedium, IoVolumeMute, IoDownload } from 'react-icons/io5'

interface R2AudioPlayerProps {
  url: string
  title?: string
  showDownload?: boolean
}

const trackAudioEvent = (action: string, url: string, title?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: 'Audio Player',
      event_label: title || url,
      audio_url: url,
      value,
    })
  }
}

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const R2AudioPlayer = ({ url, title, showDownload = true }: R2AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [trackedMilestones, setTrackedMilestones] = useState<Set<number>>(new Set())

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      trackAudioEvent('pause', url, title, Math.round(currentTime))
    } else {
      audioRef.current.play()
      trackAudioEvent('play', url, title, Math.round(currentTime))
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
    if (duration > 0) {
      const progress = (audioRef.current.currentTime / duration) * 100
      ;[25, 50, 75, 100].forEach((milestone) => {
        if (progress >= milestone && !trackedMilestones.has(milestone)) {
          trackAudioEvent(`playback_${milestone}%`, url, title, milestone)
          setTrackedMilestones((prev) => new Set(prev).add(milestone))
        }
      })
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
    if (v > 0 && isMuted) setIsMuted(false)
  }

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleDownload = () => {
    trackAudioEvent('download', url, title)
    const link = document.createElement('a')
    link.href = url
    link.download = title || 'audio.mp3'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const volPct = (isMuted ? 0 : volume) * 100
  const trackStyle = (fill: number) =>
    `linear-gradient(to right, rgb(236 236 230) 0%, rgb(236 236 230) ${fill}%, rgba(236,236,230,0.15) ${fill}%, rgba(236,236,230,0.15) 100%)`

  return (
    <div className="border border-fg/16 p-6 my-8">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Header row */}
      <div className="flex items-center gap-4 mb-5">
        {/* Circular play button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full border border-fg/40 flex items-center justify-center text-fg hover:border-fg transition-colors shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <IoPause size={16} /> : <IoPlay size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-[1px] uppercase text-fg/75 truncate">
            {title || 'Listen to the full set'}
          </p>
          <p className="text-[11px] text-fg/35 mt-0.5">
            Recorded live
          </p>
        </div>

        {/* Volume (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-fg/50 hover:text-fg transition-colors"
            aria-label="Toggle mute"
          >
            {isMuted || volume === 0 ? (
              <IoVolumeMute size={18} />
            ) : volume < 0.5 ? (
              <IoVolumeMedium size={18} />
            ) : (
              <IoVolumeHigh size={18} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-px cursor-pointer appearance-none"
            style={{ background: trackStyle(volPct) }}
          />
        </div>

        {/* Download */}
        {showDownload && (
          <button
            onClick={handleDownload}
            className="text-fg/40 hover:text-fg transition-colors"
            title="Download"
            aria-label="Download"
          >
            <IoDownload size={18} />
          </button>
        )}
      </div>

      {/* Progress row */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-fg/35 tabular-nums w-10 shrink-0">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-px cursor-pointer appearance-none"
          style={{ background: trackStyle(pct) }}
        />
        <span className="text-[11px] text-fg/35 tabular-nums w-10 shrink-0 text-right">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default R2AudioPlayer
