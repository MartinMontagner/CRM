package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReactionKeyDTO {
    private String remoteJid;
    private boolean fromMe;
    private String id;
}
/*
 * "key": {
          "remoteJid": "5492226457498@s.whatsapp.net",
          "fromMe": false,
          "id": "3EB0FF612D557AE55EC1B1"
        },
 */