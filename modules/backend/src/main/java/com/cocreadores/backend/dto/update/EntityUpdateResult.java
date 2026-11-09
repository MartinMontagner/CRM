package com.cocreadores.backend.dto.update;


import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntityUpdateResult {
    private int updatedCount;
    private int createdCount;

    public int getTotalProcessed() {
        return updatedCount + createdCount;
    }
}
