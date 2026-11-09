package com.cocreadores.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.cocreadores.backend.dto.chat.SendMessageRequestDTO;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.service.logs.AuditLogService;
import com.cocreadores.backend.service.wazend.WazendService;

import jakarta.servlet.http.HttpServletRequest;
import static com.cocreadores.backend.model.log.AuditAction.SEND_MESSAGE;

@Controller
@RequestMapping("wazend/chats")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class ChatWazendController {

    private final AuditLogService auditLogService;
    private final WazendService wazendService;

    public ChatWazendController(AuditLogService auditLogService, WazendService wazendService) {
        this.auditLogService = auditLogService;
        this.wazendService = wazendService;
    }

    @PostMapping("/send/{wazendInstanceId}")
    public ResponseEntity<Void> sendMessage(@RequestBody SendMessageRequestDTO message,
            @PathVariable Long wazendInstanceId, HttpServletRequest request) throws NotFoundException {
        auditLogService.logAction(SEND_MESSAGE, "Envio de mensaje a: ." + message.getPhoneNumber(), request);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long userId = Long.parseLong(authentication.getName());

        wazendService.sendMessage(message, wazendInstanceId , userId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/send/{groupId}/{wazendInstanceId}")
    public ResponseEntity<Void> sendMessage(@RequestBody SendMessageRequestDTO message,
            @PathVariable Long groupId, @PathVariable Long wazendInstanceId, HttpServletRequest request) throws NotFoundException {
        auditLogService.logAction(SEND_MESSAGE, "Envio de mensaje a: ." + message.getPhoneNumber(), request);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long userId = Long.parseLong(authentication.getName());

        wazendService.sendMessageGroup(message, wazendInstanceId , userId, groupId);
        return ResponseEntity.ok().build();
    }
}