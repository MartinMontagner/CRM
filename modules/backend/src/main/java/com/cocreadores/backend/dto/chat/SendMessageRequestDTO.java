package com.cocreadores.backend.dto.chat;

import lombok.Data;

import java.util.List;

@Data
public class SendMessageRequestDTO {
    private String phoneNumber;
    private String content;
    private String mediaUrl;
    private String sender; // USER, BOT, etc.
    private String messageType; // TEXT, TEMPLATE
    private List<String> templateParams;
}
