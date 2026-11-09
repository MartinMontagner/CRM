// src/types/websocket.ts

/**
 * Estados de conexión WebSocket
 */
export enum WebSocketConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

/**
 * Tipos de eventos WebSocket
 */
export enum WebSocketEventType {
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  CONVERSATION_UPDATED = 'CONVERSATION_UPDATED',
  CONVERSATION_CREATED = 'CONVERSATION_CREATED',
  CONVERSATION_DELETED = 'CONVERSATION_DELETED',
  UNREAD_COUNT_UPDATED = 'UNREAD_COUNT_UPDATED',
  CONNECTION_STATUS_CHANGED = 'CONNECTION_STATUS_CHANGED'
}

/**
 * Configuración WebSocket
 */
export interface WebSocketConfig {
  url: string;
  token: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

/**
 * Estadísticas de conexión WebSocket
 */
export interface WebSocketStats {
  connectedAt: Date | null;
  lastMessageAt: Date | null;
  reconnectAttempts: number;
  messagesReceived: number;
  conversationUpdatesReceived: number;
}

/**
 * Evento WebSocket genérico
 */
export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp: Date;
  conversationId?: number;
}

/**
 * Respuesta del servidor WebSocket
 */
export interface WebSocketServerResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}