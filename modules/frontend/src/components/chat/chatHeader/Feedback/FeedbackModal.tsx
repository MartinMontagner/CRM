import { useState } from "react";
import { AssistantDTO } from "@/model/chats/Chat";
import { sendAssistantFeedback } from "@/service/chat/ChatService";
import { FeedbackButtons } from "../FeedbackLikeButtons";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantOptions: AssistantDTO[];
  initialAssistant?: string;
  phoneNumber: string;
  editableText: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  assistantOptions,
  initialAssistant = "",
  phoneNumber,
  editableText
}) => {
  const [feedbackAssistant, setFeedbackAssistant] = useState<string>(initialAssistant);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackLike, setFeedbackLike] = useState<'like' | 'dislike'>('like');

  // Ordenar las opciones de asistentes por ID
  const sortedAssistantOptions = [...assistantOptions].sort((a, b) => a.id - b.id);

  // Enviar feedback
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Por favor ingresa un comentario');
      return;
    }

    if (!feedbackAssistant) {
      setFeedbackError('Por favor selecciona un asistente');
      return;
    }

    setIsFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // Determinar qué texto enviar según el asistente seleccionado
      const textToSend = feedbackAssistant === 'hablacomo'
        ? editableText
        : ''; // O sugerir pasar el texto de la sugerencia también como prop

      await sendAssistantFeedback(
        phoneNumber,
        feedbackAssistant,
        feedbackText,
        feedbackLike,
        textToSend
      );
      onClose();
    } catch (err) {
      console.error('Error al enviar feedback:', err);
      setFeedbackError(err instanceof Error ? err.message : 'Error al enviar feedback');
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-[90%] max-w-[450px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">
            Dar Feedback sobre Asistente
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="feedbackAssistant" className="block text-sm font-medium text-gray-700 mb-1">
              Asistente
            </label>
            <select
              id="feedbackAssistant"
              value={feedbackAssistant}
              onChange={(e) => setFeedbackAssistant(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isFeedbackLoading}
            >
              <option value="">Seleccionar asistente...</option>
              {sortedAssistantOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-1">
              Tu Feedback
            </label>
            <textarea
              id="feedbackText"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-24 resize-none text-sm"
              placeholder="Escribe tu feedback aquí..."
              disabled={isFeedbackLoading}
            />
          </div>

          {/* Mostrar error si existe */}
          {feedbackError && (
            <div className="p-2 bg-red-50 text-red-700 rounded-md text-xs">
              {feedbackError}
            </div>
          )}

          <FeedbackButtons feedback={feedbackLike} setFeedback={setFeedbackLike} />

          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={handleSendFeedback}
              disabled={isFeedbackLoading || !feedbackText.trim() || !feedbackAssistant}
              className={`px-3 py-1.5 rounded-md shadow-sm text-sm font-medium text-white ${isFeedbackLoading || !feedbackText.trim() || !feedbackAssistant
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isFeedbackLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Feedback'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;