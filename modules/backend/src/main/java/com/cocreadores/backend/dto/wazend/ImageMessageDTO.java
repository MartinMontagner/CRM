package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageMessageDTO {
    private String url;
    private String mimetype;
    private String fileSha256;
    private String fileLength;
    private int height;
    private int width;
    private String mediaKey;
    private String fileEncSha256;
    private String directPath;
    private String mediaKeyTimestamp;
    private String jpegThumbnail;
    private String firstScanSidecar;
    private int firstScanLength;
    private String scansSidecar;
    private int[] scanLengths;
    private String midQualityFileSha256;
    private String imageSourceType;
}