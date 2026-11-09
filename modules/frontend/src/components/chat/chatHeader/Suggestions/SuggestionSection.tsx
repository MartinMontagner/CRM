import { useState, useRef } from "react";
import { AssistantDTO } from "@/model/chats/Chat";
import { getAiSuggestion } from "@/service/chat/ChatService";
import SuggestionTypeSelector from "./SuggestionTypeSelector";
import SuggestionDisplay from "./SuggestionDisplay";
import EditableTextSection from "./EditableTextSection";
import { MdArrowCircleRight } from "react-icons/md";

interface SuggestionSectionProps {
  phoneNumber: string;
  editableText: string;
  updateEditableText: (text: string) => void;
  assistantOptions: AssistantDTO[];
  onSendSuggestion: (text: string) => void;
  onOpenFeedbackModal: (assistantType: string) => void;
  onClose: () => void;
  isMobileView: boolean;
}

const SuggestionSection: React.FC<SuggestionSectionProps> = ({
  phoneNumber,
  editableText,
  updateEditableText,
  assistantOptions,
  onSendSuggestion,
  onOpenFeedbackModal,
  onClose,
  isMobileView
}) => {
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [suggestionText, setSuggestionText] = useState<string>('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState<boolean>(false);
  const [isRabLoading, setIsRabLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const suggestionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editableTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Efecto para limpiar el texto de sugerencia cuando cambia el asistente seleccionado
  const handleAssistantChange = (assistant: string) => {
    setSelectedAssistant(assistant);
    setSuggestionText('');
  };

  const handleGetSuggestion = async () => {
    if (!selectedAssistant) {
      setError('Por favor selecciona un tipo de sugerencia');
      return;
    }

    setIsSuggestionLoading(true);
    setError(null);

    try {
      const suggestion = await getAiSuggestion(phoneNumber, selectedAssistant);
      setSuggestionText(suggestion);
    } catch (err) {
      console.error('Error al obtener sugerencia:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener sugerencia');
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  // Función para convertir texto al estilo "Rab"
  const handleConvertToRabStyle = async () => {
    if (!editableText.trim()) {
      setError('No hay texto para convertir');
      return;
    }

    setIsRabLoading(true);
    setError(null);

    try {
      const rabText = await getAiSuggestion(phoneNumber, 'hablacomo', editableText);
      updateEditableText(rabText);
    } catch (err) {
      console.error('Error al convertir texto:', err);
      setError(err instanceof Error ? err.message : 'Error al convertir texto');
    } finally {
      setIsRabLoading(false);
    }
  };

  // Copiar la sugerencia al área editable (añadir, no reemplazar)
  const handleCopyToEditable = () => {
    if (suggestionText.trim()) {
      // Añadir el texto de la sugerencia al texto existente en lugar de reemplazarlo
      const currentText = editableText.trim();
      const newText = currentText
        ? `${currentText}\n\n${suggestionText}`
        : suggestionText;

      updateEditableText(newText);
    }
  };

  // Copiar al componente MessageInput
  const handleCopyToInput = () => {
    if (editableText.trim()) {
      // En lugar de enviar directamente, solo pasar el texto al MessageInput
      onSendSuggestion(editableText.trim());
      onClose();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row md:space-x-2">
        <div className="md:w-[46%] mb-2 md:mb-0 flex flex-col h-full">
          {/* Selector de tipo de sugerencia */}
          <SuggestionTypeSelector
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={handleAssistantChange}
            assistantOptions={assistantOptions}
            isSuggestionLoading={isSuggestionLoading}
            handleGetSuggestion={handleGetSuggestion}
          />

          {/* Área para mostrar la sugerencia */}
          <SuggestionDisplay
            suggestionText={suggestionText}
            setSuggestionText={setSuggestionText}
            isMobileView={isMobileView}
            handleCopyToEditable={handleCopyToEditable}
            textareaRef={suggestionTextareaRef}
          />
        </div>

        <div className="display-none md:w-[8%] md:flex items-center justify-center md:mb-32">
          <button
            onClick={handleCopyToEditable}
            disabled={!suggestionText.trim()}
          >
            <MdArrowCircleRight
              className={`md:w-6 md:h-6 ${!suggestionText.trim() && 'text-slate-400 cursor-not-allowed'}`}
            />
          </button>
        </div>

        {/* Área para texto editable */}
        <EditableTextSection
          editableText={editableText}
          updateEditableText={updateEditableText}
          isMobileView={isMobileView}
          textareaRef={editableTextareaRef}
          handleConvertToRabStyle={handleConvertToRabStyle}
          isRabLoading={isRabLoading}
          handleCopyToInput={handleCopyToInput}
          onOpenFeedbackModal={onOpenFeedbackModal}
        />
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="p-2 bg-red-50 text-red-700 rounded-md text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default SuggestionSection;