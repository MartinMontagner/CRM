package com.cocreadores.backend;

import com.cocreadores.backend.client.WebhookClient;
import com.cocreadores.backend.dto.chat.SuggestionRequestDTO;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.service.chat.AiSuggestionService;
import com.cocreadores.backend.service.chat.MessageLoggerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceTest.class);

    @Mock
    private MessageLoggerService messageLogger;

    @Mock
    private WebhookClient webhookClient;

    @InjectMocks
    private AiSuggestionService aiSuggestionService;

    @Test
    public void testGetAiSuggestion_Success() throws NotFoundException {
        String phoneNumber = "+123456789";
        String assistantName = "TestAssistant";
        String expectedResponse = "Test suggestion response";

        List<SuggestionRequestDTO> mockMessages = List.of(
                new SuggestionRequestDTO("2023-01-01T10:00:00", "Hola rabino", "STUDENT"),
                new SuggestionRequestDTO("2023-01-01T10:01:00", "Shalom shalom querido, en que puedo ayudarte hoy?", "BOT"),
                new SuggestionRequestDTO("2023-01-01T10:00:00", "Quiero seguir con la lectura", "STUDENT")
        );

        log.info("Configurando mocks para el test...");
        when(messageLogger.getMessagesByPhoneNumberSuggestion(phoneNumber))
                .thenReturn(mockMessages);
        log.debug("Mock configurado para messageLogger.getMessagesByPhoneNumberSuggestion({})", phoneNumber);

        when(webhookClient.getSuggestedMessage(mockMessages, assistantName, null))
                .thenReturn(expectedResponse);
        log.debug("Mock configurado para webhookClient.getSuggestedMessage() con {} mensajes", mockMessages.size());

        log.info("Ejecutando chatService.getAiSuggestion...");
        String actualResponse = aiSuggestionService.getAiSuggestion(phoneNumber, assistantName);
        log.debug("Respuesta obtenida: {}", actualResponse);

        log.info("Verificando resultados...");
        assertEquals(expectedResponse, actualResponse, "La respuesta no coincide con la esperada");
        log.debug("Assert equals pasado correctamente");

        verify(messageLogger).getMessagesByPhoneNumberSuggestion(phoneNumber);
        verify(webhookClient).getSuggestedMessage(mockMessages, assistantName, null);
        log.info("Verificaciones de interacción con los mocks completadas");

        log.info("Test completado exitosamente!");
    }
}