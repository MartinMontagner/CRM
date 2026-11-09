package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AudioMessageDTO {
    private String url;
    private String mimetype;
    private String fileSha256;
    private String fileLength;
    private int seconds;
    private boolean ptt;
    private String mediaKey;
    private String fileEncSha256;
    private String directPath;
    private String mediaKeyTimestamp;
    private String streamingSidecar;
    private String waveform;
}
