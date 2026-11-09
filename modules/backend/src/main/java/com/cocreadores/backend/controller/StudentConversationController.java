package com.cocreadores.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cocreadores.backend.service.student.StudentConversationService;

@RestController
@RequestMapping("/student-conversation")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class StudentConversationController {

    @Autowired
    private StudentConversationService studentConversationService;

    @PostMapping
    public ResponseEntity<Void> updateTags() {
        studentConversationService.assignTagsToConversations();
        return ResponseEntity.ok().build();
    }
    
}
