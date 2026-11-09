// src/model/chats/ConversationUpdateDTO.ts
import { ConversationDTO } from "./Chat";

/**
 * DTO para manejar actualizaciones granulares de conversaciones via WebSocket
 */
export interface ConversationUpdateDTO {
  type: 'CONVERSATION_UPDATED' | 'CONVERSATION_CREATED' | 'CONVERSATION_DELETED' | 'UNREAD_COUNT_UPDATED';
  conversationId?: number;
  conversation?: ConversationDTO;
  unreadCount?: number;
  timestamp: string;
}