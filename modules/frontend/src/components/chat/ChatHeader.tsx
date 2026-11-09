import { useEffect, useRef, useState } from "react";
import { ConversationDTO } from "@/model/chats/Chat";
import ButtonRead from "./chatHeader/ButtonRead";
import StudentTagAvatar from "@/components/chat/StudentTagAvatar";
import StudentTagBadge from "@/components/chat/StudentTagBadge";

interface ChatHeaderProps {
  selectedChat: ConversationDTO;
  isLoading?: boolean;
  onConversationDeleted?: () => void;
  onToggleSearch?: () => void;
  formatPhoneNumber?: (phone: string) => string;
  setMessageInputText?: (text: string) => void;
  onMessagesRead?: (conversationId: number) => void;
  onOpenTagModal?: () => void;
  onOpenNameModal?: () => void;
  onOpenSuggestionsModal?: () => void;
}

const ChatHeader = ({
  selectedChat,
  isLoading = false,
  onToggleSearch,
  formatPhoneNumber = phone => phone,
  onMessagesRead,
  onOpenTagModal,
  onOpenNameModal,
  onOpenSuggestionsModal,
}: ChatHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const studentTag = selectedChat?.studentTag; // Puede ser null/undefined


  useEffect(() => {
    console.log(" ChatHeader - selectedChat actualizado:", {
      conversationId: selectedChat?.conversationId,
      studentTag: selectedChat?.studentTag,
      studentName: selectedChat?.studentName
    });
  }, [selectedChat?.conversationId, selectedChat?.studentTag, selectedChat?.studentName]);


  useEffect(() => {
    console.log("ChatHeader - StudentTag actualizado a:", studentTag);
  }, [studentTag]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenSuggestionsClick = () => {
    if (onOpenSuggestionsModal) {
      onOpenSuggestionsModal();
    } else {
      console.warn("ChatHeader: onOpenSuggestionsModal no está disponible");
    }
  };

  const handleOpenTagModalClick = () => {
    if (onOpenTagModal) {
      onOpenTagModal();
      setMenuOpen(false); // Cerrar menú después de abrir modal
    } else {
      console.warn("ChatHeader: onOpenTagModal no está disponible");
    }
  };

  const handleOpenNameModalClick = () => {
    if (onOpenNameModal) {
      onOpenNameModal();
      setMenuOpen(false); // Cerrar menú después de abrir modal
    } else {
      console.warn("ChatHeader: onOpenNameModal no está disponible");
    }
  };

  const handleMessagesRead = (conversationId: number) => {
    if (onMessagesRead) {
      onMessagesRead(conversationId);
    } else {
      console.warn("ChatHeader: onMessagesRead no está disponible");
    }
  };

  // Obtener el nombre para mostrar
  const getDisplayName = () => {
    if (isLoading) return 'Cargando...';
    return selectedChat.studentName || formatPhoneNumber(selectedChat.phoneNumber);
  };

  return (
    <div className="p-4 border-b border-grey-300 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/*  Avatar usando el componente reutilizable con fallbacks */}
          <div className={`${isLoading ? 'opacity-50' : ''}`}>
            <StudentTagAvatar
              studentTag={studentTag}
              size="md"
              showHover={false}
              fallbackName={selectedChat?.studentName}
              fallbackPhone={selectedChat?.phoneNumber}
            />
          </div>

          <div className="ml-3 flex items-center">
            <h2 className={`text-lg font-semibold ${isLoading ? 'text-gray-400' : ''}`}>
              {getDisplayName()}
            </h2>

            <div className="ml-2 flex items-center">
              {/*  Badge de etiqueta que se oculta automáticamente si studentTag es null */}
              <StudentTagBadge
                studentTag={studentTag}
                size="sm"
                showHover={true}
                fallbackName={selectedChat?.studentName}
                fallbackPhone={selectedChat?.phoneNumber}
              />

              {/* Botón de sugerencias */}
              <button
                onClick={handleOpenSuggestionsClick}
                className="ml-1 p-1 text-grey-500 hover:text-tertiary-600 focus:outline-none transition-colors"
                aria-label="Ver sugerencias de IA"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {/* Botón de marcar como leídos */}
          <ButtonRead
            conversationId={selectedChat.conversationId}
            unreadCount={selectedChat.unreadCount || 0}
            onMessagesRead={handleMessagesRead}
          />

          {/* Botón de búsqueda */}
          <button
            onClick={onToggleSearch}
            className="p-2 mx-2 rounded-full hover:bg-grey-200 focus:outline-none"
            aria-label="Buscar en la conversación"
          >
            <img
              src="/icons/lupa.svg"
              alt="Buscar"
              className="h-5 w-5"
            />
          </button>

          {/* Botón del menú */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-grey-200 focus:outline-none"
              aria-label="Opciones de conversación"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-grey-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Menú desplegable */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={handleOpenNameModalClick}
                    className="block w-full text-left px-4 py-2 text-sm text-grey-700 hover:bg-grey-100"
                  >
                    Editar nombre
                  </button>

                  {/* Solo mostrar "Editar etiqueta" si NO es un grupo de Wazend */}
                  {selectedChat.conversationType !== "WAZEND_GROUP" && (
                    <button
                      onClick={handleOpenTagModalClick}
                      className="block w-full text-left px-4 py-2 text-sm text-grey-700 hover:bg-grey-100"
                    >
                      Editar etiqueta
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;