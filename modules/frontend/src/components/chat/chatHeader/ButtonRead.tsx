import React, { useState, useEffect } from "react";
import { markMessagesAsRead } from "@/service/chat/ChatService";

interface ButtonReadProps {
  conversationId: number; // Tipado como number explícitamente
  unreadCount: number;
  onMessagesRead: (conversationId: number) => void; // Espera un number
}

const ButtonRead: React.FC<ButtonReadProps> = ({
  conversationId,
  unreadCount,
  onMessagesRead
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
  
  // Actualizar el contador local cuando cambia la prop
  useEffect(() => {
        setLocalUnreadCount(unreadCount);
  }, [unreadCount]);
  
  const handleMarkAsRead = async () => {
    if (isLoading || localUnreadCount === 0) return;

    // Asegurarse de que conversationId sea un número
    const conversationIdNum = typeof conversationId === 'string' ? parseInt(conversationId, 10) : conversationId;

    setIsLoading(true);
    
    try {
      // Llamar al servicio para marcar como leídos usando conversationId como número
      await markMessagesAsRead(conversationIdNum);

      // Actualizar el contador local inmediatamente para una mejor experiencia de usuario
      setLocalUnreadCount(0);

      // Notificar al componente padre que los mensajes fueron marcados como leídos
      onMessagesRead(conversationIdNum);
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
      // En caso de error, restauramos el valor original
      setLocalUnreadCount(unreadCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isLoading || localUnreadCount === 0}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        localUnreadCount === 0
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-tertiary-600 text-white hover:bg-tertiary-700"
      }`}
      aria-label="Marcar conversación como leída"
      title={`Marcar ${localUnreadCount} mensaje(s) como leído(s)`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando
        </span>
      ) : (
        `Leído${localUnreadCount > 0 ? ` (${localUnreadCount})` : ""}`
      )}
    </button>
  );
};

export default ButtonRead;