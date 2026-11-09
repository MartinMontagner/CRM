import { useRef, useState } from "react";
import { getAiSuggestion } from "@/service/chat/ChatService";

interface AIAnalysisSectionProps {
  analysisText: string;
  setAnalysisText: (text: string) => void;
  phoneNumber: string;
  isMobileView: boolean;
}

const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({
  analysisText,
  setAnalysisText,
  phoneNumber,
  isMobileView
}) => {
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const analysisTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Función para cargar el análisis desde la API y actualizar el estado
  const loadAnalysis = async () => {
    setIsAnalysisLoading(true);
    try {
      const suggestion = await getAiSuggestion(phoneNumber, 'analisis');
      setAnalysisText(suggestion);
    } catch (err) {
      console.error('Error al obtener análisis:', err);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${isMobileView ? 'h-auto mb-3' : 'h-3/5 mb-2'}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold mb-2 text-center ml-3">ANÁLISIS DE LA IA</h3>
        <button
          onClick={loadAnalysis}
          disabled={isAnalysisLoading}
          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-tertiary-700 bg-tertiary-100 hover:bg-tertiary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary-500 disabled:opacity-50"
          title="Actualizar análisis"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${isAnalysisLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
      <div className="relative flex-grow h-full">
        <textarea
          ref={analysisTextareaRef}
          value={analysisText}
          className={`w-full ${isMobileView ? 'h-40' : 'h-full'} p-2 border border-gray-300 rounded-xl focus:ring-tertiary-500 focus:border-tertiary-500 resize-none bg-white text-sm`}
          placeholder={isAnalysisLoading ? "Cargando análisis..." : "Sin análisis disponible"}
          readOnly={true}
        />
        {isAnalysisLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <svg className="animate-spin h-6 w-6 text-tertiary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisSection;