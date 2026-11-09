package com.cocreadores.backend;

import com.cocreadores.backend.client.WebhookClient;
import com.cocreadores.backend.dto.chat.SuggestionRequestDTO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class WebhookClientIntegrationTest {

    @Test
    void testRealWebhook_getSuggestedMessage() {
        // 🔐 Usa tu secret real aquí (si estás seguro y no lo vas a compartir públicamente)
        String realSecret = "dF8ncX7SeV60DzEh6ygsDdBc56W4GO8W";
        boolean usageEventsEnabled = true; // No afecta a esta prueba

        WebhookClient webhookClient = new WebhookClient(realSecret, usageEventsEnabled);

        List<SuggestionRequestDTO> messages = List.of(
                new SuggestionRequestDTO("2025-04-08T10:00:00", "Hola, ¿qué me recomiendas hacer hoy?", "STUDENT"),
                new SuggestionRequestDTO("2025-04-08T10:01:00", "¿Prefieres algo tranquilo o activo?", "BOT")
        );

        String assistantName = "sugerencia";

        String result = webhookClient.getSuggestedMessage(messages, assistantName, null);

        assertNotNull(result);
        System.out.println("Sugerencia recibida: " + result);
    }
}
