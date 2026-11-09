package com.cocreadores.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.cocreadores.backend.dto.sync.SyncResultDTO;
import com.cocreadores.backend.service.sync.SyncService;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/sync")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class SyncController {
    
    @Autowired
    private SyncService syncService;
    
    @PostMapping("/chats-conversations")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<SyncResultDTO> syncChatConversations() {
        return ResponseEntity.ok(syncService.syncDateStudentConversations());
    }

}
