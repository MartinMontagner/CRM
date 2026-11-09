import { useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { ConversationUpdateDTO } from '@/service/websocket/WebSocketService';
import { ChatMessageDTO, ConversationDTO } from '@/model/chats/Chat';
import { useRefreshChatStore } from '@/state/chat/RefreshChatStore';

interface UseRealTimeUpdatesProps {
  selectedChat: ConversationDTO | null;
  onConversationUpdate?: (conversation: ConversationDTO) => void;
  onConversationDeleted?: (conversationId: number) => void;
  onNewMessage?: (message: ChatMessageDTO) => void;
  onUnreadCountUpdate?: (conversationId: number, count: number) => void;
  refreshConversations?: () => void;
  refreshMessages?: () => void;
}

export const useRealTimeUpdates = ({
  selectedChat,
  onConversationUpdate,
  onConversationDeleted,
  onNewMessage,
  onUnreadCountUpdate,
  refreshConversations,
  refreshMessages,
}: UseRealTimeUpdatesProps) => {
  const {
    isConnected,
    subscribeToChat,
    unsubscribeFromChat,
    onNewMessage: onNewMessageWS,
    onConversationUpdate: onConversationUpdateWS,
    removeMessageHandler,
    removeConversationUpdateHandler,
  } = useWebSocket();

  const { isRealTimeEnabled, updateLastRefresh } = useRefreshChatStore();
  const lastSelectedChatRef = useRef<number | null>(null);

  // Manejador de nuevos mensajes
  const handleNewMessage = useCallback(
    (message: ChatMessageDTO) => {
      if (!message || !isRealTimeEnabled) return;

      console.log('📨 Nuevo mensaje recibido:', message);

      // Verificar si es del chat seleccionado
      const isSelectedChatMessage = selectedChat && 
        selectedChat.conversationId === message.conversationId;

      // Llamar callback personalizado
      if (onNewMessage) {
        onNewMessage(message);
      }

      // Refrescar mensajes si es del chat seleccionado
      if (isSelectedChatMessage && refreshMessages) {
        console.log('🔄 Refrescando mensajes del chat seleccionado');
        refreshMessages();
      }

      // Siempre refrescar conversaciones para actualizar el último mensaje
      if (refreshConversations) {
        console.log('🔄 Refrescando lista de conversaciones');
        refreshConversations();
      }

      updateLastRefresh();
    },
    [selectedChat, onNewMessage, refreshMessages, refreshConversations, isRealTimeEnabled, updateLastRefresh]
  );

  // Manejador de actualizaciones de conversación
  const handleConversationUpdate = useCallback(
    (update: ConversationUpdateDTO) => {
      if (!update || !isRealTimeEnabled) return;

      console.log(`📨 Actualización de conversación:`, update.type, update.conversationId);

      switch (update.type) {
        case 'CONVERSATION_CREATED':
          console.log('🆕 Nueva conversación creada');
          if (refreshConversations) {
            refreshConversations();
          }
          break;

        case 'CONVERSATION_UPDATED':
          console.log('🔄 Conversación actualizada');
          if (update.conversation && onConversationUpdate) {
            onConversationUpdate(update.conversation);
          }
          if (refreshConversations) {
            refreshConversations();
          }
          break;

        case 'CONVERSATION_DELETED':
          console.log('🗑️ Conversación eliminada:', update.conversationId);
          if (update.conversationId && onConversationDeleted) {
            onConversationDeleted(update.conversationId);
          }
          if (refreshConversations) {
            refreshConversations();
          }
          break;

        case 'UNREAD_COUNT_UPDATED':
          console.log('📊 Contador actualizado:', update.conversationId, update.unreadCount);
          if (update.conversationId && update.unreadCount !== undefined && onUnreadCountUpdate) {
            onUnreadCountUpdate(update.conversationId, update.unreadCount);
          }
          if (refreshConversations) {
            refreshConversations();
          }
          break;
      }

      updateLastRefresh();
    },
    [onConversationUpdate, onConversationDeleted, onUnreadCountUpdate, refreshConversations, isRealTimeEnabled, updateLastRefresh]
  );

  // Configurar suscripciones a actualizaciones de conversaciones
  useEffect(() => {
    if (!isConnected || !onConversationUpdateWS) return;

    console.log('📡 Configurando suscripción a actualizaciones de conversaciones');
    
    const updateHandler = (update: ConversationUpdateDTO) => {
      handleConversationUpdate(update);
    };

    onConversationUpdateWS(updateHandler);

    return () => {
      if (removeConversationUpdateHandler) {
        removeConversationUpdateHandler(updateHandler);
      }
    };
  }, [isConnected, onConversationUpdateWS, handleConversationUpdate, removeConversationUpdateHandler]);

  // Configurar suscripción al chat seleccionado
  useEffect(() => {
    if (!isConnected || !selectedChat?.conversationId) {
      return;
    }

    // Evitar suscripciones duplicadas
    if (lastSelectedChatRef.current === selectedChat.conversationId) {
      return;
    }

    // Desuscribirse del chat anterior si existe
    if (lastSelectedChatRef.current && unsubscribeFromChat) {
      console.log(`📱 Desuscribiéndose del chat anterior: ${lastSelectedChatRef.current}`);
      unsubscribeFromChat(lastSelectedChatRef.current);
    }

    lastSelectedChatRef.current = selectedChat.conversationId;

    // Suscribirse al nuevo chat
    if (subscribeToChat && onNewMessageWS) {
      console.log(`📱 Suscribiéndose al chat: ${selectedChat.conversationId}`);
      subscribeToChat(selectedChat.conversationId);

      const messageHandler = (message: ChatMessageDTO) => {
        handleNewMessage(message);
      };

      onNewMessageWS(selectedChat.conversationId, messageHandler);

      // Cleanup para este chat específico
      return () => {
        if (removeMessageHandler) {
          removeMessageHandler(selectedChat.conversationId, messageHandler);
        }
      };
    }
  }, [
    isConnected,
    selectedChat?.conversationId,
    subscribeToChat,
    unsubscribeFromChat,
    onNewMessageWS,
    removeMessageHandler,
    handleNewMessage,
  ]);

  // Cleanup general cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (lastSelectedChatRef.current && unsubscribeFromChat) {
        console.log(`📱 Cleanup: desuscribiéndose del chat: ${lastSelectedChatRef.current}`);
        unsubscribeFromChat(lastSelectedChatRef.current);
      }
      lastSelectedChatRef.current = null;
    };
  }, [unsubscribeFromChat]);

  return {
    isConnected,
    isRealTimeEnabled,
    currentChatId: lastSelectedChatRef.current,
  };
};