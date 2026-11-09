package com.cocreadores.backend.service.chat;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cocreadores.backend.dto.chat.ChatMessageDTO;
import com.cocreadores.backend.dto.chat.ConversationDTO;
import com.cocreadores.backend.dto.chat.GroupMessageDTO;
import com.cocreadores.backend.dto.chat.ReactionsDTO;
import com.cocreadores.backend.dto.chat.SuggestionRequestDTO;
import com.cocreadores.backend.dto.wazend.ReactionMessageDTO;
import com.cocreadores.backend.dto.wazend.WazendDataDTO;
import com.cocreadores.backend.dto.wazend.WazendKeyDTO;
import com.cocreadores.backend.dto.wazend.WazendMessageDTO;
import com.cocreadores.backend.dto.wazend.WazendWebhookDTO;
import com.cocreadores.backend.especification.StudentConversationSpecifications;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.exception.UnauthorizedException;
import com.cocreadores.backend.filter.FilterUtils;
import com.cocreadores.backend.model.chat.ChatMessage;
import com.cocreadores.backend.model.chat.GroupMember;
import com.cocreadores.backend.model.chat.MessageSender;
import com.cocreadores.backend.model.chat.MessageType;
import com.cocreadores.backend.model.chat.ReactionWazend;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.wazend.WazendInstance;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.repository.ChatMessageRepository;
import com.cocreadores.backend.repository.GroupMemberRepository;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.ReactionWazendRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;
import com.cocreadores.backend.service.wazend.WazendInstanceServiceImp;
import com.cocreadores.backend.utils.Utils;

@Service
public class MessageLoggerService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private StudentConversationRepository studentConversationRepository;

    @Autowired
    private WebSocketNotificationService webSocketService;

    @Autowired
    WazendInstanceServiceImp wazendInstanceService;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ReactionWazendRepository reactionWazendRepository;

    @Autowired
    private MemberRepository memberRepository;

    /**
     * Guarda un mensaje entrante de whatsapp business en la base de datos y
     * notifica a los usuarios, traido de webhook
     * 
     * @param whatsappId
     * @param phoneNumber
     * @param content
     * @param type
     */
    @Transactional
    public ChatMessage logIncomingMessage(String whatsappId, String phoneNumber, String content, MessageType type,
            String name) {

        // Verificar si la conversación ya existe
        boolean isNewConversation = false;
        Optional<StudentConversationEntity> existingConversation = studentConversationRepository
                .findByPhoneAndConversationType(phoneNumber, ConversationType.WHATSAPP);

        isNewConversation = existingConversation.isEmpty();

        StudentConversationEntity conversation = getOrCreateConversation(phoneNumber, name, ConversationType.WHATSAPP,
                null, null);

        // Crear el mensaje
        ChatMessage message = new ChatMessage();
        message.setWhatsappMessageId(whatsappId);
        message.setPhoneNumber(phoneNumber);
        message.setSender(MessageSender.STUDENT);
        message.setConversationType(ConversationType.WHATSAPP);
        message.setContent(content);
        message.setMessageType(type);
        message.setSentAt(LocalDateTime.now(ZoneOffset.UTC));
        message.setRead(false);
        message.setConversation(conversation);

        // Guardar el mensaje primero
        message = chatMessageRepository.save(message);

        // Incrementar el contador de no leídos una sola vez
        conversation.setUnreadCount(conversation.getUnreadCount() != null ? conversation.getUnreadCount() + 1 : 1);
        conversation.setUpdatedAt(LocalDateTime.now());
        studentConversationRepository.save(conversation);

        studentConversationRepository.updateAnsweredStatus(conversation.getId(), false);

        // Notificaciones optimizadas
        ChatMessageDTO messageDTO = toDto(message, conversation.getId());
        webSocketService.notifyNewMessage(conversation.getId(), messageDTO);

        // Crear DTO de conversación para notificación
        ConversationDTO conversationDTO = buildConversationDTO(conversation, message);

        if (isNewConversation) {
            webSocketService.notifyNewConversation(conversationDTO);
        } else {
            webSocketService.notifyConversationUpdate(conversationDTO);
        }

        return message;
    }

    /**
     * Guarda un mensaje entrante de wazend en la base de datos y notifica a los
     * usuarios, traido de webhook de wazend
     * 
     * @param whatsappId
     * @param phoneNumber
     * @param content
     * @param type
     * @param instance
     * @param instanceIdServer
     */
    @Transactional
    public ChatMessage logIncomingMessageWazend(String whatsappId, String phoneNumber, String name, String content,
            MessageType type,
            WazendWebhookDTO wazendData, WazendKeyDTO key) {

        WazendDataDTO data = wazendData.getData();
        Long messageTimestamp = data.getMessageTimestamp();
        LocalDateTime sentAt = getMessageTime(messageTimestamp);

        WazendInstance wazendInstance = null;
        try {
            wazendInstance = wazendInstanceService.getInstanceForAnotherServicesByInstance(wazendData.getInstance());
        } catch (NotFoundException e) {
            WazendInstance newWazendInstance = new WazendInstance();
            newWazendInstance.setInstance(wazendData.getInstance());
            newWazendInstance.setInstanceIdServer(wazendData.getData().getInstanceId());
            newWazendInstance.setApiKey(wazendData.getApikey());
            newWazendInstance.setServer(wazendData.getServerUrl());
            newWazendInstance.setName(wazendData.getInstance());

            wazendInstance = wazendInstanceService.createForAnotherServices(newWazendInstance);
        }

        boolean fromMe = key.getFromMe() != null ? key.getFromMe() : false;
        String nameSender = fromMe ? phoneNumber : name;

        StudentConversationEntity conversation = getOrCreateConversation(phoneNumber, nameSender,
                ConversationType.WAZEND,
                wazendInstance, wazendInstance.getInstanceIdServer());

        String keyId = key.getId();

        ChatMessage message = new ChatMessage();
        message.setWhatsappMessageId(whatsappId);
        message.setPhoneNumber(phoneNumber);
        message.setSender(fromMe ? MessageSender.DEVICE : MessageSender.STUDENT);
        message.setContent(content);
        message.setMessageType(type);
        message.setSentAt(sentAt);
        message.setWazendInstance(wazendInstance);
        message.setInstanceIdServer(wazendInstance.getInstanceIdServer());
        message.setRead(false);
        message.setConversation(conversation);
        message.setFromMe(fromMe);
        message.setReferencedWhatsappMessageId(keyId);
        message.setConversationType(ConversationType.WAZEND);
        message.setMessageSecret(
                data.getMessage() != null && data.getMessage().getMessageContextInfo() != null
                        ? data.getMessage().getMessageContextInfo().getMessageSecret()
                        : "Wazend dont provide message secret");
        // Guardar el mensaje primero
        message = chatMessageRepository.save(message);

        // Incrementar el contador de no leídos una sola vez
        conversation.setUnreadCount(conversation.getUnreadCount() != null ? conversation.getUnreadCount() + 1 : 1);
        conversation.setUpdatedAt(sentAt);
        conversation.setAnswered(false);

        if (fromMe) {
            conversation.setAnswered(true);
            conversation.setUnreadCount(0L);
        }
        studentConversationRepository.save(conversation);

        // Notificaciones optimizadas
        ChatMessageDTO messageDTO = toDto(message, wazendInstance, wazendInstance.getInstanceIdServer());
        webSocketService.notifyNewMessage(conversation.getId(), messageDTO);

        ConversationDTO conversationDTO = buildConversationDTO(conversation, message);

        webSocketService.notifyConversationUpdate(conversationDTO);

        return message;
    }

    /**
     * @throws BadRequestException
     * @description Guarda un mensaje entrante de grupo de wazend en la base de
     *              datos y notifica a los usuarios, traido de webhook de wazend
     */
    @Transactional
    public void logIncomingGroupMessage(WazendWebhookDTO wazendData) throws BadRequestException {
        WazendDataDTO data = wazendData.getData();
        WazendKeyDTO key = data.getKey();
        String keyId = key.getId();

        String participant = data.getKey() != null ? data.getKey().getParticipant() : null;
        participant = Utils.normalizePhoneNumber(participant);
        String participantParse;
        String remoteJid = key.getRemoteJid();
        String groupId = remoteJid != null ? remoteJid.split("@")[0] : null;
        String senderName = data.getPushName();

        String messageType = data.getMessageType();
        MessageType messageTypeEnum = null;
        String fileType = null;
        boolean fromMe = key.getFromMe() != null ? key.getFromMe() : false;

        switch (messageType) {
            case "conversation":
                messageTypeEnum = MessageType.TEXT;
                break;
            case "imageMessage":
                messageTypeEnum = MessageType.IMAGE;
                fileType = data.getMessage().getImageMessage().getMimetype().split("/")[1];
                break;
            case "stickerMessage":
                messageTypeEnum = MessageType.STICKER;
                fileType = data.getMessage().getStickerMessage().getMimetype().split("/")[1];
                break;
            case "lottieStickerMessage":
                messageTypeEnum = MessageType.STICKER;
                fileType = data.getMessage().getLottieStickerMessage().getMimetype() != null
                        ? data.getMessage().getLottieStickerMessage().getMimetype().split("/")[1]
                        : "was";
                break;
            case "videoMessage":
                messageTypeEnum = MessageType.VIDEO;
                fileType = data.getMessage().getVideoMessage().getMimetype().split("/")[1];
                break;
            case "audioMessage":
                messageTypeEnum = MessageType.AUDIO;
                fileType = data.getMessage().getAudioMessage().getMimetype().split("/")[1];
                break;
            case "documentMessage":
                messageTypeEnum = MessageType.DOCUMENT;
                fileType = data.getMessage().getDocumentMessage().getMimetype().split("/")[1];
                break;
            case "reactionMessage":
                throw new BadRequestException(
                        "El mensaje de reacción no debe ser procesado aquí, se maneja por separado");
            default:
                throw new BadRequestException(
                        "Tipo de mensaje no soportado: " + messageType + " en el mensaje de Wazend");
        }

        String mediaUrl = null;

        if (data.getMessage() != null) {
            if (data.getMessage().getMediaUrl() != null) {
                mediaUrl = data.getMessage().getMediaUrl();
            } else if (data.getMessage().getImageMessage() != null) {
                mediaUrl = data.getMessage().getImageMessage().getUrl();
            }
        }
        Long messageTimestamp = data.getMessageTimestamp();
        LocalDateTime sentAt = getMessageTime(messageTimestamp);

        if (participant != null) {
            if (participant.contains("@")) {
                participantParse = participant.split("@")[0];
            } else {
                participantParse = participant;
            }
        } else {
            participantParse = null;
        }
        WazendInstance wazendInstance = null;
        try {
            wazendInstance = wazendInstanceService.getInstanceForAnotherServicesByInstance(wazendData.getInstance());
        } catch (NotFoundException e) {
            WazendInstance newWazendInstance = new WazendInstance();
            newWazendInstance.setInstance(wazendData.getInstance());
            newWazendInstance.setInstanceIdServer(wazendData.getData().getInstanceId());
            newWazendInstance.setApiKey(wazendData.getApikey());
            newWazendInstance.setServer(wazendData.getServerUrl());
            newWazendInstance.setName(wazendData.getInstance());
            newWazendInstance.setIsActive(true);
            newWazendInstance.designRole(Role.SUPER_ADMIN);

            wazendInstance = wazendInstanceService.createForAnotherServices(newWazendInstance);
        }

        StudentConversationEntity conversation = getOrCreateConversation(groupId, "Grupo: " + groupId,
                ConversationType.WAZEND_GROUP,
                wazendInstance, wazendInstance.getInstanceIdServer());

        conversation.setUnreadCount(conversation.getUnreadCount() != null ? conversation.getUnreadCount() + 1 : 1);
        conversation.setAnswered(false);
        conversation.setUpdatedAt(sentAt);

        if (fromMe) {
            conversation.setAnswered(true);
            conversation.setUnreadCount(0L);
        }

        studentConversationRepository.save(conversation);

        String messageSecret = data.getMessage() != null
                ? data.getMessage().getMessageContextInfo() != null
                        ? data.getMessage().getMessageContextInfo().getMessageSecret()
                        : null
                : null;

        GroupMember groupMember = null;

        if (participant != null && groupId != null) {
            groupMember = groupMemberRepository.findByConversationAndParticipant(conversation, participantParse)
                    .orElseGet(() -> {
                        GroupMember member = new GroupMember();
                        member.setParticipant(participantParse);
                        member.setFullname(senderName);
                        member.setJoinedAt(sentAt);
                        member.setConversation(conversation);
                        return groupMemberRepository.save(member);
                    });
        }
        ChatMessage message = new ChatMessage();
        message.setWhatsappMessageId(key.getId());
        message.setUserName(senderName);
        message.setPhoneNumber(groupId);
        message.setInstanceIdServer(wazendInstance.getInstanceIdServer());
        message.setMessageSecret(messageSecret != null ? messageSecret : "Wazend dont provide message secret");
        message.setContent(messageTypeEnum == MessageType.TEXT
                ? (data.getMessage() != null ? data.getMessage().getConversation() : null)
                : MessageType.fromString(messageTypeEnum) + " de " + senderName);
        message.setConversation(conversation);
        message.setSentAt(sentAt);
        message.setSender(MessageSender.STUDENT);
        message.setReferencedWhatsappMessageId(keyId);
        message.setMessageType(messageTypeEnum);

        if (messageTypeEnum != MessageType.TEXT && messageTypeEnum != MessageType.REACTION && mediaUrl != null) {
            message.setMediaUrl(mediaUrl);
        }

        if (messageTypeEnum != MessageType.TEXT && messageTypeEnum != MessageType.REACTION && fileType != null) {
            message.setFileType(fileType);
        }

        message.setWazendInstance(wazendInstance);
        message.setConversationType(ConversationType.WAZEND_GROUP);
        message.setGroupMember(groupMember);
        message.setFromMe(fromMe);
        chatMessageRepository.save(message);

        // Notificar actualización de conversación de grupo
        ConversationDTO conversationDTO = buildConversationDTO(conversation, message);
        webSocketService.notifyConversationUpdate(conversationDTO);
    }

    /**
     * Guarda un mensaje entrante de wazend en la base de datos y notifica a los
     * usuarios, traido de webhook de wazend, especialmente para imágenes
     * 
     * @param whatsappId
     * @param phoneNumber
     * @param content
     * @param type
     * @param instance
     * @param instanceIdServer
     */
    @Transactional
    public ChatMessage logIncomingMessageWazendMedia(String whatsappId, String phoneNumber, String name, String url,
            MessageType type,
            WazendWebhookDTO wazendData, WazendKeyDTO key, String fileType) {

        WazendDataDTO data = wazendData.getData();
        String keyId = key.getId();

        WazendInstance wazendInstance = null;
        try {
            wazendInstance = wazendInstanceService.getInstanceForAnotherServicesByInstance(wazendData.getInstance());
        } catch (NotFoundException e) {
            WazendInstance newWazendInstance = new WazendInstance();
            newWazendInstance.setInstance(wazendData.getInstance());
            newWazendInstance.setInstanceIdServer(wazendData.getData().getInstanceId());
            newWazendInstance.setApiKey(wazendData.getApikey());
            newWazendInstance.setServer(wazendData.getServerUrl());
            newWazendInstance.setName(wazendData.getInstance());
            wazendInstance = wazendInstanceService.createForAnotherServices(newWazendInstance);
        }

        // Verificar si la conversación ya existe
        boolean isNewConversation = false;
        Optional<StudentConversationEntity> existingConversation = studentConversationRepository
                .findByPhoneAndWazendInstanceAndConversationType(
                        phoneNumber, wazendInstance, ConversationType.WAZEND);

        isNewConversation = existingConversation.isEmpty();

        boolean fromMe = key.getFromMe() != null ? key.getFromMe() : false;
        String nameSender = fromMe ? phoneNumber : name;

        StudentConversationEntity conversation = getOrCreateConversation(phoneNumber, nameSender,
                ConversationType.WAZEND,
                wazendInstance, wazendInstance.getInstanceIdServer());

        Long messageTimestamp = data.getMessageTimestamp();
        LocalDateTime sentAt = getMessageTime(messageTimestamp);

        ChatMessage message = new ChatMessage();
        message.setWhatsappMessageId(whatsappId);
        message.setPhoneNumber(phoneNumber);
        message.setSender(fromMe ? MessageSender.DEVICE : MessageSender.STUDENT);
        message.setMediaUrl(url);
        message.setMessageType(type);
        message.setContent(MessageType.fromString(type) + " de " + nameSender);
        message.setSentAt(sentAt);
        message.setConversationType(ConversationType.WAZEND);
        message.setWazendInstance(wazendInstance);
        message.setInstanceIdServer(wazendInstance.getInstanceIdServer());
        message.setRead(false);
        message.setConversation(conversation);
        message.setFromMe(fromMe);
        message.setReferencedWhatsappMessageId(keyId);

        if (type != MessageType.TEXT) {
            message.setFileType(fileType);
        }

        // Guardar el mensaje primero
        message = chatMessageRepository.save(message);

        // Incrementar el contador de no leídos una sola vez
        conversation.setUnreadCount(conversation.getUnreadCount() != null ? conversation.getUnreadCount() + 1 : 1);
        conversation.setUpdatedAt(sentAt);
        studentConversationRepository.save(conversation);

        studentConversationRepository.updateAnsweredStatus(conversation.getId(), false);

        // Notificaciones optimizadas
        ChatMessageDTO messageDTO = toDto(message, wazendInstance, wazendInstance.getInstanceIdServer());
        webSocketService.notifyNewMessage(conversation.getId(), messageDTO);

        ConversationDTO conversationDTO = buildConversationDTO(conversation, message);

        if (isNewConversation) {
            webSocketService.notifyNewConversation(conversationDTO);
        } else {
            webSocketService.notifyConversationUpdate(conversationDTO);
        }

        return message;
    }

    @Transactional
    public void logReaction(WazendDataDTO data)
            throws NotFoundException, BadRequestException {

        WazendMessageDTO wazendMessage = data.getMessage();
        if (wazendMessage == null || wazendMessage.getReactionMessage() == null) {
            throw new BadRequestException("Mensaje de reacción no encontrado en el mensaje de Wazend");
        }
        ReactionMessageDTO reactionMessage = wazendMessage.getReactionMessage();
        if (reactionMessage == null || reactionMessage.getText() == null) {
            throw new BadRequestException("Texto de reacción no encontrado en el mensaje de Wazend");
        }

        Optional<List<ChatMessage>> message = this.chatMessageRepository
                .findByReferencedWhatsappMessageId(data.getMessage().getReactionMessage().getKey().getId());

        if (message.isEmpty()) {
            throw new BadRequestException("Mensaje no encontrado con el id de referencia: "
                    + data.getMessage().getReactionMessage().getKey().getId());
        }

        List<ChatMessage> chatMessage = message.get();
        if (chatMessage.isEmpty()) {
            throw new BadRequestException("No se encontró ningún mensaje con el id de referencia: "
                    + data.getMessage().getReactionMessage().getKey().getId());
        }

        chatMessage.stream()
                .forEach(m -> {
                    ReactionWazend reaction = new ReactionWazend();
                    reaction.setChatMessage(m);
                    reaction.setReferenceId(data.getMessage().getReactionMessage().getKey().getId());
                    reaction.setReaction(reactionMessage.getText());
                    reaction.setUserReacted(
                            data.getKey().getParticipant() != null ? data.getKey().getParticipant() : "Desconocido");
                    reaction = reactionWazendRepository.save(reaction);
                });
    }

    /**
     * @description Guarda un mensaje de salida enviado desde el crm, estos son para
     *              manejar los de whatsapp business
     */
    @Transactional
    public ChatMessage logOutgoingMessage(String phoneNumber, String content, MessageType type, MessageSender sender,
            Long userId, String userName) {
        StudentConversationEntity conversation = getOrCreateConversation(phoneNumber, userName,
                ConversationType.WHATSAPP, null, null);

        ChatMessage message = new ChatMessage();
        message.setPhoneNumber(phoneNumber);
        message.setSender(sender);
        message.setContent(content);
        message.setMessageType(type);
        message.setSentAt(LocalDateTime.now(ZoneOffset.UTC));
        message.setRead(true);
        message.setUserId(userId);
        message.setUserName(userName);
        message.setConversationType(ConversationType.WHATSAPP);
        message.setConversation(conversation);

        ChatMessageDTO messageDTO = toDto(message, conversation.getId());

        webSocketService.notifyNewMessage(conversation.getId(), messageDTO);

        conversation.setUnreadCount(conversation.getUnreadCount() != null ? 0L : 0L);
        conversation.setAnswered(true);
        conversation.setUpdatedAt(LocalDateTime.now());

        // Notificar actualización de conversación
        ConversationDTO conversationDTO = buildConversationDTO(conversation, message);
        webSocketService.notifyConversationUpdate(conversationDTO);

        return chatMessageRepository.save(message);
    }

    /**
     * @description Guarda un mensaje de salida enviado desde el crm, estos son para
     *              manejar los de wazend
     */
    @Transactional
    public ChatMessage logOutgoingMessage(String phoneNumber, String content, MessageType type, MessageSender sender,
            Long userId, String userName, WazendInstance wazendInstance, String keyReference) {

        StudentConversationEntity conversation = getOrCreateConversation(phoneNumber, phoneNumber,
                ConversationType.WAZEND,
                wazendInstance, wazendInstance.getInstanceIdServer());

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setPhoneNumber(phoneNumber);
        message.setSender(sender);
        message.setContent(content);
        message.setMessageType(type);
        message.setSentAt(LocalDateTime.now(ZoneOffset.UTC));
        message.setRead(true);
        message.setUserId(userId);
        message.setUserName(userName);
        message.setConversationType(ConversationType.WAZEND);
        message.setWazendInstance(wazendInstance);
        message.setReferencedWhatsappMessageId(keyReference);

        ChatMessageDTO messageDTO = toDto(message, conversation.getId());

        webSocketService.notifyNewMessage(conversation.getId(), messageDTO);

        conversation.setUnreadCount(conversation.getUnreadCount() != null ? 0L : 0L);
        conversation.setAnswered(true);
        conversation.setUpdatedAt(LocalDateTime.now());
        studentConversationRepository.save(conversation);

        // Notificar actualización de conversación
        ConversationDTO conversationDTO = buildConversationDTO(conversation, message);
        webSocketService.notifyConversationUpdate(conversationDTO);

        return chatMessageRepository.save(message);
    }

    /**
     * @description Guarda un mensaje de salida enviado desde el crm, estos son para
     *              manejar los de wazend
     */
    @Transactional
    public ChatMessage logOutChatGroupMessage(String phoneNumber, String content, MessageType type,
            MessageSender sender,
            Long userId, String userName, WazendInstance wazendInstance, Long groupId, String keyReference) {

        Optional<StudentConversationEntity> conversation = this.studentConversationRepository.findById(groupId);
        StudentConversationEntity conversationFinal;
        if (conversation.isEmpty()) {
            StudentConversationEntity newConversation = new StudentConversationEntity();
            newConversation.setPhone(phoneNumber);
            newConversation.setFullName(userName != null ? userName : phoneNumber);
            newConversation.setWazendInstance(wazendInstance != null ? wazendInstance : null);
            newConversation.setConversationType(ConversationType.WAZEND_GROUP);
            newConversation.setInstanceIdServer(wazendInstance != null ? wazendInstance.getInstanceIdServer() : null);
            newConversation.setAnswered(false);
            newConversation.setCreatedAt(LocalDateTime.now());
            studentConversationRepository.save(newConversation);
            conversationFinal = newConversation;
        } else {
            conversationFinal = conversation.get();
        }

        GroupMember groupMember = groupMemberRepository.findByConversationAndParticipant(conversationFinal, phoneNumber)
                .orElseGet(() -> {
                    GroupMember member = new GroupMember();
                    member.setParticipant(phoneNumber);
                    member.setFullname(userName != null ? userName : phoneNumber);
                    member.setJoinedAt(LocalDateTime.now());
                    member.setConversation(conversationFinal);
                    return groupMemberRepository.save(member);
                });

        ChatMessage message = new ChatMessage();
        message.setConversation(conversationFinal);
        message.setMessageType(type);
        message.setPhoneNumber(phoneNumber);
        message.setSender(sender);
        message.setContent(content);
        message.setConversationType(ConversationType.WAZEND_GROUP);
        message.setSentAt(LocalDateTime.now(ZoneOffset.UTC));
        message.setRead(true);
        message.setUserId(userId);
        message.setUserName(userName);
        message.setConversationType(ConversationType.WAZEND);
        message.setWazendInstance(wazendInstance);
        message.setFromMe(true);
        message.setGroupMember(groupMember);
        message.setInstanceIdServer(wazendInstance != null ? wazendInstance.getInstanceIdServer() : null);
        message.setReferencedWhatsappMessageId(keyReference);

        ChatMessageDTO messageDTO = toDto(message, conversationFinal.getId());

        webSocketService.notifyNewMessage(conversationFinal.getId(), messageDTO);

        conversationFinal.setUnreadCount(conversationFinal.getUnreadCount() != null ? 0L : 0L);
        conversationFinal.setAnswered(true);
        conversationFinal.setUpdatedAt(LocalDateTime.now());
        studentConversationRepository.save(conversationFinal);

        // Notificar actualización de conversación
        ConversationDTO conversationDTO = buildConversationDTO(conversationFinal, message);
        webSocketService.notifyConversationUpdate(conversationDTO);

        return chatMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDTO> getPaginatedMessagesByIdMessage(Long id, String search, Pageable pageable,
            List<Role> roles)
            throws UnauthorizedException, NotFoundException {
        Page<ChatMessageDTO> allMessages = getMessagesByIdMessage(id, roles, pageable, search);

        if (allMessages.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        return allMessages;
    }

    @Transactional
    public void notifyChanges(StudentConversationEntity conversation) {
        ConversationDTO conversationDTO = buildConversationDTO(conversation,
                chatMessageRepository.findTopByConversationOrderBySentAtDesc(conversation));

        webSocketService.notifyConversationUpdate(conversationDTO);
    }

    @Transactional
    public void deleteConversation(Long id) throws NotFoundException {
        StudentConversationEntity student = studentConversationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con el id: " + id));

        chatMessageRepository.deleteByConversationId(id);
        studentConversationRepository.delete(student);

        // Notificar eliminación
        webSocketService.notifyConversationDeleted(id);
    }

    /**
     * Marcar conversación como leída y notificar cambio de contador
     */
    @Transactional
    public void markConversationAsRead(Long conversationId) {
        Optional<StudentConversationEntity> conversationOpt = studentConversationRepository.findById(conversationId);

        if (conversationOpt.isPresent()) {
            StudentConversationEntity conversation = conversationOpt.get();
            conversation.setUnreadCount(0L);
            studentConversationRepository.save(conversation);

            // Notificar cambio en contador de no leídos
            webSocketService.notifyUnreadCountUpdate(conversationId, 0L);
        }
    }

    /**
     * Método para obtener conversación individual (para notificaciones específicas)
     * 
     * @throws UnauthorizedException
     */
    @Transactional(readOnly = true)
    public ConversationDTO getConversationById(Long conversationId, List<Role> roles)
            throws NotFoundException, UnauthorizedException {
        StudentConversationEntity conversation = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversación no encontrada con id: " + conversationId));

        ChatMessage lastMessage = chatMessageRepository.findTopByConversationOrderBySentAtDesc(conversation);

        if (conversation.getConversationType() != ConversationType.WHATSAPP) {
            WazendInstance instance = conversation.getWazendInstance();
            if (instance == null) {
                throw new NotFoundException("La instancia de Wazend no está disponible para esta conversación");
            }

            if (!instance.getIsActive()) {
                throw new UnauthorizedException("La instancia de Wazend no se encuentra activa");
            }

            if (instance.getAcceptedRoles() == null || instance.getAcceptedRoles().isEmpty()) {
                throw new UnauthorizedException("No se han configurado roles para esta instancia de Wazend");
            }

            Boolean hasAccess = instance.getAcceptedRoles().stream()
                    .anyMatch(role -> roles.stream()
                            .anyMatch(userRole -> userRole.name().equals(role.name())));

            if (!hasAccess) {
                throw new UnauthorizedException("No tienes permiso para acceder a este chat de Wazend");
            }

        }

        return buildConversationDTO(conversation, lastMessage);
    }

    /**
     * Construye un DTO de conversación de forma eficiente
     */
    private ConversationDTO buildConversationDTO(StudentConversationEntity conversation, ChatMessage lastMessage) {
        boolean hasUnread = conversation.getUnreadCount() != null && conversation.getUnreadCount() > 0;
        boolean isGroup = conversation.getWazendInstance() != null
                && conversation.getConversationType() == ConversationType.WAZEND_GROUP;

        ConversationDTO.WazendDTO wazend = null;
        ConversationDTO.WazendGroupDTO wazendGroup = null;

        if (conversation.getWazendInstance() != null) {
            wazend = ConversationDTO.WazendDTO.builder()
                    .id(conversation.getWazendInstance().getId())
                    .name(conversation.getWazendInstance().getName())
                    .instanceIdServer(conversation.getInstanceIdServer())
                    .isActive(conversation.getWazendInstance().getIsActive())
                    .build();
        }

        if (isGroup) {
            wazendGroup = ConversationDTO.WazendGroupDTO.builder()
                    .groupId(conversation.getPhone())
                    .groupName(conversation.getPhone())
                    .id(conversation.getWazendInstance().getId())
                    .build();
        }

        Set<ConversationDTO.CustomTagDTO> customTags = conversation.getCustomTags() != null
                ? conversation.getCustomTags().stream()
                        .map(customTag -> ConversationDTO.CustomTagDTO.builder()
                                .id(customTag.getId())
                                .name(customTag.getName())
                                .color(customTag.getColor())
                                .studentTag(customTag.getStudentTag() != null ? customTag.getStudentTag() : null)
                                .important(customTag.isImportant())
                                .enabled(customTag.isEnabled())
                                .dark(customTag.isDark())
                                .build())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return ConversationDTO.builder()
                .conversationId(conversation.getId())
                .phoneNumber(conversation.getPhone())
                .studentName(conversation.getFullName())
                .studentTag(conversation.getStudentTag() != null ? conversation.getStudentTag().name() : null)
                .interestTag(conversation.getInterestTag() != null ? conversation.getInterestTag().name() : null)
                .lastMessage(lastMessage != null ? lastMessage.getContent() : null)
                .lastMessageTime(lastMessage != null ? lastMessage.getSentAt() : null)
                .hasUnread(hasUnread)
                .unreadCount(conversation.getUnreadCount() != null ? conversation.getUnreadCount() : 0L)
                .analisis(conversation.getAnalisis())
                .conversationType(
                        conversation.getConversationType() != null ? conversation.getConversationType().name() : null)
                .wazend(wazend)
                .isGroup(isGroup)
                .wazendGroup(wazendGroup)
                .customTags(customTags)
                .build();
    }

    private ChatMessageDTO toDto(ChatMessage message, Long conversationId) {
        StudentConversationEntity studentEntity = studentConversationRepository
                .findById(message.getConversation().getId())
                .orElse(null);
        String studentName = null;
        if (studentEntity != null) {
            studentName = studentEntity.getFullName();
        }

        return ChatMessageDTO.builder()
                .id(message.getId())
                .conversationId(conversationId)
                .whatsappMessageId(message.getWhatsappMessageId())
                .phoneNumber(message.getPhoneNumber())
                .userId(message.getUserId())
                .userName(message.getUserName())
                .sender(message.getSender().name())
                .content(message.getContent())
                .mediaUrl(message.getMediaUrl())
                .messageType(message.getMessageType().name())
                .read(message.getRead())
                .sentAt(message.getSentAt())
                .fromMe(message.getFromMe() != null ? message.getFromMe() : false)
                .studentName(studentName)
                .build();
    }

    private ChatMessageDTO toDto(ChatMessage message, WazendInstance instance, String instanceIdServer) {
        StudentConversationEntity studentEntity = null;
        if (message.getPhoneNumber() != null && instance != null) {
            studentEntity = studentConversationRepository
                    .findByPhoneAndWazendInstance(message.getPhoneNumber(), instance)
                    .orElse(null);
        }
        if (studentEntity == null && message.getPhoneNumber() != null && instanceIdServer != null) {
            studentEntity = studentConversationRepository
                    .findByPhoneAndInstanceIdServer(message.getPhoneNumber(), instanceIdServer)
                    .orElse(null);
        }

        String studentName = null;
        if (studentEntity != null) {
            studentName = studentEntity.getFullName();
        }

        List<ReactionsDTO> reactions;

        if (message.getReactions() != null) {
            reactions = message.getReactions().stream()
                    .collect(Collectors.groupingBy(ReactionWazend::getReaction, Collectors.counting()))
                    .entrySet().stream()
                    .map(entry -> ReactionsDTO.builder()
                            .reaction(entry.getKey())
                            .count(entry.getValue())
                            .build())
                    .collect(Collectors.toList());
        } else {
            reactions = Collections.emptyList();
        }

        ChatMessageDTO.ChatMessageDTOBuilder chatMessageDTOBuilder = ChatMessageDTO.builder()
                .id(message.getId())
                .whatsappMessageId(message.getWhatsappMessageId())
                .phoneNumber(message.getPhoneNumber())
                .userId(message.getUserId())
                .userName(message.getUserName())
                .sender(message.getSender().name())
                .content(message.getContent())
                .mediaUrl(message.getMediaUrl())
                .messageType(message.getMessageType().name())
                .read(message.getRead())
                .sentAt(message.getSentAt())
                .fileName(message.getFileName() != null ? message.getFileName() : null)
                .fileType(message.getFileType() != null ? message.getFileType() : null)
                .reactions(reactions != null ? reactions : Collections.emptyList())
                .fromMe(message.getFromMe() != null ? message.getFromMe() : false)
                .studentName(studentName);

        if (message.getMessageType() == MessageType.DOCUMENT) {
            String filetype = message.getFileType();
            String fileName = message.getFileName();

            chatMessageDTOBuilder
                    .fileName(fileName != null ? fileName : "Archivo sin nombre")
                    .fileType(filetype != null ? filetype : "desconocido");
        }

        return chatMessageDTOBuilder.build();
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDTO> getMessagesByIdMessage(Long id, List<Role> roleNames, Pageable pageable, String search)
            throws UnauthorizedException, NotFoundException {
        Page<ChatMessage> messages = chatMessageRepository
                .findByConversation_IdOrderBySentAtAsc(id, pageable, search);

        if (messages.isEmpty()) {
            throw new NotFoundException("No se encontraron mensajes para la conversación con el id: " + id);
        }

        StudentConversationEntity conversation = messages.stream()
                .anyMatch(message -> message.getConversation() != null)
                        ? messages.stream()
                                .findFirst()
                                .map(ChatMessage::getConversation)
                                .orElseThrow(
                                        () -> new NotFoundException("No se encontró la conversación con el id: " + id))
                        : null;

        boolean isWazendChat = conversation.getConversationType() == ConversationType.WAZEND
                || conversation.getConversationType() == ConversationType.WAZEND_GROUP;

        boolean isGroupChat = conversation.getConversationType() == ConversationType.WAZEND_GROUP;

        if (isGroupChat) {
            throw new NotFoundException("No se puede acceder a los mensajes de un grupo de Wazend por este endpoint");
        }

        if (isWazendChat) {
            WazendInstance instance = conversation.getWazendInstance();

            if (instance == null) {
                throw new NotFoundException("La instancia de Wazend no está disponible para esta conversación");
            }

            if (instance.getAcceptedRoles() == null || instance.getAcceptedRoles().isEmpty()) {
                throw new UnauthorizedException("No se han configurado roles para esta instancia de Wazend");
            }

            Boolean hasAccess = instance.getAcceptedRoles().stream()
                    .anyMatch(role -> roleNames.contains(role));
            if (!hasAccess) {
                throw new UnauthorizedException("No tienes permiso para acceder a este chat de Wazend");
            }
        }

        List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(message -> toDto(message, conversation.getWazendInstance(),
                        conversation.getInstanceIdServer()))
                .toList();

        return messageDTOs.isEmpty()
                ? new PageImpl<>(Collections.emptyList(), pageable, 0)
                : new PageImpl<>(messageDTOs, pageable, messages.getTotalElements());
    }

    public boolean isMessageProcessed(String messageId) {
        return chatMessageRepository.existsByWhatsappMessageId(messageId);
    }

    public List<SuggestionRequestDTO> getMessagesByPhoneNumberSuggestion(String phoneNumber) {
        List<ChatMessage> messages = chatMessageRepository.findTop30ByPhoneNumberOrderBySentAtAsc(phoneNumber);

        return messages.stream()
                .map(message -> {
                    SuggestionRequestDTO dto = new SuggestionRequestDTO();
                    dto.setDateTime(message.getSentAt().toString());
                    dto.setContent(message.getContent());
                    dto.setSender(message.getSender().name());
                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ConversationDTO> getPaginatedConversations(
            Pageable pageable,
            List<Role> roleNames,
            Map<String, String> allFilters,
            ConversationType conversationType) throws UnauthorizedException {
        Set<String> rolesSet = new HashSet<>();

        // Obteno el rol omitiendo el rol macabro innecesario agregado
        if (roleNames == null) {
            throw new UnauthorizedException("No tienes permiso para acceder a las conversaciones");
        }
        roleNames.stream().forEach(role -> {
            String studentType = Utils.getStudentTypeByRoleUser(role);
            if (studentType != null) {
                rolesSet.add(studentType);
            }
        });
        // Extraer globalSearch de los filtros
        String globalSearch = FilterUtils.getGlobalSearchValue(allFilters);

        Page<StudentConversationEntity> conversationsPage;

        // Usar Specifications para filtros avanzados
        conversationsPage = getPaginatedConversationsWithSpecifications(
                pageable, allFilters, globalSearch, conversationType, rolesSet);

        List<ConversationDTO> conversationDTOs = conversationsPage.getContent().stream()
                .filter(conversation -> {
                    if (conversation.getConversationType() == ConversationType.WHATSAPP) {
                        return true;
                    }
                    if (conversation.getWazendInstance() == null) {
                        return false;
                    }
                    if (conversation.getWazendInstance().getAcceptedRoles() == null ||
                            conversation.getWazendInstance().getAcceptedRoles().isEmpty()) {
                        return false;
                    }
                    return conversation.getWazendInstance().getAcceptedRoles().stream()
                            .anyMatch(role -> roleNames.contains(role));
                })
                .map(conversation -> {
                    ChatMessage lastMessage = chatMessageRepository
                            .findTopByConversationOrderBySentAtDesc(conversation);
                    return buildConversationDTO(conversation, lastMessage);
                })
                .toList();

        return new PageImpl<>(conversationDTOs, pageable, conversationsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<GroupMessageDTO> getGroupMessagesByWazendId(Long conversationId, String search, Pageable pageable,
            List<Role> roleNames) throws NotFoundException, UnauthorizedException {
        List<ChatMessage> messages = chatMessageRepository
                .findByIdConversationWithGroupMemberAndStudentConversationOrderBySentAtAsc(conversationId);
        if (messages.isEmpty()) {
            throw new NotFoundException("Conversation not found with id: " + conversationId);
        }

        WazendInstance instance = messages.stream().findFirst()
                .map(ChatMessage::getWazendInstance)
                .orElseThrow(() -> new NotFoundException("Conversation not found with id: " + conversationId));

        StudentConversationEntity conversation = messages.stream().findFirst()
                .map(ChatMessage::getConversation)
                .orElseThrow(() -> new NotFoundException("Conversation not found with id: " + conversationId));

        if (conversation.getConversationType() != ConversationType.WAZEND_GROUP) {
            throw new IllegalArgumentException("Este endpoint solo permite acceder a mensajes de grupos de Wazend");
        }

        Boolean hasAccess = instance.getAcceptedRoles().stream()
                .anyMatch(role -> roleNames.contains(role));
        if (!hasAccess) {
            throw new UnauthorizedException("No tienes permiso para acceder a este chat de Wazend");
        }

        List<GroupMessageDTO> messageDTOs = messages.stream()
                .map(this::convertToGroupMessageDTO)
                .collect(Collectors.toList());

        List<GroupMessageDTO> filteredMessages = messageDTOs;

        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = search.toLowerCase().trim();
            filteredMessages = messageDTOs.stream()
                    .filter(message -> message.getContent() != null &&
                            message.getContent().toLowerCase().contains(searchTerm))
                    .collect(Collectors.toList());
        }

        filteredMessages = filteredMessages.stream()
                .sorted((m1, m2) -> {
                    if (m1.getSentAt() == null && m2.getSentAt() == null)
                        return 0;
                    if (m1.getSentAt() == null)
                        return 1;
                    if (m2.getSentAt() == null)
                        return -1;
                    return m2.getSentAt().compareTo(m1.getSentAt());
                })
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredMessages.size());

        if (start > filteredMessages.size()) {
            return new PageImpl<>(Collections.emptyList(), pageable, filteredMessages.size());
        }

        List<GroupMessageDTO> pageContent = filteredMessages.subList(start, end);

        Page<GroupMessageDTO> page = new PageImpl<>(pageContent, pageable, filteredMessages.size());

        return page;
    }

    private GroupMessageDTO convertToGroupMessageDTO(ChatMessage message) {
        GroupMember groupMember = message.getGroupMember();
        StudentConversationEntity conversation = message.getConversation();

        GroupMessageDTO.GroupMemberDTO groupMemberDTO = null;

        if (groupMember != null) {
            groupMemberDTO = GroupMessageDTO.GroupMemberDTO.builder()
                    .id(groupMember.getId())
                    .participant(groupMember.getParticipant())
                    .fullname(groupMember.getFullname())
                    .joinedAt(groupMember.getJoinedAt())
                    .build();
        }

        // Crear lista de reacciones
        List<ReactionsDTO> reactions;

        if (message.getReactions() != null) {
            reactions = message.getReactions().stream()
                    .collect(Collectors.groupingBy(ReactionWazend::getReaction, Collectors.counting()))
                    .entrySet().stream()
                    .map(entry -> ReactionsDTO.builder()
                            .reaction(entry.getKey())
                            .count(entry.getValue())
                            .build())
                    .collect(Collectors.toList());
        } else {
            reactions = Collections.emptyList();
        }

        return GroupMessageDTO.builder()
                .id(message.getId())
                .whatsappMessageId(message.getWhatsappMessageId())
                .phoneNumber(message.getPhoneNumber())
                .userId(message.getUserId())
                .userName(message.getUserName())
                .sender(message.getSender().name())
                .content(message.getContent())
                .messageType(message.getMessageType().name())
                .mediaUrl(message.getMediaUrl())
                .read(message.getRead())
                .sentAt(message.getSentAt())
                .groupName(conversation.getFullName())
                .fileName(message.getFileName())
                .fileType(message.getFileType())
                .groupMember(groupMemberDTO)
                .reactions(reactions) // Asignar la lista de reacciones
                .build();
    }

    /**
     * Método privado para obtener o crear una conversación
     * 
     * @param phoneNumber      Número de teléfono del estudiante
     * @param name             Nombre del estudiante
     * @param conversationType Tipo de conversación
     * @param wazendInstance   Instancia de Wazend
     * @param instanceIdServer ID de la instancia en el servidor
     */
    private StudentConversationEntity getOrCreateConversation(String phoneNumber, String name,
            ConversationType conversationType,
            WazendInstance wazendInstance, String instanceIdServer) {
        Optional<StudentConversationEntity> conversationOpt;

        if (conversationType == ConversationType.WAZEND || conversationType == ConversationType.WAZEND_GROUP) {
            conversationOpt = studentConversationRepository.findByPhoneAndWazendInstanceAndConversationType(phoneNumber,
                    wazendInstance, conversationType);
        } else {
            conversationOpt = studentConversationRepository.findByPhoneAndConversationType(phoneNumber,
                    conversationType);
        }

        return conversationOpt.orElseGet(() -> {
            StudentConversationEntity newConversation = new StudentConversationEntity();
            newConversation.setPhone(phoneNumber);
            newConversation.setFullName(name != null ? name : phoneNumber);
            newConversation.setWazendInstance(wazendInstance != null ? wazendInstance : null);
            newConversation.setConversationType(conversationType);
            newConversation.setInstanceIdServer(instanceIdServer != null ? instanceIdServer : null);
            newConversation.setAnswered(false);
            newConversation.setCreatedAt(LocalDateTime.now());
            newConversation.setUpdatedAt(LocalDateTime.now());
            newConversation.setStudentTag(getStudentTagByPhone(phoneNumber, conversationType));
            return studentConversationRepository.save(newConversation);
        });
    }

    private StudentType getStudentTagByPhone(String phoneNumber, ConversationType conversationType) {
        Optional<MemberEntity> studentOpt = memberRepository.findFirstByTelefonoOrderByLastLoginDateDesc(phoneNumber);
        if (studentOpt.isPresent() && conversationType != ConversationType.WAZEND_GROUP) {
            MemberEntity student = studentOpt.get();
            if (student.getActiveTxnCount() != null && student.getActiveTxnCount() > 0) {
                return StudentType.ALUMNO;
            } else {
                return StudentType.EX_ALUMNO;
            }
        } else if (conversationType != ConversationType.WAZEND_GROUP) {
            return StudentType.LEAD;
        } else {
            return null;
        }
    }

    private LocalDateTime getMessageTime(Long messageTimestamp) {
        // Convertir el timestamp de segundos a LocalDateTime
        return messageTimestamp != null
                ? LocalDateTime.ofInstant(
                        new Date(messageTimestamp * 1000L).toInstant(),
                        ZoneId.systemDefault())
                : LocalDateTime.now();

    }

    /**
     * Método privado para manejar consultas con Specifications
     */
    private Page<StudentConversationEntity> getPaginatedConversationsWithSpecifications(
            Pageable pageable,
            Map<String, String> allFilters,
            String globalSearch,
            ConversationType conversationType,
            Set<String> filterStudentTypeByRole) {

        // Remover globalSearch de los filtros avanzados
        Map<String, String> advancedFiltersOnly = FilterUtils.removeGlobalSearchFilters(allFilters);

        // Crear la especificación
        Specification<StudentConversationEntity> specification = StudentConversationSpecifications.withFilters(
                advancedFiltersOnly, globalSearch, conversationType, filterStudentTypeByRole)
                .and(StudentConversationSpecifications.withFetchJoins());

        // Ejecutar la consulta con specifications
        return studentConversationRepository.findAllWithSpecification(specification, pageable);
    }

    // Método existente para compatibilidad hacia atrás (DEPRECATED pero mantenido)
    @Deprecated
    public Page<ConversationDTO> getPaginatedConversations(
            Pageable pageable,
            List<Role> roleNames,
            String search,
            ConversationType conversationType) throws UnauthorizedException {

        // Convertir a nuevo formato
        Map<String, String> filters = null;
        if (search != null && !search.trim().isEmpty()) {
            filters = Map.of("globalSearch", search);
        }

        return getPaginatedConversations(pageable, roleNames, filters, conversationType);
    }
}