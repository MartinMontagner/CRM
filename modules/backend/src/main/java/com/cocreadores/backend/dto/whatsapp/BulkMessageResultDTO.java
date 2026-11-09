package com.cocreadores.backend.dto.whatsapp;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class BulkMessageResultDTO {
    private String messageId;
    private String error;

    public BulkMessageResultDTO(String messageId, String error) {
        this.messageId = messageId;
        this.error = error;
    }
}
