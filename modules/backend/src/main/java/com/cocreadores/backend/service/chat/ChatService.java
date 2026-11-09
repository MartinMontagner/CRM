package com.cocreadores.backend.service.chat;

import com.cocreadores.backend.config.WhitelistConfig;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.chat.MessageType;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.repository.WhitelistConfigRepository;
import com.cocreadores.backend.service.whatsapp.WhatsappService;
import com.cocreadores.backend.event.RawMessageEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.io.IOException;

import java.util.*;

@Service
public class ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    private WhatsappService whatsappService;

    @Autowired
    private MessageLoggerService messageLogger;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WhitelistConfigRepository whitelistConfigRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * Procesa el webhook entrante de WhatsApp
     */
    @SuppressWarnings("unchecked")
    public void processWhatsappWebhook(String payload) throws IOException, NotFoundException {
        logger.info("Mensaje entrante RAW: {}", payload);
        Map<String, Object> webhookData = objectMapper.readValue(payload, Map.class);

        if (!"whatsapp_business_account".equals(webhookData.get("object"))) {
            throw new IllegalArgumentException("Invalid WhatsApp webhook payload");
        }

        eventPublisher.publishEvent(new RawMessageEvent(ConversationType.WHATSAPP, payload));

        // Procesar cada entrada (entry) en el webhook
        List<Map<String, Object>> entries = (List<Map<String, Object>>) webhookData.get("entry");
        for (Map<String, Object> entry : entries) {
            System.out.println("Procesando entrada: " + entry);
            processWhatsappEntry(entry);
        }
    }

    @SuppressWarnings("unchecked")
    private void processWhatsappEntry(Map<String, Object> entry) throws IOException, NotFoundException {
        List<Map<String, Object>> changes = (List<Map<String, Object>>) entry.get("changes");
        for (Map<String, Object> change : changes) {
            Map<String, Object> value = (Map<String, Object>) change.get("value");

            // Extraer contactos primero
            List<Map<String, Object>> contacts = (List<Map<String, Object>>) value.get("contacts");
            Map<String, String> contactMap = new HashMap<>();

            if (contacts != null) {
                for (Map<String, Object> contact : contacts) {
                    String waId = (String) contact.get("wa_id");
                    String name = (String) ((Map<String, Object>) contact.get("profile")).get("name");
                    contactMap.put(waId, name);
                }
            }

            // Procesar mensajes
            if (value.containsKey("messages")) {
                List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
                for (Map<String, Object> message : messages) {
                    String from = (String) message.get("from");
                    String contactName = contactMap.get(from);
                    processWhatsappMessage(message, contactName);
                }
            }
        }
    }

    /**
     * Procesa mensajes individuales de WhatsApp
     */
    private void processWhatsappMessage(Map<String, Object> message, String contactName)
            throws IOException, NotFoundException {

        String phoneNumber = (String) message.get("from");
        String messageId = (String) message.get("id");
        String messageType = (String) message.get("type");

        logger.info("Procesando mensaje de {} (Nombre: {})", phoneNumber, contactName);

        // Resto del procesamiento del mensaje...
        if (messageLogger.isMessageProcessed(messageId)) {
            logger.info("Mensaje ya procesado: {}", messageId);
            return;
        }

        switch (messageType) {
            case "text":
                String textBody = (String) ((Map<String, Object>) message.get("text")).get("body");
                messageLogger.logIncomingMessage(messageId, phoneNumber, textBody, MessageType.TEXT, contactName);
                processIncomingMessage(phoneNumber, textBody);
                break;

            case "image":
                messageLogger.logIncomingMessage(messageId, phoneNumber, "Imagen Rechazada", MessageType.DOCUMENT,
                        contactName);
                whatsappService.sendTextMessage(phoneNumber,
                        "Lo siento, no se aceptan imagenes. Por favor, envía tu información de otra manera.", null);
                break;

            case "document":
                messageLogger.logIncomingMessage(messageId, phoneNumber, "Documento Rechazado", MessageType.DOCUMENT,
                        contactName);
                whatsappService.sendTextMessage(phoneNumber,
                        "Lo siento, no se aceptan documentos. Por favor, envía tu información de otra manera.", null);
                break;

            case "audio":
                messageLogger.logIncomingMessage(messageId, phoneNumber, "Audio Rechazado", MessageType.AUDIO,
                        contactName);
                whatsappService.sendTextMessage(phoneNumber,
                        "Lo siento, no se aceptan mensajes de audio. Por favor, envía tu información en formato de texto o imagen según corresponda.",
                        null);
                break;

            case "voice":
                messageLogger.logIncomingMessage(messageId, phoneNumber, "Mensaje de Voz Rechazado", MessageType.AUDIO,
                        contactName);
                whatsappService.sendTextMessage(phoneNumber,
                        "Lo siento, no se aceptan mensajes de voz. Por favor, envía tu información en formato de texto o imagen según corresponda.",
                        null);
                break;

            case "button":
                Map<String, Object> buttonData = (Map<String, Object>) message.get("button");
                String buttonText = (String) buttonData.get("text");
                String buttonPayload = buttonData.containsKey("payload") ? (String) buttonData.get("payload")
                        : buttonText;

                messageLogger.logIncomingMessage(
                        messageId,
                        phoneNumber,
                        "Botón presionado: " + buttonText + (buttonPayload != null ? " (" + buttonPayload + ")" : ""),
                        MessageType.BUTTON_REPLY, contactName);

                processIncomingMessage(phoneNumber, buttonPayload != null ? buttonPayload : buttonText);
                break;

            case "interactive":
                Map<String, Object> interactive = (Map<String, Object>) message.get("interactive");
                String interactiveType = (String) interactive.get("type");

                if ("button_reply".equals(interactiveType)) {
                    Map<String, Object> buttonReply = (Map<String, Object>) interactive.get("button_reply");
                    String buttonId = (String) buttonReply.get("id");
                    String buttonTitle = (String) buttonReply.get("title");

                    // Registrar la interacción con el botón
                    messageLogger.logIncomingMessage(
                            messageId,
                            phoneNumber,
                            "Botón seleccionado: " + buttonTitle,
                            MessageType.BUTTON_REPLY, contactName);

                    processIncomingMessage(phoneNumber, buttonId);
                } else if ("list_reply".equals(interactiveType)) {
                    Map<String, Object> listReply = (Map<String, Object>) interactive.get("list_reply");
                    String listId = (String) listReply.get("id");
                    String listTitle = (String) listReply.get("title");
                    String listDescription = (String) listReply.getOrDefault("description", "");

                    messageLogger.logIncomingMessage(
                            messageId,
                            phoneNumber,
                            "Opción seleccionada: " + listTitle,
                            MessageType.LIST_REPLY, contactName);

                    processIncomingMessage(phoneNumber, listId);
                }
                break;

            default:
                logger.info("Tipo de mensaje no soportado: {}", messageType);
                whatsappService.sendTextMessage(phoneNumber, "Tipo de mensaje no soportado", null);
                break;
        }
    }

    public void processIncomingMessage(String phoneNumber, String message) {
        logger.info("Mensaje entrante incoming message: {}", message);

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