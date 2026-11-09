import { useEffect, useRef, useState } from "react";
import { MdClose, MdPlayArrow, MdPause, MdVolumeOff, MdVolumeUp, MdDownload } from "react-icons/md";

interface VideoZoomModalProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoZoomModal = ({ src, isOpen, onClose }: VideoZoomModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
        case 'm':
          handleMuteToggle();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, volume, onClose]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowControls(true);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    setShowControls(true);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;

    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
    setShowControls(true);
  };

  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setShowControls(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const newTime = progress * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    fetch(src)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `video_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      onMouseMove={handleMouseMove}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-200 z-10 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <MdClose className="w-8 h-8" />
    </button>

    {/* Video container */}
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-full object-contain"
        onLoadedMetadata={handleVideoLoad}
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayPause}
        autoPlay
      />

      {/* Play/Pause button overlay */}
      {(!isPlaying || showControls) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={handlePlayPause}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-200 hover:scale-110 pointer-events-auto"
          >
            {isPlaying ? (
              <MdPause className="w-12 h-12" />
            ) : (
              <MdPlayArrow className="w-12 h-12" />
            )}
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div 
            className="w-full h-2 bg-white bg-opacity-30 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full transition-all duration-200 group-hover:bg-blue-400"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between px-6 pb-6">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? (
                <MdPause className="w-6 h-6" />
              ) : (
                <MdPlayArrow className="w-6 h-6" />
              )}
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <MdVolumeOff className="w-5 h-5" />
                ) : (
                  <MdVolumeUp className="w-5 h-5" />
                )}
              </button>

              <div className="w-20 h-1 bg-white bg-opacity-30 rounded-full cursor-pointer group">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-200 group-hover:bg-blue-400"
                  style={{ width: `${volume * 100}%` }}
                  onClick={(e) => {
                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newVolume = clickX / rect.width;
                    handleVolumeChange(Math.max(0, Math.min(1, newVolume)));
                  }}
                />
              </div>
            </div>

            {/* Time display */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="text-white hover:text-gray-300 transition-colors"
              title="Descargar video"
            >
              <MdDownload className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className={`absolute top-4 left-4 text-white text-xs bg-black bg-opacity-50 p-3 rounded transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="space-y-1">
          <div>Espacio: Play/Pausa</div>
          <div>← →: Retroceder/Avanzar 5s</div>
          <div>↑ ↓: Subir/Bajar volumen</div>
          <div>M: Silenciar</div>
          <div>Esc: Cerrar</div>
        </div>
      </div>
    </div>
  </div>
);
};