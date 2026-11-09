package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentMessageDTO {
    private String url;
    private String mimetype;
    private String title;
    private String fileSha256;
    private long fileLength;
    private int pageCount;
    private String mediaKey;
    private String fileName;
    private String fileEncSha256;
    private String directPath;
    private long mediaKeyTimestamp;
    private boolean contactVcard;
    private String jpegThumbnail;
}