// src/context/WebSocketContext.tsx
import { ChatMessageDTO, ConversationDTO } from '@/model/chats/Chat';
import { ConversationUpdateDTO, WebSocketService } from '@/service/websocket/WebSocketService';
import { useAppStore } from '@/state/store';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface WebSocketContextType {
    isConnected: boolean;
    sendMessage: (message: any) => void;
    subscribeToChat: (conversationId: number) => void;
    unsubscribeFromChat: (conversationId: number) => void;
    onNewMessage: (conversationId: number, handler: (message: ChatMessageDTO) => void) => void;
    onConversationsUpdate: (handler: (conversations: ConversationDTO[]) => void) => void;
    onConversationUpdate: (handler: (update: ConversationUpdateDTO) => void) => void; // Nuevo
    removeMessageHandler: (conversationId: number, handler: (message: ChatMessageDTO) => void) => void;
    removeConversationHandler: (handler: (conversations: ConversationDTO[]) => void) => void;
    removeConversationUpdateHandler: (handler: (update: ConversationUpdateDTO) => void) => void; // Nuevo
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [webSocketService, setWebSocketService] = useState<WebSocketService | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const authToken = useAppStore((state) => state.authData?.accessToken);
    const previousTokenRef = useRef<string | null>(null);
    const reconnectAttempts = useRef<number>(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const attemptConnection = async (service: WebSocketService): Promise<void> => {
        try {
            console.log(`🔄 Intento de conexión WebSocket ${reconnectAttempts.current + 1}/${maxReconnectAttempts}`);
            await service.connect();
            setIsConnected(true);
            reconnectAttempts.current = 0;
            console.log('✅ WebSocket conectado exitosamente');
        } catch (error) {
            console.error('💥 Error de conexión WebSocket:', error);
            setIsConnected(false);
            
            if (reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current++;
                console.log(`⏳ Reintentando conexión en ${reconnectDelay}ms...`);
                setTimeout(() => {
                    if (service) {
                        attemptConnection(service);
                    }
                }, reconnectDelay);
            } else {
                console.error('❌ Máximo número de intentos de reconexión alcanzado');
            }
        }
    };

    useEffect(() => {
        const token = authToken ?? null;

        if (token === previousTokenRef.current) {
            return;
        }

        previousTokenRef.current = token;

        // Desconectar servicio anterior
        if (webSocketService) {
            console.log('🔌 Desconectando WebSocket anterior...');
            webSocketService.disconnect();
            setWebSocketService(null);
            setIsConnected(false);
        }

        if (!authToken) {
            console.log('❌ No hay token de autenticación, no se conectará WebSocket');
            return;
        }

        console.log('🚀 Inicializando nuevo servicio WebSocket');
        const service = new WebSocketService(authToken);
        setWebSocketService(service);
        reconnectAttempts.current = 0;

        attemptConnection(service);

        return () => {
            console.log('🔌 Limpiando servicio WebSocket');
            service.disconnect();
        };
    }, [authToken]);

    // Monitorear estado de conexión
    useEffect(() => {
        if (!webSocketService) return;

        const checkConnection = setInterval(() => {
            const currentlyConnected = webSocketService.connected;
            if (currentlyConnected !== isConnected) {
                console.log(`🔄 Estado de conexión cambió: ${currentlyConnected}`);
                setIsConnected(currentlyConnected);
                
                // Si se desconectó, intentar reconectar
                if (!currentlyConnected && reconnectAttempts.current < maxReconnectAttempts) {
                    attemptConnection(webSocketService);
                }
            }
        }, 5000);

        return () => clearInterval(checkConnection);
    }, [webSocketService, isConnected]);

    const value: WebSocketContextType = {
        isConnected,
        sendMessage: (message) => {
            if (!webSocketService) {
                console.warn('⚠️ No se puede enviar mensaje: servicio WebSocket no inicializado');
                return;
            }
            if (!isConnected) {
                console.warn('⚠️ No se puede enviar mensaje: WebSocket no conectado');
                return;
            }
            webSocketService.sendMessage(message);
        },
        subscribeToChat: (conversationId) => {
            if (!webSocketService) {
                console.warn('⚠️ No se puede suscribir al chat: servicio no inicializado');
                return;
            }
            webSocketService.subscribeToChat(conversationId);
        },
        unsubscribeFromChat: (conversationId) => {
            if (!webSocketService) return;
            webSocketService.unsubscribeFromChat(conversationId);
        },
        onNewMessage: (conversationId, handler) => {
            if (!webSocketService) return;
            webSocketService.onNewMessage(conversationId, handler);
        },
        onConversationsUpdate: (handler) => {
            if (!webSocketService) return;
            webSocketService.onConversationsUpdate(handler);
        },
        onConversationUpdate: (handler) => {
            if (!webSocketService) return;
            webSocketService.onConversationUpdate(handler);
        },
        removeMessageHandler: (conversationId, handler) => {
            if (!webSocketService) return;
            webSocketService.removeMessageHandler(conversationId, handler);
        },
        removeConversationHandler: (handler) => {
            if (!webSocketService) return;
            webSocketService.removeConversationHandler(handler);
        },
        removeConversationUpdateHandler: (handler) => {
            if (!webSocketService) return;
            webSocketService.removeConversationUpdateHandler(handler);
        },
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};