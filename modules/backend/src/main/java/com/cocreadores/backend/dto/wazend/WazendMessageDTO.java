package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendMessageDTO {
    private WazendMessageContextInfoDTO messageContextInfo;
    private String conversation;
    private ImageMessageDTO imageMessage; // Nuevo campo para mensajes de imagen
    private String mediaUrl; // Campo adicional para la URL del medio
    private DocumentMessageDTO documentMessage; // Nuevo campo para mensajes de documento
    private AudioMessageDTO audioMessage; // Nuevo campo para mensajes de audio
    private VideoMessageDTO videoMessage; // Nuevo campo para mensajes de video
    private StickerMessageDTO stickerMessage; // Nuevo campo para mensajes de sticker
    private ReactionMessageDTO reactionMessage; // Nuevo campo para mensajes de reacción
    private LottieStickerMessageDTO lottieStickerMessage; // Nuevo campo para mensajes de Lottie Sticker
}

