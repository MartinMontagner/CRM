package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.log.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

}
