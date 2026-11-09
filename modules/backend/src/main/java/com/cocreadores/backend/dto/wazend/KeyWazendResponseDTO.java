package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KeyWazendResponseDTO {
    private String remoteJid;
    private boolean fromMe;
    private String id;
}
