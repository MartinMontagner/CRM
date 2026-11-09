import { useEffect, useState } from "react";
import { MdClose, MdDownload, MdZoomIn, MdZoomOut, MdFullscreen } from "react-icons/md";

interface DocumentModalProps {
  src: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentModal = ({ 
  src, 
  fileName, 
  fileType, 
  isOpen, 
  onClose 
}: DocumentModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setIsLoading(true);
      setHasError(false);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar teclas
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          setZoom(1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header con controles */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium truncate max-w-md" title={fileName}>
            {fileName.length > 5 ? fileName.slice(0, 5) + '...' : fileName}
          </h3>
          <span className="text-sm text-gray-300 uppercase">
            {fileType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de zoom para imágenes */}
          {fileType === 'image' && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                disabled={zoom <= 0.5}
                title="Alejar (tecla -)"
              >
                <MdZoomOut className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-mono min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                disabled={zoom >= 3}
                title="Acercar (tecla +)"
              >
                <MdZoomIn className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-gray-500 mx-1" />
            </>
          )}

          {/* Botón de pantalla completa */}
          <button
            onClick={handleFullscreen}
            className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            title="Pantalla completa"
          >
            <MdFullscreen className="w-5 h-5" />
          </button>

          {/* Botón de descarga */}
          <button
            onClick={handleDownload}
            className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            title="Descargar archivo"
          >
            <MdDownload className="w-5 h-5" />
          </button>

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            title="Cerrar (Esc)"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Contenido del documento */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <span>Cargando {fileType === 'pdf' ? 'PDF' : 'imagen'}...</span>
          </div>
        )}

        {hasError && (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="text-6xl">📄</div>
            <div className="text-center">
              <p className="text-lg mb-2">No se pudo cargar el archivo</p>
              <p className="text-gray-300">Intenta descargarlo para verlo</p>
            </div>
          </div>
        )}

        {!hasError && (
          <>
            {fileType === 'pdf' ? (
              <iframe
                src={src}
                className={`w-full h-full bg-white rounded ${isLoading ? 'hidden' : 'block'}`}
                onLoad={handleLoad}
                onError={handleError}
                title={fileName}
              />
            ) : (
              <img
                src={src}
                alt={fileName}
                className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
                  isLoading ? 'hidden' : 'block'
                }`}
                style={{ 
                  transform: `scale(${zoom})`,
                  cursor: zoom > 1 ? 'grab' : 'default'
                }}
                onLoad={handleLoad}
                onError={handleError}
                draggable={false}
              />
            )}
          </>
        )}
      </div>

      {/* Footer con atajos de teclado */}
      <div className="p-3 bg-black bg-opacity-50 text-gray-300 text-xs">
        <div className="flex items-center justify-center gap-6">
          <span>Esc: Cerrar</span>
          {fileType === 'image' && (
            <>
              <span>+/-: Zoom</span>
              <span>0: Zoom original</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};