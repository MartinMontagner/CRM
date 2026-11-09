import { RefObject } from "react";

interface EditableTextSectionProps {
  editableText: string;
  updateEditableText: (text: string) => void;
  isMobileView: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  handleConvertToRabStyle: () => Promise<void>;
  isRabLoading: boolean;
  handleCopyToInput: () => void;
  onOpenFeedbackModal: ( assistantType: string ) => void;
}

const EditableTextSection: React.FC<EditableTextSectionProps> = ({
  editableText,
  updateEditableText,
  isMobileView,
  textareaRef,
  handleConvertToRabStyle,
  isRabLoading,
  handleCopyToInput,
  onOpenFeedbackModal
}) => {
  return (
    <div className="md:w-[46%] flex flex-col h-full">
      <label htmlFor="editable" className="block text-xs font-medium text-gray-700 mb-1">
        <span className="font-bold">3. </span>Texto a convertir
      </label>
      <textarea
        ref={textareaRef}
        id="editable"
        value={editableText}
        onChange={(e) => updateEditableText(e.target.value)}
        className={`w-full p-2 border border-gray-300 rounded-xl focus:ring-tertiary-500 focus:border-tertiary-500 flex-grow ${isMobileView ? 'h-32' : 'h-52'} resize-none text-xs mb-2`}
        placeholder="Escribe o edita aquí el texto que deseas enviar..."
      />
      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          onClick={onOpenFeedbackModal as () => void}
          className="px-1 py-1 rounded-md shadow-sm text-white text-xs bg-blue-600 hover:bg-blue-700"
        >
          Dar Feedback
        </button>
        <button
          onClick={handleConvertToRabStyle}
          disabled={!editableText.trim() || isRabLoading}
          className={`py-2 px-1 rounded-md shadow-sm text-xs font-medium bg-gray-400 text-white ${!editableText.trim() || isRabLoading
            ? 'cursor-not-allowed shadow-none'
            : 'hover:bg-gray-700'
            }`}
        >
          {isRabLoading ? (
            <span>Procesando...</span>
          ) : (
            <span>Convertir</span>
          )}
        </button>
        <button
          onClick={handleCopyToInput}
          disabled={!editableText.trim()}
          className={`py-2 px-1 rounded-md shadow-sm text-xs font-medium bg-gray-800 text-white ${!editableText.trim()
            ? 'cursor-not-allowed shadow-none'
            : 'hover:bg-gray-700'
            }`}
        >
          Añadir al chat
        </button>
      </div>
    </div>
  );
};

export default EditableTextSection;