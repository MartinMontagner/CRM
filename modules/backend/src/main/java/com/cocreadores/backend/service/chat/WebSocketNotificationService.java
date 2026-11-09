package com.cocreadores.backend.service.chat;

import com.cocreadores.backend.dto.chat.ChatMessageDTO;
import com.cocreadores.backend.dto.chat.ConversationDTO;
import com.cocreadores.backend.dto.chat.ConversationUpdateDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Notifica a los clientes suscritos sobre un nuevo mensaje
     */
    public void notifyNewMessage(Long conversationId, ChatMessageDTO message) {
        log.debug("Notifying new message for conversation: {}", conversationId);
        messagingTemplate.convertAndSend("/topic/messages/" + conversationId, message);
    }

    /**
     * Notifica sobre una conversación específica actualizada (más eficiente)
     */
    public void notifyConversationUpdate(ConversationDTO conversation) {
        log.debug("Notifying conversation update for ID: {}", conversation.getConversationId());
        
        ConversationUpdateDTO update = ConversationUpdateDTO.builder()
                .type("CONVERSATION_UPDATED")
                .conversation(conversation)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversation-updates", update);
    }

    /**
     * Notifica sobre una nueva conversación creada
     */
    public void notifyNewConversation(ConversationDTO conversation) {
        log.debug("Notifying new conversation: {}", conversation.getConversationId());
        
        ConversationUpdateDTO update = ConversationUpdateDTO.builder()
                .type("CONVERSATION_CREATED")
                .conversation(conversation)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversation-updates", update);
    }

    /**
     * Notifica sobre una conversación eliminada
     */
    public void notifyConversationDeleted(Long conversationId) {
        log.debug("Notifying conversation deleted: {}", conversationId);
        
        ConversationUpdateDTO update = ConversationUpdateDTO.builder()
                .type("CONVERSATION_DELETED")
                .conversationId(conversationId)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversation-updates", update);
    }

    /**
     * Notifica cambios en el contador de no leídos
     */
    public void notifyUnreadCountUpdate(Long conversationId, Long unreadCount) {
        log.debug("Notifying unread count update for conversation {}: {}", conversationId, unreadCount);
        
        ConversationUpdateDTO update = ConversationUpdateDTO.builder()
                .type("UNREAD_COUNT_UPDATED")
                .conversationId(conversationId)
                .unreadCount(unreadCount)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversation-updates", update);
    }

    /**
     * Método legacy para compatibilidad (DEPRECATED)
     * @deprecated Use specific notification methods instead
     */
    @Deprecated
    @Async
    public void notifyConversationsUpdate(List<ConversationDTO> conversations) {
        log.warn("Using deprecated notifyConversationsUpdate method. Consider using specific notification methods.");
        
        // Solo notificar si la lista es pequeña para evitar problemas de rendimiento
        if (conversations.size() <= 50) {
            log.info("Sending limited conversation update...");
            messagingTemplate.convertAndSend("/topic/conversations", conversations);
        } else {
            log.warn("Conversation list too large ({}), skipping broadcast to prevent performance issues", 
                    conversations.size());
        }
    }
}