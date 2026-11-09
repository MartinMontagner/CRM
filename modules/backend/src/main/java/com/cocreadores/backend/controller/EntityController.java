package com.cocreadores.backend.controller;

import com.cocreadores.backend.dto.update.*;
import com.cocreadores.backend.service.wordpress.MemberEntityService;
import com.cocreadores.backend.service.wordpress.SubscriptionEntityService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/entities")
@RequiredArgsConstructor
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class EntityController {

    private final MemberEntityService memberEntityService;
    private final SubscriptionEntityService subscriptionEntityService;

    @Value("${make.api.secret}")
    private String expectedAuthToken;

    @PutMapping("/members")
    public ResponseEntity<MemberUpdateResponseDto> updateOrCreateMembersByCsvId(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody MemberUpdateRequestDto request) {

        // Validar token de autorización
        if (!isValidAuthToken(authorizationHeader)) {
            MemberUpdateResponseDto errorResponse = new MemberUpdateResponseDto();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Token de autorización inválido");
            errorResponse.setUpdatedCount(0);
            errorResponse.setCreatedCount(0);
            errorResponse.setTotalReceived(0);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        MemberUpdateResponseDto response = new MemberUpdateResponseDto();

        try {
            EntityUpdateResult result = memberEntityService.updateOrCreateMembersByCsvId(request.getMembers());

            response.setSuccess(true);
            response.setMessage("Miembros procesados correctamente");
            response.setUpdatedCount(result.getUpdatedCount());
            response.setCreatedCount(result.getCreatedCount());
            response.setTotalReceived(request.getMembers().size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error al procesar miembros: " + e.getMessage());
            response.setUpdatedCount(0);
            response.setCreatedCount(0);
            response.setTotalReceived(request.getMembers().size());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/subscriptions")
    public ResponseEntity<SubscriptionUpdateResponseDto> updateOrCreateSubscriptionsByCsvId(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody SubscriptionUpdateRequestDto request) {

        // Validar token de autorización
        if (!isValidAuthToken(authorizationHeader)) {
            SubscriptionUpdateResponseDto errorResponse = new SubscriptionUpdateResponseDto();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Token de autorización inválido");
            errorResponse.setUpdatedCount(0);
            errorResponse.setCreatedCount(0);
            errorResponse.setTotalReceived(0);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        SubscriptionUpdateResponseDto response = new SubscriptionUpdateResponseDto();

        try {
            EntityUpdateResult result = subscriptionEntityService.updateOrCreateSubscriptionsByCsvId(request.getSubscriptions());

            response.setSuccess(true);
            response.setMessage("Suscripciones procesadas correctamente");
            response.setUpdatedCount(result.getUpdatedCount());
            response.setCreatedCount(result.getCreatedCount());
            response.setTotalReceived(request.getSubscriptions().size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error al procesar suscripciones: " + e.getMessage());
            response.setUpdatedCount(0);
            response.setCreatedCount(0);
            response.setTotalReceived(request.getSubscriptions().size());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private boolean isValidAuthToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.trim().isEmpty()) {
            return false;
        }

        // Soporta tanto "Bearer token" como solo "token"
        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring(7)
                : authorizationHeader;

        return expectedAuthToken.equals(token);
    }
}