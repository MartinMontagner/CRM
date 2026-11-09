package com.cocreadores.backend.service.chat;

import com.cocreadores.backend.config.WhitelistConfig;
import com.cocreadores.backend.dto.wazend.*;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.chat.MessageType;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.repository.WhitelistConfigRepository;
import com.cocreadores.backend.utils.Utils;
import com.cocreadores.backend.event.RawMessageEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class WazendChatService {
    private static final Logger logger = LoggerFactory.getLogger(WazendChatService.class);

    @Autowired
    private MessageLoggerService messageLogger;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WhitelistConfigRepository whitelistConfigRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * Procesa el webhook entrante de Wazend
     */
    public void processWazendWebhook(String payload) throws IOException, NotFoundException {

        eventPublisher.publishEvent(new RawMessageEvent(ConversationType.WAZEND, payload));

        JsonNode rootNode = objectMapper.readTree(payload);
        String eventType = rootNode.path("event").asText();

        if (!"messages.upsert".equals(eventType)) {
            throw new IllegalArgumentException("Invalid Wazend webhook event");
        }

        WazendWebhookDTO webhookData = objectMapper.readValue(payload, WazendWebhookDTO.class);
        // Verificar que sea un evento de mensaje recibido

        processWazendEntry(webhookData);
    }

    /**
     * Procesa la entrada principal de Wazend
     */
    private void processWazendEntry(WazendWebhookDTO wazendData) throws IOException, NotFoundException {
        WazendDataDTO data = wazendData.getData();
        WazendKeyDTO key = data.getKey();
        String remoteJid = key.getRemoteJid();
        boolean isGroup = remoteJid.endsWith("@g.us");

        String phoneNumber = isGroup ? null : remoteJid.split("@")[0];
        String groupId = isGroup ? remoteJid.split("@")[0] : null;
        String contactName = data.getPushName();
        String messageId = key.getId();
        String messageType = data.getMessageType();

        logger.info("Procesando mensaje Wazend de {} (Nombre: {})", isGroup ? groupId : phoneNumber, contactName);

        // Procesar mensaje grupal
        if (isGroup) {
            if (messageType.equals("reactionMessage")) {
                messageLogger.logReaction(data);
                logger.info("Mensaje de reacción recibido en grupo: {}",
                        data.getMessage().getReactionMessage().getText());
                return;
            } else {
                messageLogger.logIncomingGroupMessage(wazendData);
            }

        } else {

            // Verificar si el mensaje ya fue procesado
            if (messageLogger.isMessageProcessed(messageId)) {
                logger.info("Mensaje Wazend ya procesado: {}", messageId);
                return;
            }

            switch (messageType) {
                case "conversation":
                    // Mensaje de texto normal
                    if (data.getMessage() != null && data.getMessage().getConversation() != null) {
                        String textBody = data.getMessage().getConversation();
                        messageLogger.logIncomingMessageWazend(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, textBody,
                                MessageType.TEXT, wazendData, key);
                        processIncomingMessage(Utils.normalizePhoneNumber(phoneNumber), textBody);
                    }
                    break;

                case "imageMessage":
                    // Mensaje de imagen
                    if (data.getMessage() != null && data.getMessage().getImageMessage() != null) {
                        String mediaUrl = data.getMessage().getMediaUrl() != null ? data.getMessage().getMediaUrl()
                                : data.getMessage().getImageMessage().getUrl();
                        String mimeType = data.getMessage().getImageMessage().getMimetype();
                        String fileType = data.getMessage().getImageMessage().getMimetype().split("/")[1];
                        messageLogger.logIncomingMessageWazendMedia(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, mediaUrl,
                                MessageType.IMAGE, wazendData, key, fileType);
                        logger.info("Mensaje de imagen recibido: URL={}, MIME Type={}", mediaUrl, mimeType);
                    }
                    break;
                case "stickerMessage":
                    if (data.getMessage() != null && data.getMessage().getStickerMessage() != null) {
                        String mediaUrl = data.getMessage().getMediaUrl() != null ? data.getMessage().getMediaUrl()
                                : data.getMessage().getStickerMessage().getUrl();

                        String mimeType = data.getMessage().getStickerMessage().getMimetype();
                        String fileType = data.getMessage().getStickerMessage().getMimetype().split("/")[1];

                        messageLogger.logIncomingMessageWazendMedia(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, mediaUrl,
                                MessageType.STICKER, wazendData, key, fileType);
                        logger.info("Mensaje de sticker recibido: URL={}, MIME Type={}", mediaUrl, mimeType);
                    }
                    break;
                case "lottieStickerMessage":
                    if (data.getMessage() != null && data.getMessage().getLottieStickerMessage() != null) {
                        String mediaUrl = data.getMessage().getMediaUrl() != null ? data.getMessage().getMediaUrl()
                                : data.getMessage().getLottieStickerMessage().getUrl();

                        String mimeType = data.getMessage().getLottieStickerMessage().getMimetype();
                        String fileType = data.getMessage().getLottieStickerMessage().getMimetype().split("/")[1];

                        messageLogger.logIncomingMessageWazendMedia(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, mediaUrl,
                                MessageType.STICKER, wazendData, key, fileType);
                        logger.info("Mensaje de lottieSicker recibido: URL={}, MIME Type={}", mediaUrl, mimeType);
                    }
                    break;
                case "videoMessage":
                    if (data.getMessage() != null && data.getMessage().getVideoMessage() != null) {
                        String mediaUrl = data.getMessage().getMediaUrl() != null ? data.getMessage().getMediaUrl()
                                : data.getMessage().getVideoMessage().getUrl();
                        String fileType = data.getMessage().getVideoMessage().getMimetype().split("/")[1];
                        messageLogger.logIncomingMessageWazendMedia(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, mediaUrl,
                                MessageType.VIDEO, wazendData, key, fileType);
                        logger.info("Mensaje de video recibido: URL={}, MIME Type={}", mediaUrl, fileType);
                    }
                    break;
                case "audioMessage":
                    if (data.getMessage() != null && data.getMessage().getAudioMessage() != null) {
                        String mediaUrl = data.getMessage().getMediaUrl() != null ? data.getMessage().getMediaUrl()
                                : data.getMessage().getAudioMessage().getUrl();
                        String fileType = data.getMessage().getAudioMessage().getMimetype().split("/")[1];
                        messageLogger.logIncomingMessageWazendMedia(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, mediaUrl,
                                MessageType.AUDIO, wazendData, key, fileType);
                        logger.info("Mensaje de audio recibido: URL={}, MIME Type={}", mediaUrl, fileType);
                    }
                    break;
                case "documentMessage":
                    System.out.println("Procesando mensaje de documento Wazend");
                    if (data.getMessage() != null && data.getMessage().getDocumentMessage() != null) {
                        String mediaUrl = data.getMessage().getMediaUrl() != null ? data.getMessage().getMediaUrl()
                                : data.getMessage().getMediaUrl();
                        String fileType = data.getMessage().getDocumentMessage().getMimetype().split("/")[1];
                        messageLogger.logIncomingMessageWazendMedia(messageId, Utils.normalizePhoneNumber(phoneNumber),
                                contactName, mediaUrl,
                                MessageType.DOCUMENT, wazendData, key, fileType);
                        logger.info("Mensaje de documento recibido: URL={}, MIME Type={}", mediaUrl, fileType);
                    }
                    break;
                case "reactionMessage":
                    messageLogger.logReaction(data);
                    logger.info("Mensaje de reacción recibido: {}", data.getMessage().getReactionMessage().getText());
                    break;

                default:
                    logger.info("Tipo de mensaje no soportado: {}", messageType);
                    break;
            }
        }
    }

    public void processIncomingMessage(String phoneNumber, String message) {
        logger.info("Mensaje entrante de Wazend: {}", message);

        WhitelistConfig whitelistConfig = whitelistConfigRepository.findById("default")
                .orElseGet(() -> {
                    WhitelistConfig newConfig = new WhitelistConfig();
                    newConfig.setId("default");
                    newConfig.setEnabled(true);
                    return whitelistConfigRepository.save(newConfig);
                });

        logger.info("Whitelist Configuration - Enabled: {}", whitelistConfig.isEnabled());
    }

}