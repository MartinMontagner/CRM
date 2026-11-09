import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useState, useRef } from "react";
import { 
  MdBrokenImage, 
  MdPlayArrow, 
  MdPause, 
  MdVolumeOff, 
  MdVolumeUp,
  MdFullscreen,
  MdDownload
} from "react-icons/md";

export const MessageVideo = ({
  src,
  onVideoClick,
  sender,
}: {
  src: string;
  alt: string;
  onVideoClick: () => void;
  sender: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    setVideoDimensions({
      width: video.videoWidth,
      height: video.videoHeight,
    });
    setDuration(video.duration);
    setVideoState("loaded");
  };

  const handleVideoError = () => {
    setVideoState("error");
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
    onVideoClick();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = `video_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const newTime = progress * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular dimensiones para el contenedor (máximo 350x300, manteniendo aspect ratio)
  const getContainerDimensions = () => {
    if (
      videoState !== "loaded" ||
      !videoDimensions.width ||
      !videoDimensions.height
    ) {
      return { width: 280, height: 200 };
    }

    const maxWidth = 350;
    const maxHeight = 300;
    const aspectRatio = videoDimensions.width / videoDimensions.height;

    let width = maxWidth;
    let height = maxHeight;

    if (aspectRatio > maxWidth / maxHeight) {
      // Video más ancho - limitar por ancho
      height = width / aspectRatio;
    } else {
      // Video más alto - limitar por alto
      width = height * aspectRatio;
    }

    // Asegurar dimensiones mínimas
    width = Math.max(width, 200);
    height = Math.max(height, 150);

    return { width: Math.round(width), height: Math.round(height) };
  };

  const containerDimensions = getContainerDimensions();
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative rounded-md overflow-hidden shadow-sm bg-gray-900 cursor-pointer group"
      style={containerDimensions}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={handleFullscreen}
    >
      {/* Quien envió el mensaje */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-80 text-xs text-gray-800 rounded-md px-2 py-1">
        {sender}
      </div>
      {/* Estado de carga */}
      {videoState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center gap-2">
            <LoadingIndicator className="w-8 h-8 text-gray-300" />
            <span className="text-xs text-gray-300">Cargando video...</span>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {videoState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <MdBrokenImage className="w-12 h-12" />
            <span className="text-xs text-center px-2">
              No se pudo cargar el video
            </span>
          </div>
        </div>
      )}

      {/* Video real */}
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          videoState === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoadedMetadata={handleVideoLoad}
        onError={handleVideoError}
        onTimeUpdate={handleTimeUpdate}
        muted={isMuted}
        playsInline
        preload="metadata"
      />

      {/* Overlay con controles */}
      {videoState === "loaded" && (
        <>
          {/* Overlay oscuro sutil */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
          
          {/* Botón de play/pause central */}
          {(!isPlaying || showControls) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="bg-black bg-opacity-70 hover:bg-opacity-80 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
              >
                {isPlaying ? (
                  <MdPause className="w-8 h-8" />
                ) : (
                  <MdPlayArrow className="w-8 h-8" />
                )}
              </button>
            </div>
          )}

          {/* Controles inferiores */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Barra de progreso */}
            <div className="px-3 pb-2">
              <div 
                className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-200"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? (
                    <MdPause className="w-4 h-4" />
                  ) : (
                    <MdPlayArrow className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={handleMuteToggle}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? (
                    <MdVolumeOff className="w-4 h-4" />
                  ) : (
                    <MdVolumeUp className="w-4 h-4" />
                  )}
                </button>

                <span className="text-white text-xs">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleDownload}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Descargar video"
                >
                  <MdDownload className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Ver en pantalla completa"
                >
                  <MdFullscreen className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Duración del video (esquina superior derecha) */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {formatTime(duration)}
          </div>
        </>
      )}
    </div>
  );
};