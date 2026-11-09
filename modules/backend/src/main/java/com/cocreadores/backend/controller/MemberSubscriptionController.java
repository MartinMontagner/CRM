package com.cocreadores.backend.controller;

import com.cocreadores.backend.dto.wordpress.ContactInfoDTO;
import com.cocreadores.backend.dto.wordpress.MemberSubscriptionViewDTO;
import com.cocreadores.backend.dto.wordpress.UpdateContactInfoDTO;
import com.cocreadores.backend.service.wordpress.MemberSubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/member-subscriptions")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class MemberSubscriptionController {

    @Autowired
    private MemberSubscriptionService memberSubscriptionService;

    /**
     * Obtiene una página de suscripciones de miembros
     * El ordenamiento se maneja mediante el objeto Pageable
     */
    @GetMapping
    public ResponseEntity<Page<MemberSubscriptionViewDTO>> getMemberSubscriptions(
            @PageableDefault(size = 20) Pageable pageable) {
        // Simplemente delegar al servicio
        Page<MemberSubscriptionViewDTO> result = memberSubscriptionService.getFilteredMemberSubscriptions(
                Map.of(), // Sin filtros
                pageable
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Obtiene una página de suscripciones de miembros filtradas
     * El ordenamiento se maneja mediante el objeto Pageable
     * Ahora soporta operadores de filtrado a través de parámetros _operator
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<MemberSubscriptionViewDTO>> getFilteredMemberSubscriptions(
            @RequestParam MultiValueMap<String, String> allParams,
            @PageableDefault(size = 100) Pageable pageable) {

        // Procesar los parámetros para manejar múltiples valores
        Map<String, List<String>> filters = processMultipleFilters(allParams);

        Page<MemberSubscriptionViewDTO> result = memberSubscriptionService.getFilteredWithSpecifications(
                filters,
                pageable);

        return ResponseEntity.ok(result);
    }

    /**
     * Procesa los parámetros de filtrado permitiendo múltiples valores para la
     * misma clave
     * Por ejemplo: firstName=wer&firstName=mark se convierte en firstName=[wer,
     * mark]
     */
    private Map<String, List<String>> processMultipleFilters(MultiValueMap<String, String> allParams) {
        Map<String, List<String>> processedFilters = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : allParams.entrySet()) {
            String key = entry.getKey();
            List<String> values = entry.getValue();

            // Excluir parámetros de paginación y sorting
            if (!key.equals("page") && !key.equals("size") && !key.equals("sort") &&
                    !key.endsWith("_operator")) {

                // Filtrar valores vacíos o nulos
                List<String> cleanValues = values.stream()
                        .filter(value -> value != null && !value.trim().isEmpty())
                        .collect(Collectors.toList());

                if (!cleanValues.isEmpty()) {
                    processedFilters.put(key, cleanValues);
                }
            }
        }

        // Procesar operadores si los hay
        processFilterOperators(allParams, processedFilters);

        return processedFilters;
    }

    /**
     * Procesa los operadores de filtrado
     */
    private void processFilterOperators(MultiValueMap<String, String> allParams,
            Map<String, List<String>> processedFilters) {
        allParams.entrySet().stream()
                .filter(entry -> entry.getKey().endsWith("_operator"))
                .forEach(entry -> {
                    String fieldName = entry.getKey().substring(0, entry.getKey().length() - 9);
                    if (processedFilters.containsKey(fieldName)) {
                        // Tomar el primer operador si hay múltiples
                        String operator = entry.getValue().get(0);
                        processedFilters.put(fieldName + "__op", List.of(operator));
                    }
                });
    }

    /**
     * Obtiene los detalles de un miembro por su email
     */
    @GetMapping("/{email}")
    public ResponseEntity<MemberSubscriptionViewDTO> getMemberByEmail(@PathVariable String email) {
        List<MemberSubscriptionViewDTO> allData = memberSubscriptionService.getCombinedMemberSubscriptionData();

        return allData.stream()
                .filter(member -> member.getEmail().equals(email))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/get-info/{telefono}/{conversationId}")
    public ResponseEntity<ContactInfoDTO> getMemberByTelefono(
            @PathVariable String telefono,
            @PathVariable Long conversationId
        ) {
        ContactInfoDTO contactInfo = memberSubscriptionService.getMemberByConversationByPhone(telefono, conversationId);
        return ResponseEntity.ok(contactInfo);
    }

    @PutMapping("/contact-info/{conversationId}")
    public ResponseEntity<ContactInfoDTO> updateContactInfo(
            @PathVariable Long conversationId,
            @RequestBody UpdateContactInfoDTO updateContactInfoDTO) {
        try {
            ContactInfoDTO updatedInfo = memberSubscriptionService.updateMemberContactInfoByConversationId(
                    conversationId, updateContactInfoDTO);
            return ResponseEntity.ok(updatedInfo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}