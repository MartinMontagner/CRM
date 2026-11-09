package com.cocreadores.backend.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

import com.cocreadores.backend.model.student.StudentType;

@Data
@Builder
public class ConversationDTO {
    private Long conversationId;
    private String phoneNumber;
    private String studentName;
    private String studentTag;
    private String interestTag;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private boolean hasUnread;
    private Long unreadCount;
    private String analisis;
    private String conversationType;
    private WazendDTO wazend; 
    private boolean isGroup; 
    private WazendGroupDTO wazendGroup;
    private Set<CustomTagDTO> customTags;

    @Data
    @Builder
    public static class CustomTagDTO {
        private Long id;
        private String name;
        private String color;
        private boolean enabled;
        private StudentType studentTag;
        private boolean important;
        private boolean dark;
    }

    @Data
    @Builder
    public static class WazendDTO {
        private Long id;
        private String name;
        private String instanceIdServer;
        private Boolean isActive;
    }

    @Data
    @Builder
    public static class WazendGroupDTO {
        private String groupId;
        private String groupName;
        private String instanceIdServer;
        private Long id;
    }
}