package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendKeyDTO {
    private String remoteJid;
    private Boolean fromMe;
    private String id;
    private String participant;
}