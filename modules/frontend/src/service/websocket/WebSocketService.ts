// src/service/websocket/WebSocketService.ts
import { ChatMessageDTO, ConversationDTO } from '@/model/chats/Chat';
import { Client, Frame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Agregar interfaz para las actualizaciones de conversación
export interface ConversationUpdateDTO {
  type: 'CONVERSATION_UPDATED' | 'CONVERSATION_CREATED' | 'CONVERSATION_DELETED' | 'UNREAD_COUNT_UPDATED';
  conversationId?: number;
  conversation?: ConversationDTO;
  unreadCount?: number;
  timestamp: string;
}

export class WebSocketService {
  private client: Client | null = null;
  private messageSubscriptions: Map<number, StompSubscription> = new Map();
  private conversationSubscription: StompSubscription | null = null;
  private conversationUpdateSubscription: StompSubscription | null = null;
  private messageHandlers: Map<number, ((message: ChatMessageDTO) => void)[]> = new Map();
  private conversationHandlers: ((conversations: ConversationDTO[]) => void)[] = [];
  private conversationUpdateHandlers: ((update: ConversationUpdateDTO) => void)[] = [];

  constructor(private readonly token: string) { }

  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const backendUrl = BACKEND_URL;

        console.log(`🔌 Conectando WebSocket a ${backendUrl}/ws`);

        const socket = new SockJS(`${backendUrl}/ws`);

        socket.onopen = () => console.log('✅ SockJS socket abierto');
        socket.onclose = (e) => console.log('❌ SockJS socket cerrado', e);
        socket.onerror = (e) => console.error('💥 SockJS socket error', e);

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            'Authorization': `Bearer ${this.token}`
          },
          onDisconnect: () => {
            console.log('🔌 Desconectado del WebSocket');
            this.handleDisconnection();
          },
          onWebSocketError: (error) => {
            console.error('💥 WebSocket error:', error);
            reject(error);
          }
        });

        this.client.onConnect = () => {
          console.log('✅ Conectado a WebSocket');
          this.subscribeToConversations();
          this.subscribeToConversationUpdates(); // Nueva suscripción
          resolve(true);
        };

        this.client.onStompError = (frame: Frame) => {
          console.error('💥 Error STOMP', frame.headers, frame.body);
          reject(new Error(frame.body));
        };

        this.client.activate();
      } catch (error) {
        console.error('💥 Error de conexión WebSocket:', error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.client) {
      console.log('🔌 Desconectando WebSocket...');
      this.client.deactivate();
      this.client = null;
      this.messageSubscriptions.clear();
      this.conversationSubscription = null;
      this.conversationUpdateSubscription = null;
    }
  }

  private handleDisconnection() {
    this.messageSubscriptions.clear();
    this.conversationSubscription = null;
    this.conversationUpdateSubscription = null;
  }

  // Suscripción al endpoint legacy (mantenido para compatibilidad)
  public subscribeToConversations(): void {
    if (!this.client || !this.client.connected) {
      console.error('❌ No se puede suscribir: WebSocket no conectado');
      return;
    }

    if (this.conversationSubscription) {
      return;
    }

    console.log('📡 Suscribiéndose a actualizaciones de conversaciones (legacy)');
    this.conversationSubscription = this.client.subscribe('/topic/conversations', (message) => {
      try {
        const conversations: ConversationDTO[] = JSON.parse(message.body);
        console.log('📨 Conversaciones recibidas (legacy):', conversations.length);
        this.conversationHandlers.forEach(handler => handler(conversations));
      } catch (error) {
        console.error('💥 Error al analizar actualización de conversación:', error);
      }
    });
  }

  // Nueva suscripción para actualizaciones granulares
  public subscribeToConversationUpdates(): void {
    if (!this.client || !this.client.connected) {
      console.error('❌ No se puede suscribir: WebSocket no conectado');
      return;
    }

    if (this.conversationUpdateSubscription) {
      return;
    }

    console.log('📡 Suscribiéndose a actualizaciones granulares de conversaciones');
    this.conversationUpdateSubscription = this.client.subscribe('/topic/conversation-updates', (message) => {
      try {
        const update: ConversationUpdateDTO = JSON.parse(message.body);
        console.log(`📨 Actualización de conversación recibida:`, update.type, update.conversationId);
        this.conversationUpdateHandlers.forEach(handler => handler(update));
      } catch (error) {
        console.error('💥 Error al analizar actualización granular de conversación:', error);
      }
    });
  }

  public subscribeToChat(conversationId: number): void {
    if (!this.client || !this.client.connected) {
      console.error('❌ No se puede suscribir: WebSocket no conectado');
      return;
    }
  
    if (this.messageSubscriptions.has(conversationId)) {
      console.log(`📱 Ya suscrito al chat: ${conversationId}`);
      return;
    }
  
    console.log(`📱 Suscribiéndose a los mensajes para: ${conversationId}`);
    
    const subscription = this.client.subscribe(`/topic/messages/${conversationId}`, (message) => {
      try {
        const chatMessage: ChatMessageDTO = JSON.parse(message.body);
        console.log(`📨 Mensaje recibido para ${conversationId}:`, chatMessage);
        
        const handlers = this.messageHandlers.get(conversationId) || [];
        console.log(`🔄 Ejecutando ${handlers.length} manejadores para ${conversationId}`);
        
        handlers.forEach(handler => handler(chatMessage));
      } catch (error) {
        console.error(`💥 Error al analizar mensaje para ${conversationId}:`, error);
      }
    });
  
    this.messageSubscriptions.set(conversationId, subscription);
  }

  public unsubscribeFromChat(conversationId: number): void {
    const subscription = this.messageSubscriptions.get(conversationId);
    if (subscription) {
      console.log(`📱 Desuscribiéndose del chat: ${conversationId}`);
      subscription.unsubscribe();
      this.messageSubscriptions.delete(conversationId);
    }
  }

  public sendMessage(message: any): void {
    if (!this.client || !this.client.connected) {
      console.error('❌ No se puede enviar mensaje: WebSocket no conectado');
      return;
    }

    this.client.publish({
      destination: '/app/send-message',
      body: JSON.stringify(message)
    });
  }

  // Manejadores de mensajes
  public onNewMessage(conversationId: number, handler: (message: ChatMessageDTO) => void): void {
    if (!this.messageHandlers.has(conversationId)) {
      this.messageHandlers.set(conversationId, []);
    }
    this.messageHandlers.get(conversationId)!.push(handler);
  }

  public removeMessageHandler(conversationId: number, handler: (message: ChatMessageDTO) => void): void {
    const handlers = this.messageHandlers.get(conversationId);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Manejadores de conversaciones (legacy)
  public onConversationsUpdate(handler: (conversations: ConversationDTO[]) => void): void {
    this.conversationHandlers.push(handler);
  }

  public removeConversationHandler(handler: (conversations: ConversationDTO[]) => void): void {
    const index = this.conversationHandlers.indexOf(handler);
    if (index !== -1) {
      this.conversationHandlers.splice(index, 1);
    }
  }

  // Nuevos manejadores para actualizaciones granulares
  public onConversationUpdate(handler: (update: ConversationUpdateDTO) => void): void {
    this.conversationUpdateHandlers.push(handler);
  }

  public removeConversationUpdateHandler(handler: (update: ConversationUpdateDTO) => void): void {
    const index = this.conversationUpdateHandlers.indexOf(handler);
    if (index !== -1) {
      this.conversationUpdateHandlers.splice(index, 1);
    }
  }

  // Getter para estado de conexión
  public get connected(): boolean {
    return this.client?.connected ?? false;
  }
}