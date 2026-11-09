package com.cocreadores.backend.controller;

import com.cocreadores.backend.dto.assistant.AssistantDTO;
import com.cocreadores.backend.dto.chat.ChatMessageDTO;
import com.cocreadores.backend.dto.chat.ConversationDTO;
import com.cocreadores.backend.dto.chat.GroupMessageDTO;
import com.cocreadores.backend.dto.chat.SendBulkMessagesRequestDTO;
import com.cocreadores.backend.dto.chat.SendMessageRequestDTO;
import com.cocreadores.backend.dto.whatsapp.BulkTemplateRequestDTO;
import com.cocreadores.backend.dto.whatsapp.BulkTemplateResponseDTO;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.exception.UnauthorizedException;
import com.cocreadores.backend.service.assistant.AssistantService;
import com.cocreadores.backend.service.chat.AiSuggestionService;
import com.cocreadores.backend.service.chat.MessageLoggerService;
import com.cocreadores.backend.service.logs.AuditLogService;
import com.cocreadores.backend.service.student.StudentConversationService;
import com.cocreadores.backend.service.user.UserEntityService;
import com.cocreadores.backend.service.whatsapp.WhatsappService;
import com.cocreadores.backend.utils.SecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.user.Role;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.cocreadores.backend.model.log.AuditAction.SEND_MESSAGE;
import static com.cocreadores.backend.model.log.AuditAction.SEND_MESSAGE_BULK;

@RestController
@RequestMapping(value = "/chats", produces = "application/json")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    @Autowired
    private MessageLoggerService messageLoggerService;

    private final WhatsappService whatsappService;

    private final AuditLogService auditLogService;

    private final StudentConversationService studentConversationService;

    private final UserEntityService userEntityService;

    private final AssistantService assistantService;

    private final AiSuggestionService aiSuggestionService;

    @Autowired
    private SecurityUtils securityUtils;

    public ChatController(MessageLoggerService messageLoggerService, WhatsappService whatsappService,
            AuditLogService auditLogService, StudentConversationService studentConversationService,
            UserEntityService userEntityService, AssistantService assistantService,
            AiSuggestionService aiSuggestionService) {
        this.messageLoggerService = messageLoggerService;
        this.whatsappService = whatsappService;
        this.auditLogService = auditLogService;
        this.studentConversationService = studentConversationService;
        this.userEntityService = userEntityService;
        this.assistantService = assistantService;
        this.aiSuggestionService = aiSuggestionService;
    }

    @GetMapping("/conversations/paged")
    public ResponseEntity<Page<ConversationDTO>> getPaginatedConversations(
            @RequestParam(required = false) Map<String, String> filters,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortField,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String globalSearch,
            Authentication authentication) throws UnauthorizedException {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        Pageable pageable = PageRequest.of(page, size, sort);

        ConversationType conversationType = null;
        if (platform != null) {
            try {
                conversationType = ConversationType.valueOf(platform.toUpperCase());
            } catch (IllegalArgumentException e) {
                conversationType = null;
            }
        }
        //obtengo el rol del usuario actual
        List<Role> roleNames = securityUtils.getCurrentUserRole();

        System.out.println("*****************************************");
        System.out.println(roleNames.get(0));

        // Agregar globalSearch a los filtros si existe
        Map<String, String> allFilters = filters != null ? new HashMap<>(filters) : new HashMap<>();
        if (globalSearch != null && !globalSearch.trim().isEmpty()) {
            allFilters.put("globalSearch", globalSearch);
        }

        Page<ConversationDTO> conversations = messageLoggerService.getPaginatedConversations(
                pageable, roleNames, allFilters, conversationType);

        return ResponseEntity.ok(conversations);
    }

    @DeleteMapping("/conversation/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id, HttpServletRequest request) {
        try {
            messageLoggerService.deleteConversation(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(@RequestBody SendMessageRequestDTO message, HttpServletRequest request) {
        auditLogService.logAction(SEND_MESSAGE, "Envio de mensaje a: ." + message.getPhoneNumber(), request);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long userId = Long.parseLong(authentication.getName());

        whatsappService.sendMessage(message, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<Void> sendBulkMessages(
            @RequestBody SendBulkMessagesRequestDTO messages, HttpServletRequest request) {
        auditLogService.logAction(
                SEND_MESSAGE_BULK,
                "Envío de " + messages.getPhoneNumbers().size() + " mensajes masivos.",
                request);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long userId = Long.parseLong(authentication.getName());
        whatsappService.sendBulkMessages(messages, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates() {
        Map<String, Object> templates = whatsappService.getTemplates();
        return ResponseEntity.ok(templates);
    }

    @PostMapping("/send-bulk-template")
    public ResponseEntity<BulkTemplateResponseDTO> sendBulkTemplateMessages(
            @RequestBody BulkTemplateRequestDTO request,
            HttpServletRequest httpRequest) {

        auditLogService.logAction(
                SEND_MESSAGE_BULK,
                "Envío de " + request.getPhoneNumbers().size() + " destinatarios (template). Idioma: "
                        + request.getLanguage(),
                httpRequest);

        // Envío normal de los templates
        BulkTemplateResponseDTO result = whatsappService.sendBulkTemplateMessages(
                request.getTemplate(),
                request.getParams(),
                request.getPhoneNumbers(),
                request.getLanguage(),
                request.getParamNames(),
                request.getParamTypes(),
                request.getParameterFormat());

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/conversation/{id}/tag")
    public ResponseEntity<Void> updateConversationTag(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) throws NotFoundException {

        String tag = request.get("tag");
        studentConversationService.updateConversationTag(id, tag);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/conversation/{conversationId}/name")
    public ResponseEntity<Void> updateConversationName(
            @PathVariable Long conversationId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) throws NotFoundException {

        String name = request.get("workerName");
        studentConversationService.updateConversationName(conversationId, name);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/conversation/{conversationId}/mark-as-read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            HttpServletRequest httpRequest) throws NotFoundException {

        studentConversationService.markConversationAsRead(conversationId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/messages/{phoneNumber}/suggestion/{assistantName}")
    public ResponseEntity<Map<String, String>> getAiSuggestion(
            @PathVariable String phoneNumber,
            @PathVariable String assistantName,
            HttpServletRequest httpRequest) throws NotFoundException {

        String suggestion = aiSuggestionService.getAiSuggestion(phoneNumber, assistantName);
        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }

    @GetMapping("/messages/{id}/paged")
    public ResponseEntity<Page<ChatMessageDTO>> getPaginatedMessages(
            @PathVariable Long id,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sent_at") String sortField,
            @RequestParam(defaultValue = "DESC") String sortDirection) throws UnauthorizedException, NotFoundException {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        Pageable pageable = PageRequest.of(page, size, sort);

        List<Role> roleNames = securityUtils.getCurrentUserRole();

        Page<ChatMessageDTO> messages = messageLoggerService.getPaginatedMessagesByIdMessage(id, search, pageable,
                roleNames);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages/{phoneNumber}/suggestion/{assistantName}")
    public ResponseEntity<Map<String, String>> getAiSuggestionWithContent(
            @PathVariable String phoneNumber,
            @PathVariable String assistantName,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest httpRequest) throws NotFoundException {

        String content = requestBody.get("content");

        // Llamar al servicio pasando el contenido
        String suggestion = aiSuggestionService.getAiSuggestion(phoneNumber, assistantName, content);

        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }

    @PatchMapping("/conversation/{conversationId}/associate-member/{memberId}")
    public ResponseEntity<Void> associateMemberToConversation(
            @PathVariable Long conversationId,
            @PathVariable Long memberId,
            HttpServletRequest httpRequest) throws NotFoundException {
        studentConversationService.associateMemberToConversation(
                conversationId, memberId);

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/conversation/{conversationID}/interest-tag")
    public ResponseEntity<Void> updateConversationInterestTag(
            @PathVariable Long conversationID,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) throws NotFoundException {

        String tag = request.get("interestTag");
        studentConversationService.updateConversationInterestTag(conversationID, tag);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversation/{conversationID}/interest-tag")
    public ResponseEntity<Void> removeConversationInterestTag(
            @PathVariable Long conversationID,
            HttpServletRequest httpRequest) throws NotFoundException {
        studentConversationService.removeConversationInterestTag(conversationID);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/assistants")
    public ResponseEntity<List<AssistantDTO>> getAllAssistants() {
        List<AssistantDTO> assistants = assistantService.getAllAssistants();
        return ResponseEntity.ok(assistants);
    }

    @PostMapping("/messages/{phoneNumber}/feedback/{assistantName}")
    public ResponseEntity<Map<String, String>> sendAssistantFeedback(
            @PathVariable String phoneNumber,
            @PathVariable String assistantName,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest httpRequest) throws NotFoundException {

        String feedback = requestBody.get("feedback");
        String suggestion = requestBody.get("suggestion");
        String like = requestBody.get("like");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        long userId = Long.parseLong(authentication.getName());

        String userName = userEntityService.getUserName(userId);
        // Llamar al servicio para procesar el feedback
        aiSuggestionService.sendAssistantFeedback(phoneNumber, userName, assistantName, feedback, suggestion, like);

        return ResponseEntity.ok(Map.of("status", "Feedback enviado correctamente"));
    }

    // Endpoint para obtener mensajes de un chat grupal
    @GetMapping("/group/{groupId}/paged")
    public ResponseEntity<Page<GroupMessageDTO>> getGroupMessages(
            @PathVariable Long groupId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws NotFoundException, UnauthorizedException {

        Sort sort = Sort.by(Sort.Direction.ASC, "sentAt"); // Más antiguo primero
        Pageable pageable = PageRequest.of(page, size, sort);

        List<Role> roleNames = securityUtils.getCurrentUserRole();

        Page<GroupMessageDTO> messages = messageLoggerService.getGroupMessagesByWazendId(groupId, search, pageable,
                roleNames);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/get/{conversationId}")
    public ResponseEntity<ConversationDTO> getMethodName(@PathVariable Long conversationId)
            throws NotFoundException, UnauthorizedException {
        // Obtener el rol del usuario
        List<Role> roleNames = securityUtils.getCurrentUserRole();

        ConversationDTO conversation = messageLoggerService.getConversationById(conversationId, roleNames);

        return ResponseEntity.ok(conversation);
    }

}
