package com.cocreadores.backend.dto.chat;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReactionsDTO {
    private String reaction;
    private Long count;
}
