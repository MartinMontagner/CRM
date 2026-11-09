import { AssistantDTO } from "@/model/chats/Chat";

interface SuggestionTypeSelectorProps {
  selectedAssistant: string;
  setSelectedAssistant: (assistant: string) => void;
  assistantOptions: AssistantDTO[];
  isSuggestionLoading: boolean;
  handleGetSuggestion: () => Promise<void>;
}

const SuggestionTypeSelector: React.FC<SuggestionTypeSelectorProps> = ({
  selectedAssistant,
  setSelectedAssistant,
  assistantOptions,
  isSuggestionLoading,
  handleGetSuggestion
}) => {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="assistant" className="block text-xs font-medium text-gray-700">
          <span className="font-bold ml-3">1. </span>Tipo de sugerencia
        </label>
        <button
          onClick={handleGetSuggestion}
          disabled={!selectedAssistant || isSuggestionLoading}
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${!selectedAssistant || isSuggestionLoading
            ? 'bg-tertiary-100 text-tertiary-700 cursor-not-allowed'
            : 'bg-tertiary-400 text-white hover:bg-tertiary-600'}`}
        >
          {isSuggestionLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </>
          ) : (
            'Obtener Sugerencia'
          )}
        </button>
      </div>
      <select
        id="assistant"
        value={selectedAssistant}
        onChange={(e) => setSelectedAssistant(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-tertiary-500 focus:border-tertiary-500 text-xs"
        disabled={isSuggestionLoading}
      >
        <option value="">Seleccionar...</option>
        {assistantOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SuggestionTypeSelector;