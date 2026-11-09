package com.cocreadores.backend.controller;

import com.cocreadores.backend.client.WebhookClient;
import com.cocreadores.backend.dto.user.UserDTO;
import com.cocreadores.backend.dto.user.UserResponseDTO;
import com.cocreadores.backend.dto.user.UserUpdateDTO;
import com.cocreadores.backend.dto.user.UserUpdateRoleDTO;
import com.cocreadores.backend.exception.*;
import com.cocreadores.backend.model.user.PasswordResetTokenEntity;
import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.user.Role.RoleDescription;
import com.cocreadores.backend.model.user.UserEntity;
import com.cocreadores.backend.service.logs.AuditLogService;
import com.cocreadores.backend.service.user.PasswordResetTokenEntityService;
import com.cocreadores.backend.service.user.UserEntityService;
import com.cocreadores.backend.utils.EmailUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.cocreadores.backend.model.log.AuditAction.ENABLE_USER;

@RestController
@RequestMapping("/user")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserEntityService userEntityService;
    private final AuditLogService auditLogService;
    private final String frontendUrl;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenEntityService passwordResetTokenEntityService;
    private final WebhookClient webhookClient;

    public UserController(UserEntityService userEntityService, AuditLogService auditLogService,
            @Value("${frontend.url}") String frontendUrl, PasswordEncoder passwordEncoder,
            PasswordResetTokenEntityService passwordResetTokenEntityService, WebhookClient webhookClient) {
        this.userEntityService = userEntityService;
        this.auditLogService = auditLogService;
        this.frontendUrl = frontendUrl;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenEntityService = passwordResetTokenEntityService;
        this.webhookClient = webhookClient;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<UserEntity>> getPendingUsers() {
        return ResponseEntity.ok(userEntityService.getUnapprovedUsers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/approved/today")
    public ResponseEntity<Map<String, Integer>> getCountAprovedUsersToday() {
        return ResponseEntity.ok(userEntityService.getCountAprovedUsersToday());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/enable")
    public ResponseEntity<String> enableUser(
            @PathVariable Long id,
            @RequestParam("role") Role role,
            HttpServletRequest request) {
        auditLogService.logAction(ENABLE_USER, "Usuario con ID: " + id + " activado con rol: " + role + ".", request);
        userEntityService.enableUser(id, role);
        return ResponseEntity.ok("Usuario habilitado correctamente con rol: " + role + ".");
    }
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<UserUpdateRoleDTO>> getAll() {
        //obtengo el id del usuario que hace la request
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(userEntityService.getAll(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO,
            HttpServletRequest request) throws NotFoundException, UnauthorizedException {
        auditLogService.logAction(ENABLE_USER, "Usuario con ID: " + id + " actualizado a rol: " + userUpdateDTO.role() + ".", request);
        return ResponseEntity.ok(userEntityService.updateUserRole(id, userUpdateDTO));
    }
    @GetMapping
    public ResponseEntity<UserDTO> getUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            long userId = Long.parseLong(authentication.getName());
            UserDTO userDTO = userEntityService.getUserDto(userId);

            return ResponseEntity.ok(userDTO);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    public record SetPasswordRequest(String currentPassword, String newPassword) {
    }

    @PutMapping("/password")
    public ResponseEntity<Void> setPassword(@RequestHeader(required = false) long userId,
            @RequestBody SetPasswordRequest body) throws NotFoundException, InvalidRequestException {
        UserEntity user = userEntityService.findById(userId);
        if (!passwordEncoder.matches(body.currentPassword(), user.getPassword())) {
            throw new InvalidRequestException("WRONG_CURRENT_PASSWORD");
        }
        // TODO validate new password
        user.setPassword(passwordEncoder.encode(body.newPassword()));
        userEntityService.saveOrUpdate(user);
        return ResponseEntity.ok().build();
    }

    public record RecoverPasswordRequest(String email) {
    }

    @PostMapping("/recover-password")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> recoverPassword(@RequestBody RecoverPasswordRequest body) {
        try {
            UserEntity user = userEntityService.findByEmail(body.email()).orElseThrow();
            PasswordResetTokenEntity token = passwordResetTokenEntityService.createPasswordResetToken(user);
            webhookClient.sendEmail(user.getEmail(),
                    "Recupera tu contraseña del panel de CoCreadores",
                    EmailUtils.generatePasswordRecoveryEmail(frontendUrl, token.getToken()));
        } catch (Exception e) {
            // ignore;
        }
        return ResponseEntity.ok().build();
    }

    public record ResetPasswordRequest(String newPassword, String passwordResetCode) {
    }

    @PutMapping("/reset-password")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest body) throws AuthenticationException {
        PasswordResetTokenEntity token = passwordResetTokenEntityService.findByToken(body.passwordResetCode)
                .orElseThrow(() -> new AuthenticationException("INVALID_TOKEN"));
        if (token.isExpired()) {
            throw new AuthenticationException("EXPIRED_TOKEN");
        }
        token.getUser().setPassword(passwordEncoder.encode(body.newPassword()));
        userEntityService.saveOrUpdate(token.getUser());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleDescription>> getRoles()
            throws AuthenticationException, UnexpectedException {
        return ResponseEntity.ok(userEntityService.getRoles());
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleUserStatus(
            @PathVariable Long id,
            HttpServletRequest request) throws NotFoundException {

        UserEntity user = userEntityService.findById(id);
        String action = user.isDisabled() ? "habilitado" : "deshabilitado";

        auditLogService.logAction(ENABLE_USER, "Usuario con ID: " + id + " " + action + ".", request);
        userEntityService.toggleUserStatus(id);

        return ResponseEntity.ok("Usuario " + action + " correctamente.");
    }
}
