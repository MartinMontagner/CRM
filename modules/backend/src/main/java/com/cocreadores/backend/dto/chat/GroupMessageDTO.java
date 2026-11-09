package com.cocreadores.backend.dto.chat;

import lombok.Builder;
import lombok.Data;
import java.util.List;

import java.time.LocalDateTime;

@Data
@Builder
public class GroupMessageDTO {
    private Long id;
    private String whatsappMessageId;
    private String phoneNumber;
    private Long userId;
    private String userName;
    private String sender; // USER, BOT, ADMIN, STUDENT
    private String content;
    private String messageType; // TEXT, IMAGE, VIDEO, etc.
    private String mediaUrl;
    private Boolean read;
    private LocalDateTime sentAt;
    private String groupName;
    private GroupMemberDTO groupMember; // Información de los miembros del grupo
    private List<ReactionsDTO> reactions; // Lista de reacciones al mensaje
    private String fileType;
    private String fileName;

    @Data
    @Builder
    public static class GroupMemberDTO {
        private Long id;
        private String participant;
        private String fullname;
        private LocalDateTime joinedAt;
    }
}