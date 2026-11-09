package com.cocreadores.backend.dto.chat;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ChatMessageDTO {
    private Long id;
    private Long conversationId;
    private String whatsappMessageId;
    private String phoneNumber;
    private Long userId;
    private String userName;
    private String studentName;
    private String sender; // USER, BOT, ADMIN, STUDENT
    private String content;
    private String messageType; // TEXT, IMAGE, VIDEO, etc.
    private String mediaUrl;
    private Boolean read;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",timezone = "UTC")
    private LocalDateTime sentAt;
    private String groupId;
    private String groupName; // Si lo tienes disponible
    private boolean fromMe;
    private List<ReactionsDTO> reactions; // Lista de reacciones al mensaje
    private String fileType;
    private String fileName;
}
