import { useState, useRef, useEffect } from "react";
import { 
  MdPlayArrow, 
  MdPause, 
  MdVolumeUp,
  MdDownload,
} from "react-icons/md";

export const MessageAudio = ({
  src,
  duration: initialDuration,
  isFromMe = false,
}: {
  src: string;
  duration?: number;
  isFromMe?: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generar waveform visual (simulado)
  const generateWaveform = () => {
    const bars = 40;
    return Array.from({ length: bars }, () => Math.random() * 100 + 20);
  };

  const [waveformData] = useState(generateWaveform);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || hasError) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const newTime = progress * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = `audio_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Colores basados en el emisor
  const colors = isFromMe ? {
    bg: 'bg-green-100',
    button: 'bg-green-500 hover:bg-green-600',
    progress: 'bg-green-500',
    progressBg: 'bg-green-200',
    text: 'text-green-700',
    waveform: 'bg-green-300',
    waveformActive: 'bg-green-500'
  } : {
    bg: 'bg-gray-100',
    button: 'bg-blue-500 hover:bg-blue-600',
    progress: 'bg-blue-500',
    progressBg: 'bg-gray-300',
    text: 'text-gray-700',
    waveform: 'bg-gray-300',
    waveformActive: 'bg-blue-500'
  };

  if (hasError) {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${colors.bg} 
        min-w-[240px] sm:min-w-[280px]`}>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colors.button} flex items-center justify-center opacity-50`}>
          <MdVolumeUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm ${colors.text} truncate`}>
            Error al cargar el audio
          </div>
        </div>
        <button
          onClick={handleDownload}
          className={`${colors.button} p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0`}
          title="Descargar audio"
        >
          <MdDownload className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${colors.bg} 
      min-w-[240px] sm:min-w-[280px] max-w-[300px] sm:max-w-[350px]`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colors.button} flex items-center justify-center transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <MdPause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <MdPlayArrow className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
        )}
      </button>

      {/* Waveform and Progress */}
      <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
        {/* Visual waveform */}
        <div className="flex items-end gap-0.5 h-6 sm:h-8 overflow-hidden" onClick={handleProgressClick}>
          {waveformData.map((height, index) => {
            const isActive = (index / waveformData.length) * 100 <= progressPercentage;
            return (
              <div
                key={index}
                className={`flex-shrink-0 w-0.5 sm:w-1 transition-colors cursor-pointer hover:opacity-80 ${
                  isActive ? colors.waveformActive : colors.waveform
                }`}
                style={{ 
                  height: `${Math.max(height * 0.25, 6)}px`,
                  minHeight: '3px'
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className={`flex justify-between text-xs ${colors.text}`}>
          <span className="font-mono">{formatTime(currentTime)}</span>
          <span className="font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className={`${colors.button} p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0`}
        title="Descargar audio"
      >
        <MdDownload className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      </button>
    </div>
  );
};