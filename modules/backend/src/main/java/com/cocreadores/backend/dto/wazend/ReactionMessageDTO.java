package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReactionMessageDTO {
    private ReactionKeyDTO key;
    private boolean fromMe;
    private String text;
    private long senderTimestampMs;
   }
