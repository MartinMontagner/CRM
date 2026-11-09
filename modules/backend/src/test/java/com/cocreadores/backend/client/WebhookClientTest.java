package com.cocreadores.backend.client;

import com.cocreadores.backend.dto.chat.SuggestionRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookClientTest {

    @Mock
    private Environment environment;

    @Mock
    private HttpClient httpClient;

    @Mock
    private HttpResponse<String> httpResponse;

    @InjectMocks
    private WebhookClient webhookClient;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Configurar el token real desde las propiedades
        when(environment.getProperty("webhook.api.secret")).thenReturn("tu_token_real_aqui");
        when(environment.getProperty("usage.events.enabled", Boolean.class, false)).thenReturn(false);

        // Inyectar dependencias manualmente ya que no podemos usar @Value en tests fácilmente
        ReflectionTestUtils.setField(webhookClient, "securityApiSecret", "tu_token_real_aqui");
        ReflectionTestUtils.setField(webhookClient, "shouldSendUsageEvents", false);
        ReflectionTestUtils.setField(webhookClient, "httpClient", httpClient);
        ReflectionTestUtils.setField(webhookClient, "mapper", mapper);
    }

    @Test
    void getSuggestedMessage_Success() throws Exception {
        // Arrange
        List<SuggestionRequestDTO> messages = List.of(
                new SuggestionRequestDTO("2023-01-01", "Hola", "USER"),
                new SuggestionRequestDTO("2023-01-01", "¿Cómo estás?", "BOT")
        );
        String assistantName = "AsistentePrueba";
        String expectedResponse = "Respuesta sugerida";


        // Act
        String result = webhookClient.getSuggestedMessage(messages, assistantName, null);

        // Assert
        assertEquals(expectedResponse, result);
        verify(httpClient, times(1)).send(any(), any());
    }

    @Test
    void getSuggestedMessage_Failure() throws Exception {
        // Arrange
        List<SuggestionRequestDTO> messages = List.of(
                new SuggestionRequestDTO("2023-01-01", "Mensaje de error", "USER")
        );
        String assistantName = "AsistentePrueba";

        // Act
        String result = webhookClient.getSuggestedMessage(messages, assistantName, null);

        // Assert
        assertNull(result);
        verify(httpClient, times(1)).send(any(), any());
    }

    @Test
    void getSuggestedMessage_Exception() throws Exception {
        // Arrange
        List<SuggestionRequestDTO> messages = List.of(
                new SuggestionRequestDTO("2023-01-01", "Mensaje con excepción", "USER")
        );
        String assistantName = "AsistentePrueba";

        when(httpClient.send(any(), any())).thenThrow(new RuntimeException("Error de conexión"));

        // Act
        String result = webhookClient.getSuggestedMessage(messages, assistantName, null);

        // Assert
        assertNull(result);
        verify(httpClient, times(1)).send(any(), any());
    }
}