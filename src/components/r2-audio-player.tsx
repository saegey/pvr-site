import React, { useRef, useState } from 'react';
import { Box, useThemeUI } from 'theme-ui';
import { IoPlay, IoPause, IoVolumeHigh, IoVolumeMedium, IoVolumeMute, IoDownload } from 'react-icons/io5';

interface R2AudioPlayerProps {
  url: string;
  title?: string;
  showDownload?: boolean;
}

// Helper function to track audio events in Google Analytics
const trackAudioEvent = (action: string, url: string, title?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: 'Audio Player',
      event_label: title || url,
      audio_url: url,
      value: value,
    });
  }
};

const R2AudioPlayer = ({ url, title, showDownload = true }: R2AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [trackedMilestones, setTrackedMilestones] = useState<Set<number>>(new Set());
  const { colorMode } = useThemeUI();
  const isDarkMode = colorMode === 'dark';

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        trackAudioEvent('pause', url, title, Math.round(currentTime));
      } else {
        audioRef.current.play();
        trackAudioEvent('play', url, title, Math.round(currentTime));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Track playback milestones
      if (duration > 0) {
        const progress = (audioRef.current.currentTime / duration) * 100;
        const milestones = [25, 50, 75, 100];

        milestones.forEach(milestone => {
          if (progress >= milestone && !trackedMilestones.has(milestone)) {
            trackAudioEvent(`playback_${milestone}%`, url, title, milestone);
            setTrackedMilestones(prev => new Set(prev).add(milestone));
          }
        });
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    trackAudioEvent('download', url, title);
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: 3,
        borderRadius: '10px',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        border: '1px solid',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      {title && (
        <Box
          sx={{
            fontSize: 2,
            fontWeight: 'bold',
            marginBottom: 2,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          {title}
        </Box>
      )}

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Play/Pause Button and Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={togglePlay}
            sx={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isDarkMode ? 'white' : 'black',
              color: isDarkMode ? 'black' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {isPlaying ? <IoPause size={20} /> : <IoPlay size={20} />}
          </button>

          {/* Time Display */}
          <Box
            sx={{
              fontSize: 1,
              fontFamily: 'monospace',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              flex: 1,
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Box>

          {/* Volume Controls */}
          <Box sx={{ display: ['none', 'flex'], alignItems: 'center', gap: 1 }}>
            <button
              onClick={toggleMute}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: 0,
                color: isDarkMode ? 'white' : 'black',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
            >
              {isMuted || volume === 0 ? (
                <IoVolumeMute size={20} />
              ) : volume < 0.5 ? (
                <IoVolumeMedium size={20} />
              ) : (
                <IoVolumeHigh size={20} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              sx={{
                width: '80px',
                height: '4px',
                borderRadius: '2px',
                outline: 'none',
                background: `linear-gradient(to right, ${
                  isDarkMode ? '#fff' : '#000'
                } 0%, ${isDarkMode ? '#fff' : '#000'} ${
                  (isMuted ? 0 : volume) * 100
                }%, ${
                  isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                } ${(isMuted ? 0 : volume) * 100}%, ${
                  isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                } 100%)`,
                WebkitAppearance: 'none',
                '&::-webkit-slider-thumb': {
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? 'white' : 'black',
                  cursor: 'pointer',
                },
                '&::-moz-range-thumb': {
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? 'white' : 'black',
                  cursor: 'pointer',
                  border: 'none',
                },
              }}
            />
          </Box>

          {/* Download Button */}
          {showDownload && (
            <button
              onClick={handleDownload}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: 0,
                color: isDarkMode ? 'white' : 'black',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
              title="Download"
            >
              <IoDownload size={20} />
            </button>
          )}
        </Box>

        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          sx={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            background: `linear-gradient(to right, ${
              isDarkMode ? '#fff' : '#000'
            } 0%, ${isDarkMode ? '#fff' : '#000'} ${
              (currentTime / duration) * 100
            }%, ${
              isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
            } ${(currentTime / duration) * 100}%, ${
              isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
            } 100%)`,
            WebkitAppearance: 'none',
            '&::-webkit-slider-thumb': {
              WebkitAppearance: 'none',
              appearance: 'none',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: isDarkMode ? 'white' : 'black',
              cursor: 'pointer',
            },
            '&::-moz-range-thumb': {
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: isDarkMode ? 'white' : 'black',
              cursor: 'pointer',
              border: 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default R2AudioPlayer;
