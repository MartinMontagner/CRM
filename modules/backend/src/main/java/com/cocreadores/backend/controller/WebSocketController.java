package com.cocreadores.backend.controller;

import com.cocreadores.backend.dto.chat.SendMessageRequestDTO;
import com.cocreadores.backend.service.whatsapp.WhatsappService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@Controller
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class WebSocketController {

    private final WhatsappService whatsappService;

    public WebSocketController(WhatsappService whatsappService) {
        this.whatsappService = whatsappService;
    }

    /**
     * Endpoint para enviar mensajes a través de WebSocket
     * Los clientes enviarán a /app/send-message y el mensaje se procesará
     */
    @MessageMapping("/send-message")
    public void sendMessage(@Payload SendMessageRequestDTO message) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        long userId = Long.parseLong(authentication.getName());
        whatsappService.sendMessage(message, userId);
    }
}