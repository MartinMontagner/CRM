package com.cocreadores.backend.client;

import com.cocreadores.backend.dto.chat.SuggestionRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
@Slf4j
public class WebhookClient {

    protected final HttpClient httpClient;
    protected final ObjectMapper mapper;
    private final String securityApiSecret;
    private final boolean shouldSendUsageEvents;

    public WebhookClient(@Value("${webhook.api.secret}") String securityApiSecret, @Value("${usage.events.enabled}") boolean shouldSendUsageEvents) {
        this.securityApiSecret = securityApiSecret;
        this.shouldSendUsageEvents = shouldSendUsageEvents;
        this.httpClient = HttpClient.newHttpClient();
        this.mapper = new ObjectMapper();
    }

    private HttpRequest.Builder requestBuilder(String path) throws URISyntaxException {
        return HttpRequest.newBuilder(new URI("https://hook.eu2.make.com" + path))
                .timeout(Duration.ofSeconds(60))
                .header("API-Secret", securityApiSecret)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");
    }

    private record AssistantFeedbackRequest(String phoneNumber, String userName, String assistantName, String feedback, String suggestion, String like, long timestamp) {}
    public void sendAssistantFeedback(String phoneNumber, String userName, String assistantName, String feedback, String suggestion, String like) {
        try {
            log.info("Enviando feedback para el asistente: {}", assistantName);

            long timestamp = System.currentTimeMillis();

            AssistantFeedbackRequest payload = new AssistantFeedbackRequest(
                    phoneNumber,
                    userName,
                    assistantName,
                    feedback,
                    suggestion,
                    like,
                    timestamp
            );
            String requestBody = mapper.writeValueAsString(payload);

            log.info("Request body para feedback: {}", requestBody);

            HttpRequest request = requestBuilder("/knb366nwy6j2g9elkwplhxn466o3p9ay")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Respuesta de feedback - status: {}, body: {}", response.statusCode(), response.body());

            if (response.statusCode() != 200) {
                log.error("Error al enviar feedback, statusCode: {}, body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error al enviar feedback al webhook", e);
        }
    }

    private record SendEmailBody(String email, String title, String body) {}
    public void sendEmail(String email, String title, String body){
        try {
            HttpRequest request = requestBuilder("/hv6j7ixzec7rw63laoh5is5b750jl9c1")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(new SendEmailBody(email, title, body))))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Sending email to user: " + email + body +", statusCode: " + response.statusCode() + ", body: " + response.body());
            if(response.statusCode() != 200) {
                log.error("Sending email to user: " + email + ", statusCode: " + response.statusCode() + ", body: " + response.body());
            }
        }
        catch (Exception e){
            log.error("Sending email to user: " + email, e);
        }
    }

    private record SendUsageEventBody(long userId, String email, int msgAmount) {}
    public void sendUsageEvent(long userId, String email, int msgAmount){
        if(!shouldSendUsageEvents) {
            return;
        }
        SendUsageEventBody event = new SendUsageEventBody(userId, email, msgAmount);
        try {
            HttpRequest request = requestBuilder("/xbp6dn8j96sx9kec1umtjgcidbuc9puf")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(event)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() != 200) {
                log.error("Sending usage event: " + event + ", statusCode: " + response.statusCode() + ", body: " + response.body());
            }
        }
        catch (Exception e){
            log.error("Sending usage event: " + event, e);
        }
    }

    private record ErrorWebhookBody(String place, String errorMessage, String stackTrace, String payload, long timestamp) {}

    public void sendErrorToWebhook(String place, String errorMessage, String stackTrace, String payload) {
        try {
            long timestamp = System.currentTimeMillis();
            ErrorWebhookBody errorBody = new ErrorWebhookBody(
                    place,
                    errorMessage,
                    stackTrace,
                    payload,
                    timestamp
            );

            HttpRequest request = requestBuilder("/dtaafyqppnfchfin5ay9uawfkv2j9c93")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(errorBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() != 200) {
                log.error("Error sending error to webhook, status: {}, body: {}",
                        response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send error to webhook", e);
        }
    }

    private record MessageSuggestionRequest(String messagesAsString, String assistantName, String content) {}

    // Método original modificado para aceptar contenido
    public String getSuggestedMessage(List<SuggestionRequestDTO> messagelist, String assistantName, String content) {
        try {
            log.info("Building request for assistant: {}", assistantName);
            String messagesAsString = "none";

            // Verificar si content es null o vacío
            if (content == null || content.isEmpty()) {
                messagesAsString = messagelist.stream()
                        .map(SuggestionRequestDTO::toString)
                        .collect(Collectors.joining("\n"));
            }

            // Crear el payload incluyendo el contenido (puede ser null)
            MessageSuggestionRequest payload = new MessageSuggestionRequest(messagesAsString, assistantName, content);
            String requestBody = mapper.writeValueAsString(payload);

            log.info("Request body: {}", requestBody);

            HttpRequest request = requestBuilder("/21flk5a419ljhqyis4gmivc0w27zmsio")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Response status: {}, body: {}", response.statusCode(), response.body());

            if (response.statusCode() == 200) {
                return filtrarPalabra(response.body(), "querida");
            } else {
                log.error("Error getting suggestion, statusCode: {}, body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error sending message to AI hook", e);
        }
        return null;
    }

    public String filtrarPalabra(String texto, String palabraAFiltrar) {
        if (texto == null || palabraAFiltrar == null || palabraAFiltrar.isEmpty()) {
            return texto;
        }

        return texto.replaceAll("(?i)" + Pattern.quote(palabraAFiltrar), "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
