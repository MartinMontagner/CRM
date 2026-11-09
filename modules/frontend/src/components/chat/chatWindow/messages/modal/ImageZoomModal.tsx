import { MdClose, MdDownload } from "react-icons/md";

export const ImageZoomModal = ({
  src,
  alt,
  isOpen,
  onClose,
}: {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = alt || "imagen";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error al descargar la imagen:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Header con botones */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
          title="Descargar imagen"
        >
          <MdDownload className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
          title="Cerrar"
        >
          <MdClose className="w-5 h-5" />
        </button>
      </div>

      {/* Imagen centrada */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};