package com.cocreadores.backend.controller;

import com.cocreadores.backend.service.chat.WazendChatService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/webhook/wazend")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class WazendController {

    private final WazendChatService wazendChatService;
    private static final Logger logger = LoggerFactory.getLogger(WazendController.class);

    public WazendController(WazendChatService wazendChatService) {
        this.wazendChatService = wazendChatService;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody String payload) {
        CompletableFuture.runAsync(() -> {
            try {
                if (payload == null || payload.isEmpty()) {
                    logger.warn("Payload de Wazend vacío o nulo");
                    return;
                }
                if (payload.contains("encReactionMessage")) {
                    logger.warn("Payload de Wazend contiene 'encReactionMessage', ignorando");
                    return;
                }
                logger.info("Mensaje entrante Wazend RAW: {}", payload);
                wazendChatService.processWazendWebhook(payload);
            } catch (Exception e) {
                logger.error("Error procesando el webhook de Wazend: {}", e.getMessage());
                e.printStackTrace();
            }
        });
        return ResponseEntity.ok("EVENT_RECEIVED");
    }
}