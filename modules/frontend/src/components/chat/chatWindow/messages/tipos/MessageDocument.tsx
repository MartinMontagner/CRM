import { useState } from "react";
import { 
  MdPictureAsPdf,
  MdImage,
  MdDescription,
  MdArchive,
  MdTableChart,
  MdSlideshow,
  MdVideoFile,
  MdAudioFile,
  MdCode,
  MdDownload,
  MdVisibility,
  MdInsertDriveFile
} from "react-icons/md";

interface MessageDocumentProps {
  src: string;
  fileName: string;
  fileType?: string; // Viene directo de la API
  fileSize?: string;
  isFromMe?: boolean;
  onDocumentClick?: () => void;
}

export const MessageDocument = ({
  src,
  fileName,
  fileType,
  fileSize,
  isFromMe = false,
  onDocumentClick,
}: MessageDocumentProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Obtener extensión del archivo como fallback
  const getFileExtension = (name: string): string => {
    return name.split('.').pop()?.toLowerCase() || '';
  };

  // Obtener tipo de archivo basado en fileType de la API o extensión como fallback
  const getFileInfo = (apiFileType?: string, fileName?: string): {
    type: 'pdf' | 'image' | 'document' | 'spreadsheet' | 'presentation' | 'video' | 'audio' | 'archive' | 'code' | 'other';
    displayName: string;
  } => {
    // Usar fileType de la API si está disponible
    const extension = apiFileType?.toLowerCase() || getFileExtension(fileName || '');
    
    const fileTypes = new Map([
      // PDFs
      ['pdf', { type: 'pdf' as const, displayName: 'PDF' }],
      
      // Imágenes
      ['jpg', { type: 'image' as const, displayName: 'Imagen JPG' }],
      ['jpeg', { type: 'image' as const, displayName: 'Imagen JPEG' }],
      ['png', { type: 'image' as const, displayName: 'Imagen PNG' }],
      ['gif', { type: 'image' as const, displayName: 'Imagen GIF' }],
      ['svg', { type: 'image' as const, displayName: 'Imagen SVG' }],
      ['webp', { type: 'image' as const, displayName: 'Imagen WebP' }],
      ['bmp', { type: 'image' as const, displayName: 'Imagen BMP' }],
      ['tiff', { type: 'image' as const, displayName: 'Imagen TIFF' }],
      ['ico', { type: 'image' as const, displayName: 'Imagen ICO' }],
      
      // Documentos
      ['doc', { type: 'document' as const, displayName: 'Documento Word' }],
      ['docx', { type: 'document' as const, displayName: 'Documento Word' }],
      ['txt', { type: 'document' as const, displayName: 'Archivo de texto' }],
      ['rtf', { type: 'document' as const, displayName: 'Documento RTF' }],
      ['odt', { type: 'document' as const, displayName: 'Documento ODT' }],
      
      // Hojas de cálculo
      ['xls', { type: 'spreadsheet' as const, displayName: 'Hoja Excel' }],
      ['xlsx', { type: 'spreadsheet' as const, displayName: 'Hoja Excel' }],
      ['csv', { type: 'spreadsheet' as const, displayName: 'Archivo CSV' }],
      ['ods', { type: 'spreadsheet' as const, displayName: 'Hoja Calc' }],
      
      // Presentaciones
      ['ppt', { type: 'presentation' as const, displayName: 'Presentación PowerPoint' }],
      ['pptx', { type: 'presentation' as const, displayName: 'Presentación PowerPoint' }],
      ['odp', { type: 'presentation' as const, displayName: 'Presentación ODP' }],
      
      // Videos
      ['mp4', { type: 'video' as const, displayName: 'Video MP4' }],
      ['avi', { type: 'video' as const, displayName: 'Video AVI' }],
      ['mov', { type: 'video' as const, displayName: 'Video MOV' }],
      ['wmv', { type: 'video' as const, displayName: 'Video WMV' }],
      ['mkv', { type: 'video' as const, displayName: 'Video MKV' }],
      ['webm', { type: 'video' as const, displayName: 'Video WebM' }],
      ['flv', { type: 'video' as const, displayName: 'Video FLV' }],
      
      // Audios
      ['mp3', { type: 'audio' as const, displayName: 'Audio MP3' }],
      ['wav', { type: 'audio' as const, displayName: 'Audio WAV' }],
      ['m4a', { type: 'audio' as const, displayName: 'Audio M4A' }],
      ['flac', { type: 'audio' as const, displayName: 'Audio FLAC' }],
      ['aac', { type: 'audio' as const, displayName: 'Audio AAC' }],
      ['ogg', { type: 'audio' as const, displayName: 'Audio OGG' }],
      
      // Archivos comprimidos
      ['zip', { type: 'archive' as const, displayName: 'Archivo ZIP' }],
      ['rar', { type: 'archive' as const, displayName: 'Archivo RAR' }],
      ['7z', { type: 'archive' as const, displayName: 'Archivo 7Z' }],
      ['tar', { type: 'archive' as const, displayName: 'Archivo TAR' }],
      ['gz', { type: 'archive' as const, displayName: 'Archivo GZ' }],
      
      // Código
      ['js', { type: 'code' as const, displayName: 'JavaScript' }],
      ['ts', { type: 'code' as const, displayName: 'TypeScript' }],
      ['jsx', { type: 'code' as const, displayName: 'React JSX' }],
      ['tsx', { type: 'code' as const, displayName: 'React TSX' }],
      ['html', { type: 'code' as const, displayName: 'HTML' }],
      ['css', { type: 'code' as const, displayName: 'CSS' }],
      ['json', { type: 'code' as const, displayName: 'JSON' }],
      ['xml', { type: 'code' as const, displayName: 'XML' }],
      ['py', { type: 'code' as const, displayName: 'Python' }],
      ['java', { type: 'code' as const, displayName: 'Java' }],
      ['php', { type: 'code' as const, displayName: 'PHP' }],
      ['c', { type: 'code' as const, displayName: 'C' }],
      ['cpp', { type: 'code' as const, displayName: 'C++' }],
      ['cs', { type: 'code' as const, displayName: 'C#' }],
      ['sql', { type: 'code' as const, displayName: 'SQL' }],
    ]);

    return fileTypes.get(extension) || { 
      type: 'other' as const, 
      displayName: extension ? extension.toUpperCase() : 'Archivo' 
    };
  };

  // Obtener icono basado en el tipo
  const getFileIcon = (type: string) => {
    const iconClass = "w-8 h-8";
    
    switch (type) {
      case 'pdf':
        return <MdPictureAsPdf className={`${iconClass} text-red-500`} />;
      case 'image':
        return <MdImage className={`${iconClass} text-blue-500`} />;
      case 'document':
        return <MdDescription className={`${iconClass} text-blue-600`} />;
      case 'spreadsheet':
        return <MdTableChart className={`${iconClass} text-green-600`} />;
      case 'presentation':
        return <MdSlideshow className={`${iconClass} text-orange-600`} />;
      case 'video':
        return <MdVideoFile className={`${iconClass} text-purple-600`} />;
      case 'audio':
        return <MdAudioFile className={`${iconClass} text-pink-600`} />;
      case 'archive':
        return <MdArchive className={`${iconClass} text-yellow-600`} />;
      case 'code':
        return <MdCode className={`${iconClass} text-gray-600`} />;
      default:
        return <MdInsertDriveFile className={`${iconClass} text-gray-500`} />;
    }
  };

  // Verificar si se puede previsualizar
  const canPreview = (type: string): boolean => {
    return type === 'pdf' || type === 'image';
  };

  // Formatear el nombre del archivo para mostrar
  const getDisplayFileName = (name: string): string => {
    // Si es "Archivo sin nombre" y tenemos fileType, generar un nombre más descriptivo
    if (name === "Archivo sin nombre" && fileType) {
      return `Documento.${fileType}`;
    }
    return name;
  };

  const fileInfo = getFileInfo(fileType, fileName);
  const canShowPreview = canPreview(fileInfo.type);
  const displayFileName = getDisplayFileName(fileName);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = src;
      link.download = displayFileName;
      link.target = '_blank';
      
      // Para URLs firmadas de S3, abrir en nueva pestaña para iniciar descarga
      if (src.includes('X-Amz-Algorithm')) {
        window.open(src, '_blank');
      } else {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      // Fallback: abrir en nueva pestaña
      window.open(src, '_blank');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (canShowPreview && onDocumentClick) {
      onDocumentClick();
    }
  };

  // Colores basados en el emisor
  const colors = isFromMe ? {
    bg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
    button: 'bg-green-500 hover:bg-green-600',
    buttonSecondary: 'bg-green-100 hover:bg-green-200 text-green-600',
    text: 'text-green-700',
    textSecondary: 'text-green-600'
  } : {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
    button: 'bg-blue-500 hover:bg-blue-600',
    buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
    text: 'text-gray-700',
    textSecondary: 'text-gray-600'
  };

  return (
    <div className={`
      flex flex-col sm:flex-row items-center gap-3 p-4 rounded-lg border ${colors.bg} ${colors.border} 
      w-full min-w-[200px] sm:min-w-[280px] max-w-full sm:max-w-[400px] 
      ${canShowPreview ? `cursor-pointer ${colors.hover}` : ''}
      transition-colors duration-200
    `}
    onClick={handlePreview}
    >
      {/* Icono del archivo */}
      <div className="flex-shrink-0">
        {getFileIcon(fileInfo.type)}
      </div>

      {/* Información del archivo */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm sm:text-base ${colors.text} truncate`} title={displayFileName}>
          <p className="text-wrap">
            {displayFileName}
          </p>
        </div>
        <div className={`text-xs sm:text-sm ${colors.textSecondary} mt-0.5 flex items-center gap-2`}>
          <p className="text-wrap">{fileInfo.displayName}</p>
          {fileSize && (
            <>
              <span>•</span>
              <span>{fileSize}</span>
            </>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-1 flex-wrap flex-shrink-0">
        {/* Botón de vista previa (solo para PDF e imágenes) */}
        {canShowPreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePreview();
            }}
            className={`p-2 rounded-full ${colors.buttonSecondary} transition-colors`}
            title="Vista previa"
          >
            <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Botón de descarga */}
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={`p-2 rounded-full ${colors.button} transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Descargar archivo"
        >
          {isLoading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MdDownload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};