interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
  }
  
  const EmptyState = ({
    title = "No hay chat seleccionado",
    description = "Selecciona una conversación existente o inicia una nueva para comenzar a chatear",
    className = ""
  }: EmptyStateProps) => {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-full bg-gray-50 text-center p-6 ${className}`}>
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-medium text-gray-800 mb-2">{title}</h2>
        
        <p className="text-gray-500 max-w-md">
          {description}
        </p>
      </div>
    );
  };
  
  export default EmptyState;