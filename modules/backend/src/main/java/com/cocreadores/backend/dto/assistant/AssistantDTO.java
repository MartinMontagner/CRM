package com.cocreadores.backend.dto.assistant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssistantDTO {
    private Long id;
    private String label;
    private String value;
}
