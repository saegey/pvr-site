import React, { useRef, useState, useEffect } from 'react';
import { IoPlay, IoPause, IoVolumeHigh, IoVolumeMedium, IoVolumeMute, IoDownload, IoPlaySkipForward, IoPlaySkipBack } from 'react-icons/io5';

interface Track {
  url: string;
  title: string;
  artist?: string;
  duration?: number;
}

interface R2PlaylistPlayerProps {
  tracks: Track[];
  autoplay?: boolean;
  showDownload?: boolean;
}

const trackAudioEvent = (action: string, url: string, title?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: 'Audio Player - Playlist',
      event_label: title || url,
      audio_url: url,
      value,
    });
  }
};

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const trackStyle = (fill: number) =>
  `linear-gradient(to right, rgb(236 236 230) 0%, rgb(236 236 230) ${fill}%, rgba(236,236,230,0.15) ${fill}%, rgba(236,236,230,0.15) 100%)`;

const R2PlaylistPlayer = ({ tracks, autoplay = false, showDownload = true }: R2PlaylistPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [trackedMilestones, setTrackedMilestones] = useState<Set<number>>(new Set());

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current && autoplay && currentTrackIndex === 0) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [autoplay, currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      trackAudioEvent('pause', currentTrack.url, currentTrack.title, Math.round(currentTime));
    } else {
      audioRef.current.play();
      trackAudioEvent('play', currentTrack.url, currentTrack.title, Math.round(currentTime));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    if (duration > 0) {
      const progress = (audioRef.current.currentTime / duration) * 100;
      [25, 50, 75, 100].forEach(milestone => {
        if (progress >= milestone && !trackedMilestones.has(milestone)) {
          trackAudioEvent(`playback_${milestone}%`, currentTrack.url, currentTrack.title, milestone);
          setTrackedMilestones(prev => new Set(prev).add(milestone));
        }
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    trackAudioEvent('download', currentTrack.url, currentTrack.title);
    const link = document.createElement('a');
    link.href = currentTrack.url;
    link.download = `${currentTrack.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playTrack = (index: number) => {
    const newTrack = tracks[index];
    trackAudioEvent('track_change', newTrack.url, newTrack.title, index);
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setTrackedMilestones(new Set());
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play();
    }
  };

  const playNext = () => { if (currentTrackIndex < tracks.length - 1) playTrack(currentTrackIndex + 1); };
  const playPrevious = () => { if (currentTrackIndex > 0) playTrack(currentTrackIndex - 1); };

  const handleEnded = () => {
    if (currentTrackIndex < tracks.length - 1) playTrack(currentTrackIndex + 1);
    else setIsPlaying(false);
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPct = (isMuted ? 0 : volume) * 100;

  const btnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'rgb(236 236 230)',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Current Track Info */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: 'rgb(236 236 230)' }}>
          {currentTrack.title}
        </div>
        {currentTrack.artist && (
          <div style={{ fontSize: '13px', color: 'rgba(236,236,230,0.7)' }}>
            {currentTrack.artist}
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Player Controls */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={playPrevious}
              disabled={currentTrackIndex === 0}
              style={{ ...btnStyle, opacity: currentTrackIndex === 0 ? 0.3 : 1, cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer' }}
            >
              <IoPlaySkipBack size={24} />
            </button>

            <button
              onClick={togglePlay}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgb(236 236 230)',
                color: 'rgb(11 11 10)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPlaying ? <IoPause size={20} /> : <IoPlay size={20} />}
            </button>

            <button
              onClick={playNext}
              disabled={currentTrackIndex === tracks.length - 1}
              style={{ ...btnStyle, opacity: currentTrackIndex === tracks.length - 1 ? 0.3 : 1, cursor: currentTrackIndex === tracks.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              <IoPlaySkipForward size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="h-px cursor-pointer appearance-none"
            style={{ width: '100%', background: trackStyle(pct) }}
          />

          {/* Time and Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(236,236,230,0.7)', flex: 1 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume (hidden on mobile via inline media hack — use className) */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '8px', display: 'flex' }}>
              <button onClick={toggleMute} style={btnStyle}>
                {isMuted || volume === 0 ? <IoVolumeMute size={20} /> : volume < 0.5 ? <IoVolumeMedium size={20} /> : <IoVolumeHigh size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="cursor-pointer appearance-none"
                style={{ width: '80px', height: '4px', background: trackStyle(volPct) }}
              />
            </div>

            {showDownload && (
              <button onClick={handleDownload} style={btnStyle} title="Download current track">
                <IoDownload size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {tracks.map((track, index) => (
          <div
            key={index}
            onClick={() => playTrack(index)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              backgroundColor: index === currentTrackIndex ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderBottom: index < tracks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => { if (index !== currentTrackIndex) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = index === currentTrackIndex ? 'rgba(255,255,255,0.1)' : 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(236,236,230,0.5)', width: '24px', flexShrink: 0 }}>
                {index === currentTrackIndex && isPlaying ? <IoPlay size={12} /> : index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: index === currentTrackIndex ? 'bold' : 'normal', color: 'rgb(236 236 230)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.title}
                </div>
                {track.artist && (
                  <div style={{ fontSize: '12px', color: 'rgba(236,236,230,0.6)' }}>
                    {track.artist}
                  </div>
                )}
              </div>
              {!!track.duration && (
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(236,236,230,0.5)', flexShrink: 0 }}>
                  {formatTime(track.duration)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default R2PlaylistPlayer;
