package com.cocreadores.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUpdateDTO {
    private String type; // CONVERSATION_UPDATED, CONVERSATION_CREATED, CONVERSATION_DELETED, UNREAD_COUNT_UPDATED
    private Long conversationId;
    private ConversationDTO conversation;
    private Long unreadCount;
    private LocalDateTime timestamp;
}
    