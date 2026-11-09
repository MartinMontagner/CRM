import { useState } from "react";
import { MdBrokenImage, MdDownload } from "react-icons/md";
import { toast } from "sonner";

interface MessageStickerProps {
  src: string;
  alt?: string;
}

export const MessageSticker = ({
  src,
  alt = "Sticker",
}: MessageStickerProps) => {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading");
  const [showControls, setShowControls] = useState(false);

  const handleImageLoad = () => {
    setImageState("loaded");
  };

  const handleImageError = () => {
    setImageState("error");
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src, { mode: 'cors' });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sticker_${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el sticker:", error);
      toast.error("No se pudo descargar el sticker. Inténtalo de nuevo más tarde.");
    }
  };

  // Tamaño fijo para stickers (como WhatsApp)
  const stickerSize = 120; // 120px x 120px

  if (imageState === "error") {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 select-none cursor-not-allowed"
        style={{ width: stickerSize, height: stickerSize }}
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <MdBrokenImage className="w-8 h-8" />
          <span className="text-xs text-center">Sticker no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative inline-block group cursor-pointer"
      style={{ width: stickerSize, height: stickerSize }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Estado de carga */}
      {imageState === "loading" && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width: stickerSize, height: stickerSize }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">Cargando...</span>
          </div>
        </div>
      )}

      {/* Sticker */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-all duration-300 ${
          imageState === "loaded" ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } hover:scale-105 active:scale-95`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        draggable={false}
        style={{ 
          width: stickerSize, 
          height: stickerSize,
          filter: imageState === "loaded" ? "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" : "none"
        }}
      />

      {/* Overlay con controles (solo visible en hover) */}
      {imageState === "loaded" && (
        <div className={`absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-end justify-end p-2 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleDownload}
            className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-1.5 rounded-full transition-all duration-200 hover:scale-110"
            title="Descargar sticker"
          >
            <MdDownload className="w-3 h-3" />
          </button>
        </div>
      )}

      
    </div>
  );
};