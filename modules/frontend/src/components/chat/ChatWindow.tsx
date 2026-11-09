import {
  AssistantDTO,
  ChatMessageDTO,
  ConversationDTO,
} from "@/model/chats/Chat";
import {
  getAllAssistants,
  getMessagesGroupPaginated,
  getMessagesPaginated,
  updateConversationName,
  updateConversationTag,
} from "@/service/chat/ChatService";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import NameEditModal from "./chatHeader/NameEditModal";
import SuggestionsModal from "./chatHeader/SuggestionsModal";
import TagEditModal from "./chatHeader/TagEditModal";
import EmptyState from "./EmptyState";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import { SendMessageModal } from "./SendMessageModal";
import ButtonRead from "./chatHeader/ButtonRead";
import moment from "moment";
import StudentTagBadge from "./StudentTagBadge";

interface ChatWindowProps {
  selectedChat: ConversationDTO | null;
  messages: ChatMessageDTO[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  onLoadMore?: () => void;
  hasMoreMessages?: boolean;
  isLoadingMessages: boolean;
  isMobileView?: boolean;
  onBackToList?: () => void;
  formatPhoneNumber?: (phone: string) => string;
  onConversationDeleted?: () => void;
  onConversationUpdated?: (updatedChat: ConversationDTO) => void;
  onMessagesRead?: (conversationId: number) => void;
  isFetchingNextPage?: boolean;
  lastItemRef?: (node: HTMLDivElement) => void;
  isGroupChat: boolean;
}

const ChatWindow = ({
  selectedChat,
  messages,
  onSendMessage,
  isSending,
  onLoadMore,
  hasMoreMessages = false,
  isLoadingMessages,
  isMobileView = false,
  onBackToList,
  formatPhoneNumber = (phone) => phone,
  onConversationDeleted,
  onConversationUpdated,
  onMessagesRead,
  isFetchingNextPage = false,
  lastItemRef,
  isGroupChat,
}: ChatWindowProps) => {
  // ✅ CENTRALIZADOS: Todos los estados de modales en ChatWindow
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Estados existentes
  const [assistantOptions, setAssistantOptions] = useState<AssistantDTO[]>([]);
  const [initialSuggestionText, setInitialSuggestionText] = useState<string>("");

  const messageListRef = useRef<HTMLDivElement>(null);

  // Estado para almacenar la función setter del texto del MessageInput
  const [setMessageText, setMessageTextSetter] = useState<
    ((text: string) => void) | null
  >(null);

  // Estados para la funcionalidad de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ index: number; content: string }>
  >([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados para búsqueda avanzada con paginación
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchMessages, setSearchMessages] = useState<ChatMessageDTO[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchCurrentPage, setSearchCurrentPage] = useState(0);

  // ✅ HANDLERS CENTRALIZADOS para abrir modales
  const handleOpenTagModal = useCallback(() => {
    setIsTagModalOpen(true);
  }, []);

  const handleOpenNameModal = useCallback(() => {
    setIsNameModalOpen(true);
  }, []);

  const handleOpenSuggestionsFromHeader = useCallback(() => {
    setInitialSuggestionText("");
    setIsSuggestionsModalOpen(true);
  }, []);

  const handleOpenSuggestionsFromInput = useCallback((initialText: string) => {
    setInitialSuggestionText(initialText);
    setIsSuggestionsModalOpen(true);
  }, []);

  const handleOpenTemplatesModal = useCallback(() => {
    setIsTemplatesModalOpen(true);
  }, []);

  // ✅ LÓGICA DE NEGOCIO CENTRALIZADA
  // Modificación en ChatWindow.tsx - Solo el handler handleTagChange

  const handleTagChange = async (conversationId: number, newTag: string) => {
    if (!selectedChat) return;

    try {
      console.log(`Actualizando tag para conversación ${conversationId} a: ${newTag}`);

      // ✅ ACTUALIZACIÓN OPTIMISTA INMEDIATA para UI responsiva
      const optimisticUpdate = {
        ...selectedChat,
        studentTag: newTag || undefined // Asegurar que sea null si está vacío
      };

      if (onConversationUpdated) {
        console.log("Aplicando actualización optimista inmediata");
        onConversationUpdated(optimisticUpdate);
      }

      // ✅ Enviar al backend sin esperar la respuesta completa
      // Solo esperamos el status 200 para confirmar que se guardó
      updateConversationTag(conversationId, newTag)
        .then(() => {
          console.log("Tag actualizada exitosamente en el backend");
          // Opcional: Mostrar un toast de éxito
        })
        .catch((error) => {
          console.error("Error al actualizar la etiqueta en el backend:", error);

          // ✅ REVERTIR la actualización optimista en caso de error
          if (onConversationUpdated) {
            console.log("Revirtiendo actualización optimista debido a error");
            onConversationUpdated(selectedChat); // Volver al estado original
          }

          // Mostrar error al usuario
          alert("No se pudo actualizar la etiqueta. Se ha revertido el cambio.");
        });

      // ✅ Cerrar el modal inmediatamente sin esperar el backend
      setIsTagModalOpen(false);

    } catch (error) {
      console.error("Error inmediato al procesar el cambio de etiqueta:", error);

      // ✅ REVERTIR la actualización optimista en caso de error inmediato
      if (onConversationUpdated) {
        console.log("Revirtiendo actualización optimista debido a error inmediato");
        onConversationUpdated(selectedChat);
      }

      alert("Error al procesar el cambio de etiqueta.");
    }
  };

  const handleNameChange = async (conversationId: number, name: string) => {
    if (!selectedChat) return;

    try {
      console.log(`Intentando actualizar nombre para ${conversationId} a: ${name}`);

      // Actualizar el nombre usando el servicio
      await updateConversationName(conversationId, name);

      // Crear un nuevo objeto de conversación actualizado
      const updatedChat = {
        ...selectedChat,
        studentName: name,
      };

      // Notificar al componente padre sobre el cambio
      if (onConversationUpdated) {
        console.log("Notificando al componente padre sobre el cambio de nombre");
        onConversationUpdated(updatedChat);
      } else {
        console.warn("No se proporcionó callback onConversationUpdated");
      }

      // Cerrar el modal
      setIsNameModalOpen(false);

    } catch (error) {
      console.error("Error detallado al actualizar el nombre:", error);

      // Mostrar mensaje de error más específico si está disponible
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert(
          "No se pudo actualizar el nombre. Por favor, inténtalo de nuevo más tarde."
        );
      }
    }
  };

  // Función para registrar el setter del MessageInput
  const handleSetMessageTextFunction = useCallback(
    (setFn: (text: string) => void) => {
      setMessageTextSetter(() => setFn);
    },
    []
  );

  // Función para establecer texto en el input del mensaje
  const handleSetMessageInputText = useCallback(
    (text: string) => {
      if (setMessageText) {
        console.log("ChatWindow: Aplicando texto al MessageInput");
        setMessageText(text);
      } else {
        console.warn(
          "ChatWindow: No hay función disponible para establecer texto"
        );
      }
    },
    [setMessageText]
  );

  const handleMessagesRead = useCallback((conversationId: number) => {
    if (onMessagesRead) {
      onMessagesRead(conversationId);
    }
  }, [onMessagesRead]);

  const handleCloseTemplatesModal = useCallback(() => {
    setIsTemplatesModalOpen(false);
  }, []);

  // Obtener el tiempo del último mensaje del estudiante (corregida con moment)
  const getLastStudentMessageTime = useCallback((): number | null => {
    if (!messages || messages.length === 0) return null;

    const studentMessages = messages.filter(
      (message) => message.sender === "STUDENT"
    );

    if (studentMessages.length === 0) return null;

    // Ordenar por sentAt para obtener el mensaje más reciente cronológicamente
    const sortedStudentMessages = studentMessages.sort((a, b) =>
      moment(a.sentAt).valueOf() - moment(b.sentAt).valueOf()
    );

    const lastStudentMessage = sortedStudentMessages[sortedStudentMessages.length - 1];

    const localMoment = moment.utc(lastStudentMessage.sentAt).local();
    return localMoment.valueOf();
  }, [messages]);

  // Añadir los estilos de animación para los mensajes resaltados
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .highlight-message {
      position: relative;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.06));
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 4px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 0 0 1px rgba(59, 130, 246, 0.2),
        0 4px 12px rgba(59, 130, 246, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      animation: highlightPulse 2s ease-in-out infinite;
    }
    
    .highlight-message::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.3) 0%, 
        rgba(147, 51, 234, 0.2) 50%, 
        rgba(59, 130, 246, 0.3) 100%);
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }
    
    .highlight-message:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 0 0 1px rgba(59, 130, 246, 0.4),
        0 8px 25px rgba(59, 130, 246, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    
    .highlight-message:hover::before {
      opacity: 0.3;
    }
    
    @keyframes highlightPulse {
      0%, 100% {
        box-shadow: 
          0 0 0 1px rgba(59, 130, 246, 0.2),
          0 4px 12px rgba(59, 130, 246, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      50% {
        box-shadow: 
          0 0 0 2px rgba(59, 130, 246, 0.4),
          0 6px 20px rgba(59, 130, 246, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
    }
    
    /* Variante para tema oscuro */
    @media (prefers-color-scheme: dark) {
      .highlight-message {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.08));
        box-shadow: 
          0 0 0 1px rgba(59, 130, 246, 0.3),
          0 4px 12px rgba(59, 130, 246, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }
      
      .highlight-message::before {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.4) 0%, 
          rgba(147, 51, 234, 0.3) 50%, 
          rgba(59, 130, 246, 0.4) 100%);
      }
      
      .highlight-message:hover {
        box-shadow: 
          0 0 0 1px rgba(59, 130, 246, 0.5),
          0 8px 25px rgba(59, 130, 246, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }
    
    /* Versión reducida para dispositivos con movimiento reducido */
    @media (prefers-reduced-motion: reduce) {
      .highlight-message {
        animation: none;
        transition: none;
      }
      
      .highlight-message:hover {
        transform: none;
      }
    }
  `;

    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Reiniciar búsqueda cuando cambia el chat seleccionado
  useEffect(() => {
    // Limpiar cualquier resaltado previo
    if (messageListRef.current) {
      const prevHighlighted =
        messageListRef.current.querySelectorAll(".highlight-message");
      prevHighlighted.forEach((element) => {
        element.classList.remove("highlight-message");
      });
    }

    // Limpiar el estado de la búsqueda al cambiar de chat
    setSearchTerm("");
    setSearchActive(false);
    setSearchResults([]);
    setCurrentMatchIndex(0);
    setShowSearchBar(false);

    // Estados de búsqueda avanzada
    setIsSearchMode(false);
    setSearchMessages([]);
    setSearchCurrentPage(0);
    setSearchHasMore(false);
    setIsSearchLoading(false);
  }, [selectedChat]);

  // Enfocar el input cuando se muestra la barra de búsqueda
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showSearchBar]);

  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const assistants = await getAllAssistants();
        setAssistantOptions(assistants);
      } catch (error) {
        console.error("Error al cargar los asistentes:", error);
      }
    };
    loadAssistants();
  }, []);

  // Función de búsqueda avanzada con paginación
  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      // Cuando se borra la búsqueda, volver al modo normal
      setSearchActive(false);
      setSearchResults([]);
      setCurrentMatchIndex(0);
      setIsSearchMode(false);
      setSearchMessages([]);
      setSearchCurrentPage(0);
      setSearchHasMore(false);
      return;
    }

    if (!selectedChat) return; // Verificación de null

    // Decidir si usar búsqueda avanzada o simple
    const useAdvancedSearch =
      selectedChat.conversationType === "WAZEND" ||
      selectedChat.conversationType === "WAZEND_GROUP";

    if (useAdvancedSearch) {
      // Búsqueda avanzada con paginación
      setIsSearchMode(true);
      setIsSearchLoading(true);
      setSearchCurrentPage(0);

      try {
        let response;
        const isWazend = selectedChat.conversationType === "WAZEND";
        const isGroup = selectedChat.conversationType === "WAZEND_GROUP";

        if (isWazend && selectedChat.wazend) {
          response = await getMessagesPaginated(
            selectedChat.conversationId,
            0, // Empezar desde la página 0
            20, // Tamaño de página
            selectedChat.wazend.id,
            term // Pasar el término de búsqueda
          );
        } else if (isGroup && selectedChat.wazendGroup) {
          response = await getMessagesGroupPaginated(
            selectedChat.conversationId,
            0,
            20,
            term // Agregar parámetro search a esta función también
          );
        } else {
          response = await getMessagesPaginated(
            selectedChat.conversationId,
            0,
            20,
            undefined,
            term
          );
        }

        setSearchMessages(response.content);
        setSearchHasMore(!response.last);
        setSearchActive(response.content.length > 0);

        // Preparar resultados para navegación
        const results = response.content.map((message, index) => ({
          index,
          content: message.content,
        }));

        setSearchResults(results);
        setCurrentMatchIndex(results.length > 0 ? 0 : -1);

        // Si hay resultados, scroll al primer resultado
        if (results.length > 0) {
          setTimeout(() => scrollToMessage(0), 100);
        }
      } catch (error) {
        console.error("Error en búsqueda avanzada:", error);
      } finally {
        setIsSearchLoading(false);
      }
    } else {
      // Búsqueda simple en mensajes locales
      setIsSearchMode(false);
      const results: Array<{ index: number; content: string }> = [];
      const searchTermLower = term.toLowerCase();

      // Buscar el término en todos los mensajes
      messages.forEach((message, index) => {
        if (message.content.toLowerCase().includes(searchTermLower)) {
          results.push({
            index,
            content: message.content,
          });
        }
      });

      setSearchResults(results);
      setSearchActive(results.length > 0);
      setCurrentMatchIndex(results.length > 0 ? 0 : -1);

      // Si hay resultados, desplazarse al primer resultado automáticamente
      if (results.length > 0) {
        setTimeout(() => scrollToMessage(results[0].index), 100);
      }
    }
  };

  // Función para cargar más resultados de búsqueda
  const loadMoreSearchResults = async () => {
    if (
      !searchTerm.trim() ||
      !searchHasMore ||
      isSearchLoading ||
      !selectedChat ||
      !isSearchMode
    )
      return;

    setIsSearchLoading(true);
    const nextPage = searchCurrentPage + 1;

    try {
      let response;
      const isWazend = selectedChat.conversationType === "WAZEND";
      const isGroup = selectedChat.conversationType === "WAZEND_GROUP";

      if (isWazend && selectedChat.wazend) {
        response = await getMessagesPaginated(
          selectedChat.conversationId,
          nextPage,
          20,
          selectedChat.wazend.id,
          searchTerm
        );
      } else if (isGroup && selectedChat.wazendGroup) {
        response = await getMessagesGroupPaginated(
          selectedChat.conversationId,
          nextPage,
          20,
          searchTerm
        );
      } else {
        response = await getMessagesPaginated(
          selectedChat.conversationId,
          nextPage,
          20,
          undefined,
          searchTerm
        );
      }

      // Agregar nuevos mensajes a los existentes
      setSearchMessages((prev) => [...prev, ...response.content]);
      setSearchHasMore(!response.last);
      setSearchCurrentPage(nextPage);

      // Actualizar resultados para navegación
      const newResults = response.content.map((message, index) => ({
        index: searchMessages.length + index,
        content: message.content,
      }));

      setSearchResults((prev) => [...prev, ...newResults]);
    } catch (error) {
      console.error("Error cargando más resultados:", error);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Función simplificada para desplazarse al mensaje
  const scrollToMessage = (messageIndex: number) => {
    try {
      // Limpiar resaltados previos
      const prevHighlighted = document.querySelectorAll(".highlight-message");
      prevHighlighted.forEach((element) => {
        element.classList.remove("highlight-message");
      });

      // Buscar el mensaje y resaltarlo
      const selector = `[data-message-index="${messageIndex}"]`;
      const messageElement = document.querySelector(selector);

      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        messageElement.classList.add("highlight-message");
      }
    } catch (error) {
      console.error("Error al desplazarse:", error);
    }
  };

  // Función para navegar al siguiente resultado
  const goToNextMatch = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % searchResults.length;
      setCurrentMatchIndex(nextIndex);
      scrollToMessage(searchResults[nextIndex].index);
    }
  };

  // Función para navegar al resultado anterior
  const goToPrevMatch = () => {
    if (searchResults.length > 0) {
      const prevIndex =
        (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
      setCurrentMatchIndex(prevIndex);
      scrollToMessage(searchResults[prevIndex].index);
    }
  };

  // Cerrar la búsqueda
  const handleCloseSearch = () => {
    // Limpiar cualquier resaltado previo
    if (messageListRef.current) {
      const prevHighlighted =
        messageListRef.current.querySelectorAll(".highlight-message");
      prevHighlighted.forEach((element) => {
        element.classList.remove("highlight-message");
      });
    }

    // RESETEAR COMPLETAMENTE el estado de búsqueda
    setSearchTerm("");
    setSearchActive(false);
    setSearchResults([]);
    setCurrentMatchIndex(0);
    setShowSearchBar(false);
    setIsSearchMode(false);
    setSearchMessages([]);
    setSearchCurrentPage(0);
    setSearchHasMore(false);
    setIsSearchLoading(false);
  };

  // Manejar el evento para mostrar/ocultar la barra de búsqueda (desde ChatHeader)
  const handleToggleSearch = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      handleCloseSearch();
    }
  };

  // Manejador para enviar una sugerencia
  const handleSendSuggestion = (text: string) => {
    if (setMessageText) {
      // Colocar el texto en el input en lugar de enviarlo directamente
      setMessageText(text);
    } else if (onSendMessage) {
      // Fallback al comportamiento anterior si setMessageInputText no está disponible
      console.warn(
        "setMessageInputText no está disponible, se usará onSendMessage como fallback"
      );
      onSendMessage(text);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-grey-100 rounded-lg">
        <EmptyState />
      </div>
    );
  }

  // ✅ PROPS SIMPLIFICADOS para ChatHeader - Solo funciones para abrir modales
  const headerProps = {
    selectedChat,
    isLoading: isLoadingMessages,
    onConversationDeleted: onConversationDeleted,
    onToggleSearch: handleToggleSearch,
    formatPhoneNumber,
    setMessageInputText: handleSetMessageInputText,
    onMessagesRead: handleMessagesRead,
    // ✅ SOLO pasar handlers para abrir modales
    onOpenTagModal: handleOpenTagModal,
    onOpenNameModal: handleOpenNameModal,
    onOpenSuggestionsModal: handleOpenSuggestionsFromHeader,
  };

  const chatActive = selectedChat.wazend?.isActive;

  return (
    <div className="flex flex-col h-full bg-grey-100 overflow-hidden">
      {/* Cabecera contextual: con botón de regreso en móvil, normal en desktop */}
      {isMobileView && onBackToList ? (
        <div className="bg-white border-b border-grey-300">
          {showSearchBar ? (
            // Barra de búsqueda para móvil
            <div className="p-3 flex items-center space-x-2">
              <button
                onClick={handleCloseSearch}
                className="text-tertiary-600 p-1"
                aria-label="Volver"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar mensajes..."
                  className="w-full py-2 px-8 rounded-lg bg-grey-100 text-grey-700 border border-grey-300 focus:outline-none focus:ring-1 focus:ring-tertiary-400"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-grey-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-2 flex items-center"
                    onClick={() => handleSearch("")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-grey-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onBackToList}
                  className="mr-3 text-tertiary-600"
                  aria-label="Volver a la lista de chats"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <img
                  src={
                    selectedChat.studentImageUrl ||
                    `https://ui-avatars.com/api/?name=${selectedChat.studentName || selectedChat.phoneNumber
                    }`
                  }
                  alt={selectedChat.studentName || selectedChat.phoneNumber}
                  className={`w-10 h-10 rounded-full object-cover ${isLoadingMessages ? "opacity-50" : ""
                    }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://ui-avatars.com/api/?name=${selectedChat.studentName || selectedChat.phoneNumber
                      }`;
                  }}
                />

                <div className="ml-3 flex-col">
                  <h2
                    className={`text-lg font-semibold ${isLoadingMessages ? "text-gray-400" : ""
                      }`}
                  >
                    {isLoadingMessages
                      ? "Cargando..."
                      : selectedChat.studentName ||
                      formatPhoneNumber(selectedChat.phoneNumber)}
                  </h2>

                  <div className="flex items-center mt-1">
                    <div className="flex items-center gap-2">
                      <StudentTagBadge
                        studentTag={selectedChat.studentTag}
                        size="sm"
                        fallbackName={selectedChat.studentName}
                        fallbackPhone={selectedChat.phoneNumber}
                      />
                      {!selectedChat.studentTag && (
                        <span className="text-xs text-gray-500">Sin etiqueta</span>
                      )}
                    </div>

                    <button
                      onClick={handleOpenSuggestionsFromHeader}
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
                {/* AGREGAR: Botón de marcar como leído para móvil */}
                <ButtonRead
                  conversationId={selectedChat.conversationId}
                  unreadCount={selectedChat.unreadCount || 0}
                  onMessagesRead={handleMessagesRead}
                />

                <button
                  onClick={handleToggleSearch}
                  className="mr-3 p-2 rounded-full hover:bg-grey-200 focus:outline-none"
                  aria-label="Buscar mensajes"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-grey-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Controles de navegación para resultados de búsqueda en móvil */}
          {showSearchBar && searchActive && searchResults.length > 0 && (
            <div className="bg-white border-t border-grey-200 p-2 flex items-center justify-between">
              <span className="text-sm text-grey-600">
                {currentMatchIndex + 1} de {searchResults.length} resultados
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevMatch}
                  className="p-1 rounded-full hover:bg-grey-200 text-grey-700"
                  aria-label="Resultado anterior"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={goToNextMatch}
                  className="p-1 rounded-full hover:bg-grey-200 text-grey-700"
                  aria-label="Siguiente resultado"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
          )}
        </div>
      ) : (
        <>
          {/* Header normal para desktop */}
          <ChatHeader {...headerProps} />

          {/* Barra de búsqueda en modo desktop - solo visible cuando showSearchBar es true */}
          {showSearchBar && (
            <div className="bg-white border-b border-grey-200 p-3 flex flex-col">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCloseSearch}
                  className="text-tertiary-600 p-1"
                  aria-label="Cerrar búsqueda"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar mensajes..."
                    className="w-full py-2 px-8 rounded-lg bg-grey-100 text-grey-700 border border-grey-300 focus:outline-none focus:ring-1 focus:ring-tertiary-400"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && handleCloseSearch()}
                  />
                  <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-grey-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-2 flex items-center"
                      onClick={() => handleSearch("")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-grey-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Controles de navegación para resultados de búsqueda */}
              {searchActive && searchResults.length > 0 && (
                <div className="mt-2 flex items-center justify-between bg-grey-50 p-2 rounded-lg">
                  <span className="text-sm text-grey-600">
                    {currentMatchIndex + 1} de {searchResults.length} resultados
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPrevMatch}
                      className="p-1 rounded-full hover:bg-grey-200 text-grey-700"
                      aria-label="Resultado anterior"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={goToNextMatch}
                      className="p-1 rounded-full hover:bg-grey-200 text-grey-700"
                      aria-label="Siguiente resultado"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
              )}
            </div>
          )}
        </>
      )}

      {/* Contenedor principal */}
      <div className="flex-1 overflow-hidden" ref={messageListRef}>
        <MessageList
          messages={isSearchMode ? [] : messages}
          isLoading={isLoadingMessages}
          onLoadMore={onLoadMore}
          hasMoreMessages={hasMoreMessages}
          key={selectedChat?.phoneNumber + "-messages"}
          searchTerm={searchActive ? searchTerm : ""}
          highlightMessageIndex={
            searchActive && searchResults.length > 0 && currentMatchIndex >= 0
              ? searchResults[currentMatchIndex].index
              : -1
          }
          isFetchingNextPage={isFetchingNextPage}
          lastItemRef={lastItemRef}
          isGroupChat={isGroupChat}
          // Nuevas props para búsqueda avanzada
          isSearchMode={isSearchMode}
          searchMessages={searchMessages}
          onLoadMoreSearch={loadMoreSearchResults}
          searchHasMore={searchHasMore}
          isSearchLoading={isSearchLoading}
        />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <MessageInput
          platformType={selectedChat.conversationType}
          onSendMessage={(text) => onSendMessage(text)}
          disabled={isLoadingMessages}
          isSending={isSending}
          setMessageText={handleSetMessageTextFunction}
          onOpenSuggestionsModal={handleOpenSuggestionsFromInput}
          lastMessageTime={getLastStudentMessageTime()}
          onOpenTemplatesModal={handleOpenTemplatesModal}
          isActive={chatActive}
        />
      </div>

      {/* ✅ TODOS LOS MODALES CENTRALIZADOS EN CHATWINDOW */}
      <TagEditModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        studentTag={selectedChat?.studentTag}
        conversationId={selectedChat.conversationId}
        onSave={handleTagChange}
        studentName={selectedChat?.studentName}
        phoneNumber={selectedChat?.phoneNumber}
      />

      <NameEditModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        currentName={selectedChat?.studentName || ""}
        onSave={(name) => handleNameChange(selectedChat.conversationId, name)}
      />

      {/* Modal para las sugerencias de IA */}
      <SuggestionsModal
        conversationId={selectedChat.conversationId}
        isOpen={isSuggestionsModalOpen}
        onClose={() => setIsSuggestionsModalOpen(false)}
        onSendSuggestion={handleSendSuggestion}
        phoneNumber={selectedChat.phoneNumber}
        analisis={selectedChat.analisis}
        assistantOptions={assistantOptions}
        initialEditableText={initialSuggestionText}
      />

      {/* Modal para enviar templates de WhatsApp */}
      <SendMessageModal
        isOpen={isTemplatesModalOpen}
        onClose={handleCloseTemplatesModal}
        selectedCount={1} // Siempre es 1 porque estamos enviando a un solo contacto
        phoneNumber={parseInt(selectedChat.phoneNumber)} // Convertimos el número de teléfono a entero
      />
    </div>
  );
};

export default ChatWindow;