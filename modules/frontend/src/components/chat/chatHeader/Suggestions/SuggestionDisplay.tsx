import { RefObject } from "react";

interface SuggestionDisplayProps {
  suggestionText: string;
  setSuggestionText: (text: string) => void;
  isMobileView: boolean;
  handleCopyToEditable: () => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
}

const SuggestionDisplay: React.FC<SuggestionDisplayProps> = ({
  suggestionText,
  setSuggestionText,
  isMobileView,
  handleCopyToEditable,
  textareaRef
}) => {
  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="suggestion" className="block text-xs font-medium text-gray-700">
          <span className="font-bold ml-3">2. </span>Sugerencia
        </label>
        <button
          onClick={handleCopyToEditable}
          disabled={!suggestionText.trim()}
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${!suggestionText.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Agregar al texto →
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id="suggestion"
        value={suggestionText}
        onChange={(e) => setSuggestionText(e.target.value)}
        className={`w-full p-2 border border-gray-300 rounded-2xl focus:ring-tertiary-500 focus:border-tertiary-500 flex-grow ${isMobileView ? 'h-28' : 'h-full'} resize-none text-xs`}
        placeholder="La sugerencia aparecerá aquí..."
      />
    </div>
  );
};

export default SuggestionDisplay;