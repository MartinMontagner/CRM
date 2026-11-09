package com.cocreadores.backend.dto.update;

import lombok.Data;

@Data
public class SubscriptionUpdateResponseDto {
    private boolean success;
    private String message;
    private int updatedCount;
    private int createdCount;
    private int totalReceived;

    public int getTotalProcessed() {
        return updatedCount + createdCount;
    }
}
