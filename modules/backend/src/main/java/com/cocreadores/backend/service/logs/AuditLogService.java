package com.cocreadores.backend.service.logs;

import com.cocreadores.backend.dto.logs.AuditLogDTO;
import com.cocreadores.backend.model.log.AuditAction;
import com.cocreadores.backend.model.log.AuditLog;
import com.cocreadores.backend.model.user.UserEntity;
import com.cocreadores.backend.repository.AuditLogRepository;
import com.cocreadores.backend.repository.UserRepository;
import com.cocreadores.backend.service.auth.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, JwtService jwtService, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Guarda un log de auditoría
     */
    public void logAction(AuditAction action, String description, HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        Long userId = jwtService.getUserIdFromAccessToken(token).orElse(null);

        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDescription(description);
        log.setIpAddress(getClientIp(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        log.setCreatedAt(LocalDateTime.now());

        auditLogRepository.save(log);
    }

    /**
     * Recupera los últimos N logs de un usuario
     */
    public List<AuditLog> getUserLogs(Long userId, int limit) {
        List<AuditLog> logs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return logs.stream().limit(limit).toList();
    }

    /**
     * Recupera todos los logs (para panel de auditoría)
     */
    public List<AuditLogDTO> getAllAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAll();
        return logs.stream().map(log -> {
            UserEntity user = userRepository.findById(log.getUserId()).orElse(null);
            String userName = (user != null) ? user.getName() : "Desconocido";
            return new AuditLogDTO(
                    log.getId(),
                    userName,
                    log.getAction(),
                    log.getDescription(),
                    log.getIpAddress(),
                    log.getUserAgent(),
                    log.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    public String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
