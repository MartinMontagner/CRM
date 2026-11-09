package com.cocreadores.backend.dto.logs;

import com.cocreadores.backend.model.log.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String userName;
    private AuditAction action;
    private String description;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
