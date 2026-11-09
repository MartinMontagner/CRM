/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/state/store";
import { useInfinitePagination } from "@/hooks/useInfinitePagination";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useFilterSelectedStore } from "./FilterSelectedStore";
import {
  ChatMessageDTO,
  ConversationDTO,
  SendMessageRequestDTO,
} from "@/model/chats/Chat";

import {
  getFilteredChats,
  getMessagesPaginated,
  getMessagesGroupPaginated,
  sendMessage,
} from "@/service/chat/ChatService";
import { sendWazendMessage } from "@/service/chat/WazendService";
import useMobileViewDetector from "@/hooks/useMobileViewDetector";
import { useConversation } from "@/hooks/useConversation";

// Imports de componentes
import ChatWindow from "./ChatWindow";
import Sidebar from "./Sidebar";
import { useSearchParams } from "react-router-dom";

const WhatsAppComponent = () => {
  const authData = useAppStore((state) => state.authData);
  const [selectedChat, setSelectedChat] = useState<ConversationDTO | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isMobileView = useMobileViewDetector();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchParams, setSearchParams] = useSearchParams();
  useConversation(selectedChat, setSelectedChat);

  // ✅ Estado para actualizaciones optimistas específicas
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<number, ConversationDTO>>(new Map());

  // Store de filtros
  const filterStore = useFilterSelectedStore();
  const {
    selectedFilters,
    searchText,
    advancedFilters,
    isAdvancedFilterActive,
    readStatus,
    selectedPlatform,
    selectedStudentTags,
    wazendInstanceId
  } = filterStore;

  // Paginación para conversaciones
  const conversationsPagination = useInfinitePagination<ConversationDTO, {}>({
    queryKey: [
      "conversations",
      selectedFilters,
      searchText,
      advancedFilters,
      readStatus,
      selectedPlatform,
      selectedStudentTags,
      wazendInstanceId ?? "", 
    ],
    queryFn: async ({ page }) => {
      try {
        const searchTextArray = searchText ? [searchText] : [];
        const response = await getFilteredChats(
          selectedFilters,
          page,
          searchTextArray,
          isAdvancedFilterActive ? advancedFilters : {},
          wazendInstanceId,
          readStatus,
          selectedPlatform,
          selectedStudentTags
        );
        return response;
      } catch (error) {
        console.error("💥 Error al obtener conversaciones:", error);
        return {
          content: [],
          empty: true,
          first: true,
          last: true,
          number: 0,
          numberOfElements: 0,
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            paged: true,
            unpaged: false,
          },
          size: 10,
          sort: { empty: true, sorted: false, unsorted: true },
          totalElements: 0,
          totalPages: 0,
        };
      }
    },
    queryParams: {},
    refetchOnWindowFocus: false,
  });

  // Paginación para mensajes
  const messagesPagination = useInfinitePagination<ChatMessageDTO, {}>({
    queryKey: ["messages", selectedChat?.conversationId || "no-chat"],
    queryFn: async ({ page }) => {
      if (!selectedChat) {
        return {
          content: [],
          empty: true,
          first: true,
          last: true,
          number: 0,
          numberOfElements: 0,
          pageable: { pageNumber: 0, pageSize: 10 },
          size: 10,
          totalElements: 0,
          totalPages: 0,
        };
      }

      const isWazend = selectedChat.conversationType === "WAZEND";
      const isGroup = selectedChat.conversationType === "WAZEND_GROUP";

      if (isWazend && selectedChat.wazend) {
        return await getMessagesPaginated(
          selectedChat.conversationId,
          page,
          20,
          selectedChat.wazend.id
        );
      } else if (isGroup && selectedChat.wazendGroup) {
        return await getMessagesGroupPaginated(
          selectedChat.conversationId,
          page,
          20
        );
      } else {
        return await getMessagesPaginated(
          selectedChat.conversationId,
          page,
          20
        );
      }
    },
    queryParams: {},
    enabled: !!selectedChat?.conversationId,
    refetchOnWindowFocus: false,
  });

  // ✅ Aplicar actualizaciones optimistas a las conversaciones
  const conversations = useMemo(() => {
    const baseConversations = conversationsPagination.items as ConversationDTO[];
    if (optimisticUpdates.size === 0) return baseConversations;
    
    return baseConversations.map(conv => {
      const optimisticUpdate = optimisticUpdates.get(conv.conversationId);
      return optimisticUpdate || conv;
    });
  }, [conversationsPagination.items, optimisticUpdates]);
  
  const messages = messagesPagination.items as ChatMessageDTO[];

  // 🚀 Hook de actualizaciones en tiempo real
  useRealTimeUpdates({
    selectedChat,
    onConversationUpdate: (conversation) => {
      console.log("🔄 Conversación actualizada:", conversation.conversationId);
      // Si es el chat seleccionado, actualizarlo
      if (
        selectedChat &&
        conversation.conversationId === selectedChat.conversationId
      ) {
        setSelectedChat(conversation);
      }
    },
    onConversationDeleted: (conversationId) => {
      console.log("🗑️ Conversación eliminada:", conversationId);
      // Si es el chat seleccionado, deseleccionarlo
      if (selectedChat && conversationId === selectedChat.conversationId) {
        setSelectedChat(null);
      }
    },
    onNewMessage: (message) => {
      console.log("📨 Nuevo mensaje recibido:", message);
      conversationsPagination.invalidateQueries();
    },
    onUnreadCountUpdate: (conversationId, count) => {
      console.log("📊 Contador actualizado:", conversationId, count);
      // Si es el chat seleccionado, actualizar el contador
      if (selectedChat && conversationId === selectedChat.conversationId) {
        setSelectedChat((prev) =>
          prev
            ? {
                ...prev,
                unreadCount: count,
                hasUnread: count > 0,
              }
            : null
        );
      }
    },
    refreshConversations: () => {
      conversationsPagination.invalidateQueries();
      messagesPagination.invalidateQueries();
    },
    refreshMessages: () => {
      messagesPagination.invalidateQueries();
    },
  });

  // Función para manejar mensajes como leídos
  const handleMessagesRead = useCallback(
    (conversationId: number) => {
      if (!conversationId) return;

      const conversationIdNum =
        typeof conversationId === "string"
          ? parseInt(conversationId, 10)
          : conversationId;

      if (selectedChat && selectedChat.conversationId === conversationIdNum) {
        setSelectedChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            unreadCount: 0,
            hasUnread: false,
          };
        });
      }

      // Invalidar las consultas de conversaciones
      conversationsPagination.invalidateQueries();
      setTimeout(() => {
        conversationsPagination.refetch();
      }, 500);
    },
    [selectedChat, conversationsPagination]
  );

  // Función para seleccionar un chat
  const handleSelectChat = useCallback(
    (chat: ConversationDTO) => {
      if (!chat) return;

      // Verificar si ya está seleccionado
      if (selectedChat?.conversationId === chat.conversationId) {
        console.log("🔄 Chat ya seleccionado, ignorando");
        return;
      }

      console.log(`📱 Seleccionando chat: ${chat.conversationId}`);
      
      // Actualizar URL primero (esto triggerará useConversation)
      setSearchParams({ chat: chat.conversationId.toString() });
      
      // Solo invalidar queries si es necesario
      messagesPagination.invalidateQueries();
    },
    [selectedChat?.conversationId, messagesPagination, setSearchParams]
  );

  // Función para volver a la lista de chats (en vista móvil)
  const handleBackToList = useCallback(() => {
    setSelectedChat(null);
  }, []);

  // Función para manejar eliminación de conversación
  const handleConversationDeleted = useCallback(() => {
    setSelectedChat(null);
    conversationsPagination.refetch();
  }, [conversationsPagination]);

  // ✅ Función optimista para manejar conversación actualizada
  const handleConversationUpdated = useCallback(
    (updatedChat: ConversationDTO) => {
      if (updatedChat) {
        console.log(
          "🔄 Conversación actualizada desde componente:",
          updatedChat.conversationId
        );
        
        // ✅ 1. Actualizar selectedChat inmediatamente
        setSelectedChat(updatedChat);
        
        // ✅ 2. Guardar actualización optimista para esta conversación específica
        setOptimisticUpdates(prev => new Map(prev.set(updatedChat.conversationId, updatedChat)));
        
        // ✅ 3. Limpiar la actualización optimista después de que el backend confirme
        setTimeout(() => {
          setOptimisticUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(updatedChat.conversationId);
            return newMap;
          });
          // Refetch suave en background
          conversationsPagination.invalidateQueries();
        }, 1000);
      }
    },
    [conversationsPagination]
  );

  // Función para enviar mensaje
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (
        !selectedChat ||
        !selectedChat.conversationId ||
        !selectedChat.phoneNumber ||
        !text.trim() ||
        !authData?.accessToken
      )
        return;

      setIsSending(true);
      try {
        console.log(`📤 Enviando mensaje a: ${selectedChat.phoneNumber}`);

        const inGroupChat = selectedChat.conversationType === "WAZEND_GROUP";

        const messageRequest: SendMessageRequestDTO = {
          phoneNumber: inGroupChat
            ? `${selectedChat.phoneNumber}@g.us`
            : selectedChat.phoneNumber,
          content: text,
          sender: "USER",
          messageType: "TEXT",
        };

        switch (selectedChat.conversationType) {
          case "WAZEND":
            if (selectedChat.wazend) {
              messageRequest.platform = "WAZEND";
              await sendWazendMessage(
                messageRequest,
                selectedChat.wazend.id,
                false
              );
            }
            break;
          case "WAZEND_GROUP":
            if (selectedChat.wazend) {
              messageRequest.platform = "WAZEND_GROUP";
              await sendWazendMessage(
                messageRequest,
                selectedChat.wazend.id,
                true,
                selectedChat.conversationId
              );
            }
            break;
          default:
            messageRequest.platform = "WHATSAPP";
            await sendMessage(messageRequest);
            break;
        }

        // Las actualizaciones vendrán por WebSocket automáticamente
        // Solo invalidamos como fallback
        conversationsPagination.invalidateQueries();
        messagesPagination.invalidateQueries();

        console.log("✅ Mensaje enviado exitosamente");
      } catch (error) {
        console.error("💥 Error al enviar mensaje:", error);
      } finally {
        setIsSending(false);
      }
    },
    [
      selectedChat,
      authData?.accessToken,
      conversationsPagination,
      messagesPagination,
    ]
  );

  // Función para formatear el número de teléfono
  const formatPhoneNumber = useCallback((phone: string) => {
    try {
      if (!phone) return "";
      return phone.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "+$1 $2-$3-$4");
    } catch (error) {
      console.error("💥 Error formateando número de teléfono:", error);
      return phone || "";
    }
  }, []);

  // Función para manejar la creación de nuevos chats
  const handleCreateNewChat = useCallback(() => {
    console.log("🆕 Solicitando actualización por nuevo chat");
    conversationsPagination.refetch();
  }, [conversationsPagination]);

  // Aplicar filtros locales a las conversaciones
  const filteredItems = filterStore.applyFilters(conversations);

  // Vista móvil
  if (isMobileView) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-full w-full bg-grey-100"
      >
        {!selectedChat ? (
          <Sidebar
            conversations={filteredItems}
            onSelectChat={handleSelectChat}
            loading={conversationsPagination.isLoading}
            currentChatId={null}
            isFetchingNextPage={conversationsPagination.isFetchingNextPage}
            hasNextPage={conversationsPagination.hasNextPage}
            fetchNextPage={conversationsPagination.fetchNextPage}
            isMobileView={true}
            onCreateNewChat={handleCreateNewChat}
            formatPhoneNumber={formatPhoneNumber}
          />
        ) : (
          <div className="flex-1 h-full overflow-hidden">
            <ChatWindow
              isGroupChat={selectedChat.conversationType === "WAZEND_GROUP"}
              selectedChat={selectedChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              isSending={isSending}
              onLoadMore={messagesPagination.fetchNextPage}
              hasMoreMessages={messagesPagination.hasNextPage}
              isLoadingMessages={messagesPagination.isLoading}
              isFetchingNextPage={messagesPagination.isFetchingNextPage}
              lastItemRef={messagesPagination.lastItemRef}
              isMobileView={true}
              onBackToList={handleBackToList}
              formatPhoneNumber={formatPhoneNumber}
              onConversationDeleted={handleConversationDeleted}
              onConversationUpdated={handleConversationUpdated}
              onMessagesRead={handleMessagesRead}
            />
          </div>
        )}
      </motion.div>
    );
  }

  // Vista de escritorio
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full w-full bg-grey-100"
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={filteredItems}
          onSelectChat={handleSelectChat}
          loading={conversationsPagination.isLoading}
          currentChatId={selectedChat?.conversationId}
          isFetchingNextPage={conversationsPagination.isFetchingNextPage}
          hasNextPage={conversationsPagination.hasNextPage}
          fetchNextPage={conversationsPagination.fetchNextPage}
          isMobileView={false}
          onCreateNewChat={handleCreateNewChat}
          formatPhoneNumber={formatPhoneNumber}
        />
        <div className="flex-1 h-full overflow-hidden">
          <ChatWindow
            isGroupChat={selectedChat?.conversationType === "WAZEND_GROUP"}
            selectedChat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
            onLoadMore={messagesPagination.fetchNextPage}
            hasMoreMessages={messagesPagination.hasNextPage}
            isLoadingMessages={messagesPagination.isLoading}
            isFetchingNextPage={messagesPagination.isFetchingNextPage}
            lastItemRef={messagesPagination.lastItemRef}
            isMobileView={false}
            formatPhoneNumber={formatPhoneNumber}
            onConversationDeleted={handleConversationDeleted}
            onConversationUpdated={handleConversationUpdated}
            onMessagesRead={handleMessagesRead}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppComponent;