import { ChatMessageDTO } from "@/model/chats/Chat";
import { useDateFormatting } from "@/hooks/useDateFormatting";
import { useEffect, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";
import MessageItem from "./chatWindow/messages/MessageItem";

interface MessageListProps {
  messages: ChatMessageDTO[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMoreMessages?: boolean;
  searchTerm?: string;
  highlightMessageIndex?: number;
  isFetchingNextPage?: boolean;
  lastItemRef?: (node: HTMLDivElement) => void;
  isGroupChat: boolean;
  // Props para búsqueda
  isSearchMode?: boolean;
  searchMessages?: ChatMessageDTO[];
  onLoadMoreSearch?: () => void;
  searchHasMore?: boolean;
  isSearchLoading?: boolean;
}

const MessageList = ({
  messages,
  isLoading,
  onLoadMore,
  hasMoreMessages = false,
  searchTerm = "",
  isFetchingNextPage = false,
  isGroupChat,
  isSearchMode = false,
  searchMessages = [],
  onLoadMoreSearch,
  searchHasMore = false,
  isSearchLoading = false,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hook para formateo de fechas
  const { formatDateSeparator } = useDateFormatting();

  const wasLoadingRef = useRef<boolean>(isLoading);
  const isFirstLoadRef = useRef<boolean>(true);
  const isLoadingOlderMessagesRef = useRef<boolean>(false);
  const previousMessageCountRef = useRef<number>(0);

  const firstMessageIdRef = useRef<number>(0);
  const isAutoLoadingRef = useRef<boolean>(false);

  // Usar mensajes de búsqueda si estamos en modo búsqueda
  const messagesToDisplay = isSearchMode ? searchMessages : messages;
  const hasMore = isSearchMode ? searchHasMore : hasMoreMessages;
  const loadMoreFunction = isSearchMode ? onLoadMoreSearch : onLoadMore;
  const isFetching = isSearchMode ? isSearchLoading : isFetchingNextPage;

  // Debug para verificar que se están recibiendo los mensajes
  useEffect(() => {
    console.log("MessageList estado:", {
      isSearchMode,
      messagesToDisplay: messagesToDisplay.length,
      searchTerm,
      isFetching,
      hasMore,
    });
  }, [isSearchMode, messagesToDisplay.length, searchTerm, isFetching, hasMore]);

  // Scroll management effect
  useEffect(() => {
    const currentMessageCount = messagesToDisplay.length;
    const previousMessageCount = previousMessageCountRef.current;

    // NO hacer auto-scroll en modo búsqueda
    if (isSearchMode) {
      previousMessageCountRef.current = currentMessageCount;
      return;
    }

    // Primera carga: scroll instantáneo al final
    if (isFirstLoadRef.current && messagesToDisplay.length > 0 && !isLoading) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
        isFirstLoadRef.current = false;
      }, 100);
    }
    // Si terminamos de cargar mensajes antiguos, posicionarse en el primer mensaje de la respuesta del backend
    else if (
      wasLoadingRef.current &&
      !isLoading &&
      isLoadingOlderMessagesRef.current &&
      messagesToDisplay.length > 0
    ) {
      console.log("Positioning scroll after loading older messages..."); // Debug
      setTimeout(() => {
        // El primer mensaje del array es el más reciente que devolvió el backend
        const firstMessageId = messagesToDisplay[0]?.id;
        console.log("Looking for message ID:", firstMessageId); // Debug
        if (firstMessageId) {
          const element = document.querySelector(
            `[data-message-id="${firstMessageId}"]`
          ) as HTMLElement;
          if (element) {
            console.log("Found element, scrolling..."); // Debug
            element.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          } else {
            console.log("Element not found!"); // Debug
          }
        }
        isLoadingOlderMessagesRef.current = false;
        console.log("Finished positioning scroll"); // Debug
      }, 200); // Aumentamos el delay para dar más tiempo al DOM
    }
    // Para mensajes nuevos reales (no carga de páginas)
    else if (
      !isFirstLoadRef.current &&
      !isLoading &&
      !isLoadingOlderMessagesRef.current &&
      currentMessageCount > previousMessageCount &&
      currentMessageCount - previousMessageCount <= 3
    ) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }

    wasLoadingRef.current = isLoading;
    previousMessageCountRef.current = currentMessageCount;
  }, [messagesToDisplay, isLoading, isSearchMode]);

  // Marcar cuando inicia la carga de mensajes antiguos
  useEffect(() => {
    if (
      isFetchingNextPage &&
      hasMoreMessages &&
      !isLoadingOlderMessagesRef.current &&
      !isSearchMode
    ) {
      console.log("Starting to load older messages..."); // Debug
      isLoadingOlderMessagesRef.current = true;
      // Guardar el ID del primer mensaje actual para referencia
      if (messagesToDisplay.length > 0) {
        firstMessageIdRef.current = messagesToDisplay[0].id;
        console.log("Saved first message ID:", firstMessageIdRef.current); // Debug
      }
    }
  }, [isFetchingNextPage, hasMoreMessages, messagesToDisplay, isSearchMode]);

  // Auto-load cuando hace scroll hacia arriba
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loadMoreFunction || !hasMore) return;

    const handleScroll = () => {
      // Verificar si está cerca del top Y no está cargando Y no está en proceso de auto-carga
      if (
        container.scrollTop <= 200 &&
        !isFetching &&
        !isAutoLoadingRef.current
      ) {
        console.log(
          "Triggering load more...",
          isSearchMode ? "SEARCH" : "NORMAL"
        ); // Debug
        isAutoLoadingRef.current = true;
        loadMoreFunction();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMoreFunction, hasMore, isFetching, isSearchMode]);

  // Reset auto-loading flag cuando termina la carga o cambia el estado
  useEffect(() => {
    if (!isFetching && isAutoLoadingRef.current) {
      console.log("Resetting auto-loading flag..."); // Debug
      // Pequeño delay para asegurar que el DOM se actualice
      setTimeout(() => {
        isAutoLoadingRef.current = false;
      }, 100);
    }
  }, [isFetching, messagesToDisplay.length]); // Agregamos messagesToDisplay.length como dependencia

  // CLAVE: Invertir el array de mensajes para renderizado correcto
  // Backend envía DESC (más reciente primero), pero necesitamos mostrar ASC (cronológico)
  const messagesForDisplay = [...messagesToDisplay].reverse();

  // Agrupar mensajes por fecha usando el array invertido y el hook de formateo
  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessageDTO[] } = {};

    messagesForDisplay.forEach((message) => {
      // Usar el hook para formatear la fecha del separador
      const dateKey = formatDateSeparator(message.sentAt);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  // Ordenar fechas de más antigua a más reciente para el renderizado
  const sortedDateKeys = Object.keys(messageGroups).sort((a, b) => {
    // Para ordenar correctamente, necesitamos comparar las fechas originales
    const getOriginalDate = (formattedDate: string) => {
      // Encontrar el primer mensaje de este grupo para obtener la fecha original
      const messagesInGroup = messageGroups[formattedDate];
      return messagesInGroup[0]?.sentAt || '';
    };
    
    const dateA = new Date(getOriginalDate(a));
    const dateB = new Date(getOriginalDate(b));
    return dateA.getTime() - dateB.getTime();
  });

  if (messagesToDisplay.length === 0 && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (messagesToDisplay.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-grey-500">
        <p className="text-center">
          {isSearchMode
            ? `No se encontraron resultados para "${searchTerm}"`
            : "No hay mensajes en esta conversación."}
        </p>
        {!isSearchMode && (
          <p className="text-sm mt-2 text-center">
            Escribe un mensaje para comenzar a chatear.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 bg-grey-100 h-full"
      style={{ scrollbarWidth: "thin" }}
    >
      {/* Indicador de carga en la parte superior */}
      {hasMore && (
        <div className="flex justify-center mb-4">
          {isFetching ? (
            <div className="py-2">
              <LoadingSpinner size="sm" />
              <p className="text-xs text-grey-500 mt-1 text-center">
                {isSearchMode
                  ? "Cargando más resultados..."
                  : "Cargando mensajes anteriores..."}
              </p>
            </div>
          ) : (
            <div className="text-xs text-grey-500 text-center py-2">
              {isSearchMode
                ? "Haz scroll hacia arriba para cargar más resultados"
                : "Haz scroll hacia arriba para cargar mensajes anteriores"}
            </div>
          )}
        </div>
      )}

      {/* Renderizar mensajes agrupados por fecha en orden cronológico */}
      {sortedDateKeys.map((dateKey) => {
        const messageGroup = messageGroups[dateKey];

        return (
          <div key={dateKey} className="mb-6">
            {/* Fecha como separador - usando el dateKey que ya está formateado con el hook */}
            <div className="flex justify-center mb-4">
              <div className="bg-tertiary-50 text-tertiary-700 text-xs px-3 py-1 rounded-full">
                {dateKey}
              </div>
            </div>

            {/* Mensajes del día en orden cronológico */}
            {messageGroup.map((message) => {
              // Para búsqueda, usar el índice directo; para modo normal, encontrar en array original
              const globalIndex = isSearchMode
                ? searchMessages.findIndex((m) => m.id === message.id)
                : messages.findIndex((m) => m.id === message.id);

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  globalIndex={globalIndex}
                  searchTerm={searchTerm}
                  isGroupChat={isGroupChat}
                  isSearchMode={isSearchMode}
                />
              );
            })}
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;