package com.cocreadores.backend.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SendBulkMessagesRequestDTO {
    private List<String> phoneNumbers;
    private String content;
    private String sender;
    private String messageType;
}
