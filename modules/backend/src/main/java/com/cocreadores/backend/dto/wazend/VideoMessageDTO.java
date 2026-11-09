package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoMessageDTO {
    private String url;
    private String mimetype;
    private String fileSha256;
    private String fileLength;
    private int seconds;
    private String mediaKey;
    private int height;
    private int width;
    private String fileEncSha256;
    private String directPath;
    private String mediaKeyTimestamp;
    private String jpegThumbnail;
    private String streamingSidecar;
}
