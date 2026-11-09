// src/state/chat/ChatMessagesStore.ts
import { create } from 'zustand';
import { ChatMessageDTO } from '@/model/chats/Chat';

interface ChatMessagesState {
  // Mensajes por conversación
  messagesByConversation: Record<number, ChatMessageDTO[]>;
  
  // Mensajes temporales (enviados pero no confirmados)
  pendingMessages: Record<number, ChatMessageDTO[]>;
  
  // Acciones
  addMessage: (conversationId: number, message: ChatMessageDTO) => void;
  addPendingMessage: (conversationId: number, message: ChatMessageDTO) => void;
  removePendingMessage: (conversationId: number, tempId: string) => void;
  setMessages: (conversationId: number, messages: ChatMessageDTO[]) => void;
  clearMessages: (conversationId: number) => void;
  getMessages: (conversationId: number) => ChatMessageDTO[];
  
  // Utilidades
  isMessageExists: (conversationId: number, messageId: number | string) => boolean;
  updateMessage: (conversationId: number, messageId: number | string, updates: Partial<ChatMessageDTO>) => void;
}

export const useChatMessagesStore = create<ChatMessagesState>((set, get) => ({
  messagesByConversation: {},
  pendingMessages: {},

  addMessage: (conversationId: number, message: ChatMessageDTO) => {
    set((state) => {
      const existingMessages = state.messagesByConversation[conversationId] || [];
      
      // Verificar si el mensaje ya existe (evitar duplicados)
      const messageExists = existingMessages.some(
        (msg) => msg.id === message.id || msg.whatsappMessageId === message.whatsappMessageId
      );
      
      if (messageExists) {
        console.log('📱 Mensaje ya existe, ignorando duplicado:', message.id);
        return state;
      }

      // Agregar el nuevo mensaje al final (más reciente)
      const updatedMessages = [...existingMessages, message];
      
      // Ordenar por fecha para mantener orden cronológico
      updatedMessages.sort((a, b) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );

      console.log(`📱 Agregando mensaje a conversación ${conversationId}:`, message);

      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  addPendingMessage: (conversationId: number, message: ChatMessageDTO) => {
    set((state) => {
      const existingPending = state.pendingMessages[conversationId] || [];
      
      return {
        ...state,
        pendingMessages: {
          ...state.pendingMessages,
          [conversationId]: [...existingPending, message],
        },
      };
    });
  },

  removePendingMessage: (conversationId: number, tempId: string) => {
    set((state) => {
      const existingPending = state.pendingMessages[conversationId] || [];
      
      return {
        ...state,
        pendingMessages: {
          ...state.pendingMessages,
          [conversationId]: existingPending.filter((msg) => String(msg.id) !== tempId),
        },
      };
    });
  },

  setMessages: (conversationId: number, messages: ChatMessageDTO[]) => {
    set((state) => {
      // Ordenar mensajes por fecha
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );

      console.log(`📱 Estableciendo ${sortedMessages.length} mensajes para conversación ${conversationId}`);

      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: sortedMessages,
        },
      };
    });
  },

  clearMessages: (conversationId: number) => {
    set((state) => {
      const newState = { ...state };
      delete newState.messagesByConversation[conversationId];
      delete newState.pendingMessages[conversationId];
      
      console.log(`📱 Limpiando mensajes de conversación ${conversationId}`);
      
      return newState;
    });
  },

  getMessages: (conversationId: number) => {
    const state = get();
    const messages = state.messagesByConversation[conversationId] || [];
    const pending = state.pendingMessages[conversationId] || [];
    
    // Combinar mensajes reales y pendientes
    const allMessages = [...messages, ...pending];
    
    // Ordenar por fecha
    return allMessages.sort((a, b) => 
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  },

  isMessageExists: (conversationId: number, messageId: number | string) => {
    const state = get();
    const messages = state.messagesByConversation[conversationId] || [];
    
    return messages.some(
      (msg) => msg.id === messageId || msg.whatsappMessageId === messageId
    );
  },

  updateMessage: (conversationId: number, messageId: number | string, updates: Partial<ChatMessageDTO>) => {
    set((state) => {
      const messages = state.messagesByConversation[conversationId] || [];
      
      const updatedMessages = messages.map((msg) => {
        if (msg.id === messageId || msg.whatsappMessageId === messageId) {
          return { ...msg, ...updates };
        }
        return msg;
      });

      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
      };
    });
  },
}));