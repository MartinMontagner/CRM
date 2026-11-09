package com.cocreadores.backend.service.wazend;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cocreadores.backend.model.chat.ChatMessage;
import com.cocreadores.backend.model.chat.ChatMessageRawData;
import com.cocreadores.backend.model.chat.GroupMember;
import com.cocreadores.backend.model.chat.MessageSender;
import com.cocreadores.backend.model.chat.MessageType;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.wazend.WazendInstance;
import com.cocreadores.backend.repository.ChatMessageRepository;
import com.cocreadores.backend.repository.GroupMemberRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;
import com.cocreadores.backend.repository.WazendInstanceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WazendImportService {
    private final ChatMessageRepository chatMessageRepository;
    private final JsonRepairService jsonRepairService;
    private final GroupMemberRepository groupMemberRepository;
    private final StudentConversationRepository conversationRepository;
    private final WazendInstanceRepository wazendInstanceRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{8,15}$");

    public void importChatMessages(MultipartFile csvFile, String instanceId) {
        ImportResult result = new ImportResult();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream()))) {

            CSVFormat format = CSVFormat.DEFAULT
                    .withDelimiter(',')
                    .withFirstRecordAsHeader()
                    .withIgnoreEmptyLines(true)
                    .withTrim()
                    .withQuote('"')
                    .withEscape('"');

            CSVParser parser = format.parse(reader);

            Map<String, StudentConversationEntity> conversationCache = new HashMap<>();
            Map<String, GroupMember> groupMemberCache = new HashMap<>();
            WazendInstance wazendInstance = null;

            if (instanceId != null) {
                wazendInstance = wazendInstanceRepository.findByInstance(instanceId).orElse(null);
            }

            List<ChatMessage> batch = new ArrayList<>();
            int batchSize = 100;

            for (CSVRecord record : parser) {
                try {
                    if (record.size() < 10) {
                        result.errorCount++;
                        result.errors.add("Línea " + record.getRecordNumber() + ": Insuficientes campos (" + record.size() + ")");
                        continue;
                    }

                    ChatMessage message = parseCsvRecord(record, wazendInstance, conversationCache, groupMemberCache);

                    if (!chatMessageRepository.existsByWhatsappMessageId(message.getWhatsappMessageId())) {
                        batch.add(message);

                        if (batch.size() >= batchSize) {
                            processBatch(batch, result);
                            batch.clear();
                        }
                    } else {
                        result.duplicateCount++;
                        log.debug("Mensaje duplicado omitido: {}", message.getWhatsappMessageId());
                    }
                } catch (Exception e) {
                    result.errorCount++;
                    result.errors.add("Línea " + record.getRecordNumber() + ": " + e.getMessage());
                    log.error("Error procesando línea {}: {}", record.getRecordNumber(), e.getMessage(), e);

                    conversationCache.clear();
                    groupMemberCache.clear();
                }
            }

            if (!batch.isEmpty()) {
                processBatch(batch, result);
            }

            result.totalProcessed = (int) parser.getRecordNumber();

        } catch (Exception e) {
            log.error("Error general importando CSV: ", e);
            result.errors.add("Error general: " + e.getMessage());
        }
        log.info("Resultado Import: {}", result);
    }

    @Transactional
    private void processBatch(List<ChatMessage> messages, ImportResult result) {
        try {
            chatMessageRepository.saveAll(messages);
            result.successCount += messages.size();
            log.info("Lote procesado exitosamente: {} mensajes", messages.size());
        } catch (Exception e) {
            log.error("Error procesando lote: {}", e.getMessage(), e);
            result.errorCount += messages.size();
            result.errors.add("Error procesando lote: " + e.getMessage());
        }
    }

    private ChatMessage parseCsvRecord(CSVRecord record, WazendInstance wazendInstance,
                                       Map<String, StudentConversationEntity> conversationCache,
                                       Map<String, GroupMember> groupMemberCache) throws Exception {

        try {
            String keyField = getFieldSafely(record, "key");
            String messageField = getFieldSafely(record, "message");
            String timestampField = getFieldSafely(record, "messageTimestamp");
            String pushName = getFieldSafely(record, "pushName");

            if (keyField == null || timestampField == null) {
                throw new Exception("Campos obligatorios faltantes");
            }

            if (keyField.trim().isEmpty() || timestampField.trim().isEmpty()) {
                throw new Exception("Campos obligatorios vacíos");
            }

            JsonNode keyJson = jsonRepairService.parseJsonWithRepair(keyField, "key", record.getRecordNumber());
            JsonNode messageJson = jsonRepairService.parseJsonWithRepair(messageField, "message", record.getRecordNumber());

            String whatsappMessageId = getJsonTextSafely(keyJson, "id", "");
            boolean fromMe = keyJson.has("fromMe") && keyJson.get("fromMe").asBoolean(false);
            String remoteJid = getJsonTextSafely(keyJson, "remoteJid", "");

            if (whatsappMessageId.isEmpty() || remoteJid.isEmpty()) {
                throw new Exception("ID de mensaje o JID remoto vacío");
            }

            boolean isGroupMessage = remoteJid.contains("@g.us");
            String participantPhone = null;

            if (isGroupMessage) {
                if (keyJson.has("participant")) {
                    participantPhone = getJsonTextSafely(keyJson, "participant", "").replace("@s.whatsapp.net", "");
                }

                // Si no hay participant o está vacío, usar pushName
                if (participantPhone == null || participantPhone.isEmpty()) {
                    participantPhone = extractParticipantFromPushName(pushName, remoteJid);
                    log.debug("Usando pushName como participant: {} -> {}", pushName, participantPhone);
                }
            }

            String messageContent = "";
            MessageType messageType = MessageType.TEXT;
            String mediaUrl = null;

            // Variables para manejar referencias
            String referencedWhatsappMessageId = null;
            ChatMessage referencedMessage = null;

            try {
                if (messageJson.has("conversation")) {
                    messageContent = getJsonTextSafely(messageJson, "conversation", "");
                } else if (messageJson.has("reactionMessage")) {
                    // PROCESAMIENTO DE REACCIONES
                    JsonNode reactionMsg = messageJson.get("reactionMessage");
                    messageContent = getJsonTextSafely(reactionMsg, "text", "👍");
                    messageType = MessageType.REACTION;

                    // Extraer la referencia al mensaje original
                    if (reactionMsg.has("key")) {
                        JsonNode reactionKey = reactionMsg.get("key");
                        referencedWhatsappMessageId = getJsonTextSafely(reactionKey, "id", null);

                        // Buscar el mensaje referenciado
                        if (referencedWhatsappMessageId != null && !referencedWhatsappMessageId.isEmpty()) {
                            referencedMessage = findReferencedMessage(referencedWhatsappMessageId, remoteJid, wazendInstance);
                            if (referencedMessage != null) {
                                log.debug("Reacción {} vinculada al mensaje {}", messageContent, referencedMessage.getId());
                            } else {
                                log.warn("No se encontró el mensaje referenciado: {}", referencedWhatsappMessageId);
                            }
                        }
                    }
                } else if (messageJson.has("documentMessage")) {
                    JsonNode docMsg = messageJson.get("documentMessage");
                    messageContent = getJsonTextSafely(docMsg, "caption",
                            getJsonTextSafely(docMsg, "fileName", "Documento"));
                    messageType = MessageType.DOCUMENT;
                    mediaUrl = getJsonTextSafely(docMsg, "url", null);
                } else if (messageJson.has("imageMessage")) {
                    JsonNode imgMsg = messageJson.get("imageMessage");
                    messageContent = getJsonTextSafely(imgMsg, "caption", "Imagen");
                    messageType = MessageType.IMAGE;
                    mediaUrl = getJsonTextSafely(imgMsg, "url", null);
                } else if (messageJson.has("audioMessage")) {
                    JsonNode audioMsg = messageJson.get("audioMessage");
                    messageContent = "Audio";
                    messageType = MessageType.AUDIO;
                    mediaUrl = getJsonTextSafely(audioMsg, "url", null);
                } else if (messageJson.has("videoMessage")) {
                    JsonNode videoMsg = messageJson.get("videoMessage");
                    messageContent = getJsonTextSafely(videoMsg, "caption", "Video");
                    messageType = MessageType.VIDEO;
                    mediaUrl = getJsonTextSafely(videoMsg, "url", null);
                } else if (messageJson.has("stickerMessage")) {
                    messageContent = "Sticker";
                    messageType = MessageType.IMAGE;
                    JsonNode stickerMsg = messageJson.get("stickerMessage");
                    mediaUrl = getJsonTextSafely(stickerMsg, "url", null);
                } else if (messageJson.has("locationMessage")) {
                    JsonNode locationMsg = messageJson.get("locationMessage");
                    double lat = getJsonDoubleSafely(locationMsg, "degreesLatitude");
                    double lng = getJsonDoubleSafely(locationMsg, "degreesLongitude");
                    messageContent = String.format("Ubicación: %.6f, %.6f", lat, lng);
                } else if (messageJson.has("contactMessage")) {
                    JsonNode contactMsg = messageJson.get("contactMessage");
                    String contactName = getJsonTextSafely(contactMsg, "displayName", "Contacto");
                    messageContent = "Contacto: " + contactName;
                } else {
                    // Mensaje de tipo desconocido
                    messageContent = "Mensaje de tipo: " + getFirstJsonKey(messageJson);
                }
            } catch (Exception e) {
                log.warn("Error parseando contenido del mensaje, usando valores por defecto: {}", e.getMessage());
                messageContent = "Mensaje no procesable";
                messageType = MessageType.TEXT;
            }

            // Parsear timestamp
            long timestamp = Long.parseLong(timestampField);
            LocalDateTime sentAt = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(timestamp),
                    ZoneId.systemDefault()
            );

            String contactPhone;
            if (isGroupMessage) {
                contactPhone = remoteJid;
            } else {
                contactPhone = remoteJid.replace("@s.whatsapp.net", "");
            }

            StudentConversationEntity conversation;
            try {
                String nameToUse = fromMe ? null : pushName;
                conversation = getOrCreateConversation(contactPhone, nameToUse, isGroupMessage, wazendInstance, conversationCache, sentAt);
            } catch (Exception e) {
                log.error("Error creando conversación para {}: {}", contactPhone, e.getMessage());
                throw new Exception("Error creando conversación: " + e.getMessage());
            }

            GroupMember groupMember = null;
            if (isGroupMessage && participantPhone != null) {
                String memberKey = conversation.getId() + "_" + participantPhone;
                String finalParticipantPhone = participantPhone;
                groupMember = groupMemberCache.computeIfAbsent(memberKey, k ->
                        getOrCreateGroupMember(conversation, finalParticipantPhone, pushName, remoteJid)
                );
            }

            // DETERMINAR EL PHONENUMBER FINAL PARA EL CHATMESSAGE
            String finalPhoneNumber;
            if (isGroupMessage) {
                if (isPhoneNumber(participantPhone)) {
                    finalPhoneNumber = participantPhone;
                } else {
                    // Si el participant no es un número de teléfono (es un nombre), usar el JID del grupo sin @g.us
                    finalPhoneNumber = remoteJid.replace("@g.us", "");
                }
            } else {
                finalPhoneNumber = contactPhone;
            }

            // Crear el mensaje
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setWhatsappMessageId(truncateString(whatsappMessageId, 500));
            chatMessage.setPhoneNumber(finalPhoneNumber);
            chatMessage.setSender(fromMe ? MessageSender.USER : MessageSender.STUDENT);
            chatMessage.setConversationType(isGroupMessage ? ConversationType.WAZEND_GROUP : ConversationType.WAZEND);
            chatMessage.setContent(messageContent);
            chatMessage.setMessageType(messageType);
            chatMessage.setMediaUrl(mediaUrl);
            chatMessage.setRead(record.size() > 17 && "READ".equals(getFieldSafely(record, "status")));
            chatMessage.setFromMe(fromMe);
            chatMessage.setImported(true);
            chatMessage.setSentAt(sentAt);
            chatMessage.setGroupMember(groupMember);
            chatMessage.setWazendInstance(wazendInstance);
            chatMessage.setInstanceIdServer(truncateString(getFieldSafely(record, "instanceId"), 500));
            chatMessage.setConversation(conversation);

            // ESTABLECER REFERENCIA AL MENSAJE ORIGINAL (para reacciones)
            chatMessage.setReferencedMessage(referencedMessage);
            chatMessage.setReferencedWhatsappMessageId(referencedWhatsappMessageId);

            ChatMessageRawData rawDataEntity = new ChatMessageRawData();
            rawDataEntity.setRawData(record.toString());

            chatMessage.setRawDataEntity(rawDataEntity);
            rawDataEntity.setChatMessage(chatMessage);

            try {
                if (messageJson.has("messageContextInfo")) {
                    JsonNode contextInfo = messageJson.get("messageContextInfo");
                    if (contextInfo != null && contextInfo.has("messageSecret")) {
                        String messageSecret = getJsonTextSafely(contextInfo, "messageSecret", null);
                        if (messageSecret != null) {
                            chatMessage.setMessageSecret(truncateString(messageSecret, 1000));
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Error extrayendo messageSecret: {}", e.getMessage());
            }

            return chatMessage;

        } catch (Exception e) {
            log.error("Error parseando record CSV línea {}: {}", record.getRecordNumber(), e.getMessage());
            throw new Exception("Error parseando mensaje: " + e.getMessage());
        }
    }

    /**
     * Extrae el participant del pushName cuando no está disponible en el JSON key
     */
    private String extractParticipantFromPushName(String pushName, String groupJid) {
        if (pushName == null || pushName.trim().isEmpty()) {
            // Si no hay pushName, usar el JID del grupo sin @g.us como fallback
            return groupJid.replace("@g.us", "");
        }

        String cleanPushName = pushName.trim();

        // Si el pushName es un número de teléfono, usarlo directamente
        if (isPhoneNumber(cleanPushName)) {
            return cleanPushName;
        }

        // Si el pushName es un nombre, usar el JID del grupo sin @g.us
        return groupJid.replace("@g.us", "");
    }

    /**
     * Determina si un string es un número de teléfono
     */
    private boolean isPhoneNumber(String value) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(value.trim()).matches();
    }

    private ChatMessage findReferencedMessage(String referencedWhatsappMessageId, String remoteJid, WazendInstance wazendInstance) {
        try {
            // Buscar por ID de WhatsApp y instancia (más específico)
            if (wazendInstance != null) {
                Optional<ChatMessage> messageByInstance = chatMessageRepository
                        .findByWhatsappMessageIdAndInstanceId(referencedWhatsappMessageId, wazendInstance.getId());
                if (messageByInstance.isPresent()) {
                    return messageByInstance.get();
                }
            }

            // Buscar por ID de WhatsApp solamente (fallback)
            Optional<ChatMessage> messageById = chatMessageRepository
                    .findByWhatsappMessageId(referencedWhatsappMessageId);

            return messageById.orElse(null);

        } catch (Exception e) {
            log.error("Error buscando mensaje referenciado {}: {}", referencedWhatsappMessageId, e.getMessage());
            return null;
        }
    }

    private String getJsonTextSafely(JsonNode node, String fieldName, String defaultValue) {
        if (node == null) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        return field.asText(defaultValue);
    }

    private double getJsonDoubleSafely(JsonNode node, String fieldName) {
        if (node == null) return 0.0;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return 0.0;
        return field.asDouble(0.0);
    }

    private String getFirstJsonKey(JsonNode node) {
        if (node == null || !node.isObject()) return "desconocido";
        return node.fieldNames().hasNext() ? node.fieldNames().next() : "desconocido";
    }

    private String truncateString(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, maxLength);
    }

    private String getFieldSafely(CSVRecord record, String fieldName) {
        try {
            return record.get(fieldName);
        } catch (Exception e) {
            log.debug("Campo '{}' no encontrado en record", fieldName);
            return null;
        }
    }

    @Transactional(readOnly = true)
    private StudentConversationEntity getOrCreateConversation(String contactPhone, String pushName, boolean isGroup,
                                                              WazendInstance wazendInstance,
                                                              Map<String, StudentConversationEntity> cache,
                                                              LocalDateTime messageTimestamp) {

        String cacheKey = contactPhone + "_" + (wazendInstance != null ? wazendInstance.getId() : "null");

        return cache.computeIfAbsent(cacheKey, k -> {
            try {
                Optional<StudentConversationEntity> existing;

                if (wazendInstance != null) {
                    existing = conversationRepository.findByPhoneAndWazendInstance(contactPhone, wazendInstance);
                } else {
                    existing = conversationRepository.findByPhone(contactPhone);
                }

                return existing.orElseGet(() -> createNewConversation(contactPhone, pushName, isGroup, wazendInstance, messageTimestamp));

            } catch (Exception e) {
                log.error("Error en getOrCreateConversation para {}: {}", contactPhone, e.getMessage());
                throw new RuntimeException("Error creando conversación", e);
            }
        });
    }


    @Transactional
    private StudentConversationEntity createNewConversation(String contactPhone, String pushName, boolean isGroup,
                                                            WazendInstance wazendInstance, LocalDateTime messageTimestamp) {
        StudentConversationEntity conversation = new StudentConversationEntity();
        conversation.setPhone(contactPhone);

        String displayName;
        if (pushName != null && !pushName.trim().isEmpty()) {
            displayName = isGroup ? "Grupo " + pushName : pushName;
        } else {
            displayName = isGroup ? "Grupo " + contactPhone : contactPhone;
        }

        conversation.setFullName(displayName);
        conversation.setConversationType(isGroup ? ConversationType.WAZEND_GROUP : ConversationType.WAZEND);
        conversation.setWazendInstance(wazendInstance);
        conversation.setInstanceIdServer(wazendInstance != null ? wazendInstance.getInstance() : null);
        conversation.setUnreadCount(0L);
        conversation.setAnswered(false);

        conversation.setCreatedAt(messageTimestamp);
        conversation.setUpdatedAt(messageTimestamp);

        return conversationRepository.save(conversation);
    }

    @Transactional
    private GroupMember getOrCreateGroupMember(StudentConversationEntity conversation, String participantPhone,
                                               String pushName, String groupJid) {
        return groupMemberRepository.findByConversationAndParticipant(conversation, participantPhone)
                .orElseGet(() -> {
                    GroupMember member = new GroupMember();
                    member.setConversation(conversation);
                    member.setParticipant(participantPhone);

                    String memberName;
                    if (pushName != null && !pushName.trim().isEmpty() && !isPhoneNumber(pushName)) {
                        // Si pushName es un nombre (no un número), usarlo
                        memberName = pushName.trim();
                    } else if (isPhoneNumber(participantPhone)) {
                        // Si participantPhone es un número de teléfono, usarlo como nombre
                        memberName = participantPhone;
                    } else {
                        // Fallback: usar el participantPhone tal como viene
                        memberName = participantPhone;
                    }

                    member.setFullname(memberName);
                    member.setJoinedAt(LocalDateTime.now());

                    log.debug("Creando GroupMember: participant={}, fullname={}, conversation={}",
                            participantPhone, memberName, conversation.getId());

                    return groupMemberRepository.save(member);
                });
    }

    public void importChatMessagesFromFile(java.io.File csvFile, String instanceId) {
        ImportResult result = new ImportResult();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new java.io.FileInputStream(csvFile)))) {

            CSVFormat format = CSVFormat.DEFAULT
                    .withDelimiter(',')
                    .withFirstRecordAsHeader()
                    .withIgnoreEmptyLines(true)
                    .withTrim()
                    .withQuote('"')
                    .withEscape('"');

            CSVParser parser = format.parse(reader);

            Map<String, StudentConversationEntity> conversationCache = new HashMap<>();
            Map<String, GroupMember> groupMemberCache = new HashMap<>();
            WazendInstance wazendInstance = null;

            if (instanceId != null) {
                wazendInstance = wazendInstanceRepository.findByInstance(instanceId).orElse(null);
            }

            List<ChatMessage> batch = new ArrayList<>();
            int batchSize = 100;

            for (CSVRecord record : parser) {
                try {
                    if (record.size() < 10) {
                        result.errorCount++;
                        result.errors.add("Línea " + record.getRecordNumber() + ": Insuficientes campos (" + record.size() + ")");
                        continue;
                    }

                    ChatMessage message = parseCsvRecord(record, wazendInstance, conversationCache, groupMemberCache);

                    if (!chatMessageRepository.existsByWhatsappMessageId(message.getWhatsappMessageId())) {
                        batch.add(message);

                        if (batch.size() >= batchSize) {
                            processBatch(batch, result);
                            batch.clear();
                        }
                    } else {
                        result.duplicateCount++;
                        log.debug("Mensaje duplicado omitido: {}", message.getWhatsappMessageId());
                    }
                } catch (Exception e) {
                    result.errorCount++;
                    result.errors.add("Línea " + record.getRecordNumber() + ": " + e.getMessage());
                    log.error("Error procesando línea {}: {}", record.getRecordNumber(), e.getMessage(), e);

                    conversationCache.clear();
                    groupMemberCache.clear();
                }
            }

            if (!batch.isEmpty()) {
                processBatch(batch, result);
            }

            result.totalProcessed = (int) parser.getRecordNumber();

        } catch (Exception e) {
            log.error("Error general importando CSV desde archivo {}: ", csvFile.getName(), e);
            result.errors.add("Error general: " + e.getMessage());
        }
        log.info("Resultado Import desde archivo {}: {}", csvFile.getName(), result);
    }

    public static class ImportResult {
        public int totalProcessed = 0;
        public int successCount = 0;
        public int duplicateCount = 0;
        public int errorCount = 0;
        public List<String> errors = new ArrayList<>();

        @Override
        public String toString() {
            return String.format(
                    "Importación completada: %d procesados, %d exitosos, %d duplicados, %d errores",
                    totalProcessed, successCount, duplicateCount, errorCount
            );
        }
    }
}