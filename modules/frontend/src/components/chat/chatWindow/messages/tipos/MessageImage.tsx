import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useState } from "react";
import { MdBrokenImage } from "react-icons/md";

export const MessageImage = ({
  src,
  alt,
  onImageClick,
  sender
}: {
  src: string;
  alt: string;
  onImageClick: () => void;
  sender: string;
}) => {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageState("loaded");
  };

  const handleImageError = () => {
    setImageState("error");
  };

  // Calcular dimensiones para el contenedor (máximo 300x300, manteniendo aspect ratio)
  const getContainerDimensions = () => {
    if (
      imageState !== "loaded" ||
      !imageDimensions.width ||
      !imageDimensions.height
    ) {
      return { width: 200, height: 200 };
    }

    const maxSize = 300;
    const aspectRatio = imageDimensions.width / imageDimensions.height;

    let width = maxSize;
    let height = maxSize;

    if (aspectRatio > 1) {
      // Imagen más ancha que alta
      height = width / aspectRatio;
    } else {
      // Imagen más alta que ancha
      width = height * aspectRatio;
    }

    // Asegurar dimensiones mínimas
    width = Math.max(width, 150);
    height = Math.max(height, 150);

    return { width: Math.round(width), height: Math.round(height) };
  };

  const containerDimensions = getContainerDimensions();

  return (
    <div
      className="relative rounded-md overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
      style={containerDimensions}
      onClick={imageState === "loaded" ? onImageClick : undefined}
    >
      {/* Quien envio el mensaje */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-80 text-xs text-gray-800 rounded-md px-2 py-1">
        {sender}
      </div>
      {/* Estado de carga */}
      {imageState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="flex flex-col items-center gap-2">
            <LoadingIndicator className="w-8 h-8 text-gray-500" />
            <span className="text-xs text-gray-500">Cargando imagen...</span>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {imageState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <MdBrokenImage className="w-12 h-12" />
            <span className="text-xs text-center px-2">
              No se pudo cargar la imagen
            </span>
          </div>
        </div>
      )}

      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />

      {/* Overlay sutil al hover para indicar que es clickeable */}
      {imageState === "loaded" && (
        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-200" />
      )}
    </div>
  );
};