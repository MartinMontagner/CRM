package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StickerMessageDTO {
    private String url;
    private String fileSha256;
    private String fileEncSha256;
    private String mediaKey;
    private String mimetype;
    private String directPath;
    private Long fileLength;
    private Long mediaKeyTimestamp;
    private Boolean isAnimated;
    private Long stickerSentTs;
    private Boolean isAvatar;
    private Boolean isAiSticker;
    private Boolean isLottie;
    private String accessibilityLabel;
}
