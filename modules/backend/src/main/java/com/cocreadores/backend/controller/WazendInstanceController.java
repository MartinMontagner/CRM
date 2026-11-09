package com.cocreadores.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.cocreadores.backend.dto.wazend.WazendInstaceResponseDTO;
import com.cocreadores.backend.dto.wazend.WazendInstaceUpdateDTO;
import com.cocreadores.backend.dto.wazend.WazendInstanceCreateDto;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.service.logs.AuditLogService;
import com.cocreadores.backend.service.wazend.WazendInstanceServiceImp;
import com.cocreadores.backend.utils.SecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import static com.cocreadores.backend.model.log.AuditAction.CREATE;
import static com.cocreadores.backend.model.log.AuditAction.DELETE;
import static com.cocreadores.backend.model.log.AuditAction.UPDATE;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
@RequestMapping("/wazend")
public class WazendInstanceController {

    private final WazendInstanceServiceImp wazendInstanceService;
    private final AuditLogService auditLogService;

    @Autowired
    private SecurityUtils securityUtils;

    public WazendInstanceController(WazendInstanceServiceImp wazendInstanceService, AuditLogService auditLogService) {
        this.wazendInstanceService = wazendInstanceService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/create")
    @ResponseBody
    public ResponseEntity<WazendInstaceResponseDTO> postMethodName(
            @Valid @RequestBody WazendInstanceCreateDto wazendInstanceCreateDto, HttpServletRequest request) {
        WazendInstaceResponseDTO entity = wazendInstanceService.create(wazendInstanceCreateDto);
        auditLogService.logAction(CREATE, "Instancia de Wazend con ID: " + entity.id(), request);
        return ResponseEntity.status(HttpStatus.OK).body(entity);

    }

    @GetMapping("/find/{wazendInstanceId}")
    @ResponseBody
    public ResponseEntity<WazendInstaceResponseDTO> getById(@PathVariable Long wazendInstanceId)
            throws NotFoundException {
        WazendInstaceResponseDTO entity = wazendInstanceService.getInstance(wazendInstanceId);

        return ResponseEntity.status(HttpStatus.OK).body(entity);
    }

    @GetMapping("/find/all")
    @ResponseBody
    public ResponseEntity<List<WazendInstaceResponseDTO>> getAll() {
        List<Role> roleNames = securityUtils.getCurrentUserRole();
        List<WazendInstaceResponseDTO> entity = wazendInstanceService.getInstances(roleNames);

        return ResponseEntity.status(HttpStatus.OK).body(entity);
    }

    @GetMapping("/find/all/roles")
    @ResponseBody
    public ResponseEntity<List<WazendInstaceResponseDTO>> getAllRoles() {
        List<Role> roleNames = securityUtils.getCurrentUserRole();
        List<WazendInstaceResponseDTO> entity = wazendInstanceService.getInstances(roleNames);

        return ResponseEntity.status(HttpStatus.OK).body(entity);
    }

    @DeleteMapping("/delete/{wazendInstanceId}")
    public ResponseEntity<Void> delete(@PathVariable Long wazendInstanceId, HttpServletRequest request)
            throws NotFoundException {
        wazendInstanceService.delete(wazendInstanceId);
        auditLogService.logAction(DELETE, "Instancia de Wazend con ID: " + wazendInstanceId, request);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @ResponseBody
    @PutMapping("/update/{wazendInstanceId}")
    public ResponseEntity<Void> update(@PathVariable Long wazendInstanceId,
            @Valid @RequestBody WazendInstaceUpdateDTO wazendInstance, HttpServletRequest request)
            throws NotFoundException {
        wazendInstanceService.update(wazendInstanceId, wazendInstance);
        auditLogService.logAction(UPDATE, "Instancia de Wazend con ID: " + wazendInstanceId, request);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}