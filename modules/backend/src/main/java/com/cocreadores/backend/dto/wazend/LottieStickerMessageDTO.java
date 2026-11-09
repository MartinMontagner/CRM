package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LottieStickerMessageDTO {
    private String url;
    private String fileSha256;
    private String fileEncSha256;
    private String mediaKey;
    private String mimetype;
    private int height;
    private int width;
    private String directPath;
    private String fileLength;
    private String mediaKeyTimestamp;
    private boolean isAnimated;
    private String stickerSentTs;
    private boolean isAvatar;
    private boolean isAiSticker;
    private boolean isLottie;
}
