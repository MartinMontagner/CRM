package com.cocreadores.backend.controller;

import com.cocreadores.backend.service.chat.ChatService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/webhook")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class WhatsappController {

    @Value("${whatsapp.secret}")
    private String verificationToken;

    private final ChatService chatService;

    public WhatsappController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody String payload) {
        CompletableFuture.runAsync(() -> {
            try {
                System.out.println("Raw request: " + payload);
                chatService.processWhatsappWebhook(payload);
            } catch (Exception e) {
                System.err.println("Error procesando el webhook: " + e.getMessage());
                e.printStackTrace();
            }
        });
        return ResponseEntity.ok("EVENT_RECEIVED");
    }


    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && verificationToken.equals(token)) {
            return ResponseEntity.ok(challenge);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
