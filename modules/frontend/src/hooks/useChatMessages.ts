// src/hooks/useChatMessages.ts
import { useCallback, useEffect, useMemo } from 'react';
import { useInfinitePagination } from '@/hooks/useInfinitePagination';
import { ChatMessageDTO, ConversationDTO } from '@/model/chats/Chat';
import { 
  getMessagesPaginated, 
  getMessagesGroupPaginated 
} from '@/service/chat/ChatService';
import { useChatMessagesStore } from './ChatMessagesStore';

interface UseChatMessagesProps {
  selectedChat: ConversationDTO | null;
  pageSize?: number;
}

export const useChatMessages = ({ 
  selectedChat, 
  pageSize = 20 
}: UseChatMessagesProps) => {
  const { 
    setMessages, 
    getMessages,
    addPendingMessage,
    removePendingMessage 
  } = useChatMessagesStore();

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
          pageable: { pageNumber: 0, pageSize },
          size: pageSize,
          totalElements: 0,
          totalPages: 0,
        };
      }

      try {
        const isWazend = selectedChat.conversationType === "WAZEND";
        const isGroup = selectedChat.conversationType === "WAZEND_GROUP";

        let response;
        if (isWazend && selectedChat.wazend) {
          response = await getMessagesPaginated(
            selectedChat.conversationId,
            page,
            pageSize,
            selectedChat.wazend.id
          );
        } else if (isGroup && selectedChat.wazendGroup) {
          response = await getMessagesGroupPaginated(
            selectedChat.conversationId,
            page,
            pageSize
          );
        } else {
          response = await getMessagesPaginated(
            selectedChat.conversationId, 
            page, 
            pageSize
          );
        }

        return response;
      } catch (error) {
        console.error('💥 Error al obtener mensajes:', error);
        throw error;
      }
    },
    queryParams: {},
    enabled: !!selectedChat?.conversationId,
    refetchOnWindowFocus: false,
  });

  // Sincronizar mensajes de paginación con el store
  useEffect(() => {
    if (selectedChat?.conversationId && messagesPagination.items.length > 0) {
      console.log(`📱 Sincronizando ${messagesPagination.items.length} mensajes con store`);
      setMessages(selectedChat.conversationId, messagesPagination.items as ChatMessageDTO[]);
    }
  }, [selectedChat?.conversationId, messagesPagination.items, setMessages]);

  // Limpiar mensajes cuando cambia de chat
  useEffect(() => {
    return () => {
      if (selectedChat?.conversationId) {
        // No limpiar inmediatamente para permitir transiciones suaves
        // clearMessages(selectedChat.conversationId);
      }
    };
  }, [selectedChat?.conversationId]);

  // Obtener mensajes combinados (paginación + tiempo real)
  const allMessages = useMemo(() => {
    if (!selectedChat?.conversationId) return [];
    
    const storeMessages = getMessages(selectedChat.conversationId);
    const paginationMessages = messagesPagination.items as ChatMessageDTO[];
    
    // Si el store tiene mensajes, usar esos (incluyen tiempo real)
    if (storeMessages.length > 0) {
      return storeMessages;
    }
    
    // Fallback a mensajes de paginación
    return paginationMessages;
  }, [selectedChat?.conversationId, getMessages, messagesPagination.items]);

  // Función para agregar mensaje temporal (optimistic update)
  const addTemporaryMessage = useCallback((message: Omit<ChatMessageDTO, 'id'>) => {
    if (!selectedChat?.conversationId) return null;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage: ChatMessageDTO = {
      ...message,
      id: tempId as any, // Usar string temporal como ID
      sentAt: new Date().toISOString(),
    };

    console.log('📤 Agregando mensaje temporal:', tempMessage);
    addPendingMessage(selectedChat.conversationId, tempMessage);
    
    return tempId;
  }, [selectedChat?.conversationId, addPendingMessage]);

  // Función para confirmar mensaje temporal
  const confirmTemporaryMessage = useCallback((tempId: string, realMessage: ChatMessageDTO) => {
    if (!selectedChat?.conversationId) return;

    console.log('✅ Confirmando mensaje temporal:', tempId, '→', realMessage.id);
    removePendingMessage(selectedChat.conversationId, tempId);
    // El mensaje real se agregará via WebSocket
  }, [selectedChat?.conversationId, removePendingMessage]);

  // Función para invalidar y refrescar
  const refreshMessages = useCallback(() => {
    console.log('🔄 Refrescando mensajes...');
    messagesPagination.invalidateQueries();
  }, [messagesPagination.invalidateQueries]);

  // Función para cargar más mensajes
  const loadMoreMessages = useCallback(() => {
    if (messagesPagination.hasNextPage && !messagesPagination.isFetchingNextPage) {
      console.log('📜 Cargando más mensajes...');
      messagesPagination.fetchNextPage();
    }
  }, [messagesPagination.hasNextPage, messagesPagination.isFetchingNextPage, messagesPagination.fetchNextPage]);

  return {
    // Mensajes combinados (paginación + tiempo real)
    messages: allMessages,
    
    // Estados de carga
    isLoading: messagesPagination.isLoading,
    isFetchingNextPage: messagesPagination.isFetchingNextPage,
    hasMoreMessages: messagesPagination.hasNextPage,
    
    // Referencias
    lastItemRef: messagesPagination.lastItemRef,
    
    // Acciones
    refreshMessages,
    loadMoreMessages,
    addTemporaryMessage,
    confirmTemporaryMessage,
    
    // Funciones de utilidad
    invalidateQueries: messagesPagination.invalidateQueries,
  };
};