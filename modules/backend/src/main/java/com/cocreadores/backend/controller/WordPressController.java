package com.cocreadores.backend.controller;

import com.cocreadores.backend.client.WebhookClient;
import com.cocreadores.backend.dto.wordpress.webhook.*;
import com.cocreadores.backend.service.wordpress.MemberWebhookService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/wordpress")
@Slf4j
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class WordPressController {

    @Autowired
    private MemberWebhookService memberWebhookService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WebhookClient webhookClient;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhookEvent(@RequestBody String payload) {
        try {
            log.info("Received webhook payload: {}", payload);

            if (payload == null || payload.trim().isEmpty()) {
                log.warn("Received empty or null payload");
                return ResponseEntity.badRequest().body("Empty payload received");
            }

            List<WebhookEventDTO> events = parseWebhookPayload(payload);

            if (events == null || events.isEmpty()) {
                log.warn("No valid events found in payload");
                return ResponseEntity.badRequest().body("Invalid payload structure - no events found");
            }

            for (WebhookEventDTO event : events) {
                try {
                    processWebhookEvent(event);
                } catch (Exception eventException) {
                    log.error("Error processing individual event: {}", event.getEvent(), eventException);
                    webhookClient.sendErrorToWebhook(
                            "WordPressController - Event Processing",
                            String.format("Error processing event %s: %s", event.getEvent(), eventException.getMessage()),
                            Arrays.toString(eventException.getStackTrace()),
                            payload
                    );
                }
            }

            return ResponseEntity.ok("Event processed successfully");
        } catch (Exception e) {
            log.error("Error processing webhook event", e);
            webhookClient.sendErrorToWebhook(
                    "WordPressController",
                    e.getMessage(),
                    Arrays.toString(e.getStackTrace()),
                    payload
            );
            return ResponseEntity.badRequest().body("Error processing webhook: " + e.getMessage());
        }
    }

    /**
     * Process a single webhook event with specific data extraction for each event type
     */
    private void processWebhookEvent(WebhookEventDTO event) throws Exception {
        if (event == null) {
            throw new IllegalArgumentException("Event is null");
        }

        String eventType = event.getEvent();
        String type = event.getType();
        Object data = event.getData();

        log.info("Processing webhook event: {}, type: {}", eventType, type);

        if (eventType == null || eventType.trim().isEmpty()) {
            throw new IllegalArgumentException("Event type is null or empty");
        }

        if (data == null) {
            throw new IllegalArgumentException("Event data is null");
        }

        try {
            switch (eventType) {
                case "member-added":
                    // Para member-added, el data contiene directamente toda la información del member
                    MemberAddedDTO memberAddedDTO = objectMapper.convertValue(data, MemberAddedDTO.class);
                    if (memberAddedDTO == null) {
                        throw new IllegalArgumentException("Failed to convert data to MemberAddedDTO");
                    }
                    memberWebhookService.processNewMember(memberAddedDTO);
                    break;

                case "subscription-created":
                case "subscription-upgraded":
                case "subscription-stopped":
                case "subscription-expired":
                    // Para eventos de subscription, extraemos los campos específicos de subscription
                    SubscriptionUpdateDTO subscriptionDTO = extractSubscriptionUpdateData(data);

                    switch (eventType) {
                        case "subscription-created":
                            memberWebhookService.processSubscriptionCreation(subscriptionDTO);
                            break;
                        case "subscription-upgraded":
                            memberWebhookService.processSubscriptionUpgrade(subscriptionDTO);
                            break;
                        case "subscription-stopped":
                            memberWebhookService.processSubscriptionStopped(subscriptionDTO);
                            break;
                        case "subscription-expired":
                            memberWebhookService.processSubscriptionExpired(subscriptionDTO);
                            break;
                    }
                    break;

                case "transaction-completed":
                    // Para transaction-completed, extraemos los campos específicos de transaction
                    TransactionDTO transactionDTO = extractTransactionData(data);
                    if (transactionDTO == null) {
                        throw new IllegalArgumentException("Failed to extract TransactionDTO");
                    }
                    memberWebhookService.processTransaction(transactionDTO);
                    break;

                case "member-account-updated":
                    // Para member-account-updated, el data contiene directamente la información del member
                    MemberAccountUpdatedDTO accountUpdatedDTO = objectMapper.convertValue(data, MemberAccountUpdatedDTO.class);
                    if (accountUpdatedDTO == null) {
                        throw new IllegalArgumentException("Failed to convert data to MemberAccountUpdatedDTO");
                    }
                    memberWebhookService.processMemberAccountUpdate(accountUpdatedDTO);
                    break;

                default:
                    log.warn("Unknown event type: {}", eventType);
                    break;
            }
        } catch (Exception e) {
            throw new Exception("Data conversion error for event " + eventType + ": " + e.getMessage(), e);
        }
    }

    /**
     * Extrae los datos de TransactionDTO del objeto complejo
     * Basado en la estructura real del JSON transaction-completed
     */
    private TransactionDTO extractTransactionData(Object data) throws Exception {
        try {
            JsonNode dataNode = objectMapper.valueToTree(data);
            TransactionDTO transactionDTO = new TransactionDTO();

            // Extraer campos directos de la transacción (que están en el nivel raíz del data)
            if (dataNode.has("id")) {
                transactionDTO.setId(dataNode.get("id").asText());
            }
            if (dataNode.has("trans_num")) {
                transactionDTO.setTransNum(dataNode.get("trans_num").asText());
            }
            if (dataNode.has("amount")) {
                transactionDTO.setAmount(dataNode.get("amount").asText());
            }
            if (dataNode.has("status")) {
                transactionDTO.setStatus(dataNode.get("status").asText());
            }
            if (dataNode.has("txn_type")) {
                transactionDTO.setTxnType(dataNode.get("txn_type").asText());
            }
            if (dataNode.has("created_at")) {
                transactionDTO.setCreatedAt(dataNode.get("created_at").asText());
            }
            if (dataNode.has("expires_at")) {
                transactionDTO.setExpiresAt(dataNode.get("expires_at").asText());
            }

            // Extraer objetos anidados si tu DTO los soporta
            if (dataNode.has("membership") && transactionDTO.getMembership() != null) {
                transactionDTO.setMembership(
                        objectMapper.convertValue(dataNode.get("membership"), transactionDTO.getMembership().getClass())
                );
            }

            if (dataNode.has("member")) {
                transactionDTO.setMember(
                        objectMapper.convertValue(dataNode.get("member"), MemberDTO.class)
                );
            }

            return transactionDTO;

        } catch (Exception e) {
            log.error("Error extracting transaction data: {}", e.getMessage());
            throw new Exception("Failed to extract transaction data", e);
        }
    }

    /**
     * Extrae los datos de SubscriptionUpdateDTO del objeto complejo
     * Basado en la estructura real del JSON subscription events
     */
    private SubscriptionUpdateDTO extractSubscriptionUpdateData(Object data) throws Exception {
        try {
            JsonNode dataNode = objectMapper.valueToTree(data);
            SubscriptionUpdateDTO subscriptionDTO = new SubscriptionUpdateDTO();

            // Extraer campos directos de la subscription (que están en el nivel raíz del data)
            if (dataNode.has("id")) {
                subscriptionDTO.setId(dataNode.get("id").asText());
            }
            if (dataNode.has("subscr_id")) {
                subscriptionDTO.setSubscrId(dataNode.get("subscr_id").asText());
            }
            if (dataNode.has("status")) {
                subscriptionDTO.setStatus(dataNode.get("status").asText());
            }
            if (dataNode.has("price")) {
                subscriptionDTO.setPrice(dataNode.get("price").asText());
            }
            if (dataNode.has("period")) {
                subscriptionDTO.setPeriod(dataNode.get("period").asText());
            }
            if (dataNode.has("period_type")) {
                subscriptionDTO.setPeriodType(dataNode.get("period_type").asText());
            }
            if (dataNode.has("trial")) {
                subscriptionDTO.setTrial(dataNode.get("trial").asText());
            }
            if (dataNode.has("trial_days")) {
                subscriptionDTO.setTrialDays(dataNode.get("trial_days").asText());
            }

            // Extraer objetos anidados
            if (dataNode.has("membership")) {
                MembershipDTO membershipDTO = objectMapper.convertValue(dataNode.get("membership"), MembershipDTO.class);
                subscriptionDTO.setMembership(membershipDTO);
            }

            if (dataNode.has("member")) {
                MemberDTO memberDTO = objectMapper.convertValue(dataNode.get("member"), MemberDTO.class);
                subscriptionDTO.setMember(memberDTO);
            }

            return subscriptionDTO;

        } catch (Exception e) {
            log.error("Error extracting subscription data: {}", e.getMessage());
            throw new Exception("Failed to extract subscription data", e);
        }
    }

    /**
     * Parse webhook payload - handles both single objects and arrays
     */
    private List<WebhookEventDTO> parseWebhookPayload(String payload) throws Exception {
        if (payload == null || payload.trim().isEmpty()) {
            throw new IllegalArgumentException("Payload is null or empty");
        }

        try {
            JsonNode rootNode = objectMapper.readTree(payload);

            if (rootNode == null) {
                throw new JsonProcessingException("Failed to parse JSON - root node is null") {};
            }

            if (rootNode.isArray()) {
                List<WebhookEventDTO> events = objectMapper.readValue(payload, new TypeReference<List<WebhookEventDTO>>() {});
                if (events == null) {
                    throw new JsonProcessingException("Failed to parse JSON array to WebhookEventDTO list") {};
                }
                return events;
            } else {
                WebhookEventDTO singleEvent = objectMapper.readValue(payload, WebhookEventDTO.class);
                if (singleEvent == null) {
                    throw new JsonProcessingException("Failed to parse JSON object to WebhookEventDTO") {};
                }
                List<WebhookEventDTO> events = new ArrayList<>();
                events.add(singleEvent);
                return events;
            }
        } catch (JsonProcessingException e) {
            throw new Exception("JSON parsing error: " + e.getMessage() + ". Payload: " + payload.substring(0, Math.min(payload.length(), 500)), e);
        } catch (Exception e) {
            throw new Exception("Unexpected error during payload parsing: " + e.getMessage(), e);
        }
    }
}