package com.cocreadores.backend.controller;

import com.cocreadores.backend.dto.logs.AuditLogDTO;
import com.cocreadores.backend.service.logs.AuditLogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/logs")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {
    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AuditLogDTO> getAuditLogs() {
        return auditLogService.getAllAuditLogs();
    }
}
