package com.cocreadores.backend.service.wazend;

import com.cocreadores.backend.config.WazendConfig;
import com.cocreadores.backend.dto.chat.SendMessageRequestDTO;
import com.cocreadores.backend.dto.wazend.WazendInstaceResponseDTO;
import com.cocreadores.backend.dto.wazend.WazendInstanceCreateDto;
import com.cocreadores.backend.dto.wazend.WazendResponse;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.chat.MessageSender;
import com.cocreadores.backend.model.chat.MessageType;
import com.cocreadores.backend.model.wazend.WazendInstance;
import com.cocreadores.backend.service.chat.MessageLoggerService;
import com.cocreadores.backend.service.user.UserEntityService;
import com.cocreadores.backend.utils.Utils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class WazendService {
    private static final Logger logger = LoggerFactory.getLogger(WazendService.class);

    private final MessageLoggerService messageLogger;
    private final UserEntityService userEntityService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final WazendInstanceServiceImp wazendInstanceService;
    private final WazendConfig wazendConfig;

    @Autowired
    public WazendService(
            WazendConfig wazendConfig,
            MessageLoggerService messageLogger,
            UserEntityService userEntityService,
            WazendInstanceServiceImp wazendInstanceService,
            @Qualifier("wazendRestTemplate") RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        this.wazendConfig = wazendConfig;
        this.messageLogger = messageLogger;
        this.userEntityService = userEntityService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.wazendInstanceService = wazendInstanceService;
    }

    /**
     * Envía mensaje de texto simple a través de Wazend
     * 
     * @throws NotFoundException
     */
    public WazendResponse sendTextMessage(String phoneNumber, String message, Long userId, Long wazendInstanceId,
            Long groupId) throws NotFoundException {
        String userName = "Bot";
        WazendInstance wazendResponse = wazendInstanceService.getInstanceForAnotherServices(wazendInstanceId);

        if (!wazendResponse.getIsActive()) {
            logger.error("La instancia de Wazend con ID {} no está activa", wazendInstanceId);
            throw new NotFoundException("Instancia de Wazend no está activa");
        }

        if (userId != null) {
            userName = userEntityService.getUserName(userId);
        }

        // Crear el cuerpo de la solicitud según la documentación de Wazend
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("number", Utils.normalizePhoneNumber(phoneNumber));
        requestBody.put("text", message);

        // Determinar el remitente del mensaje
        MessageSender messageSender = (userId != null) ? MessageSender.USER : MessageSender.BOT;
        log.info("Enviando mensaje Wazend desde user ID: {}, userName: {}", userId, userName);

        // Enviar la solicitud a la API de Wazend
        WazendResponse sendRequest = sendRequest(requestBody, wazendResponse);
        if (sendRequest.isError()) {
            logger.error("Error al enviar mensaje a Wazend: {}", sendRequest.getErrorMessage());
            return sendRequest;
        }

        String keyReference = sendRequest.getKey() != null ? sendRequest.getKey().getId() : null;

        if (groupId == null) {
            messageLogger.logOutgoingMessage(
                    Utils.normalizePhoneNumber(phoneNumber),
                    message,
                    MessageType.TEXT,
                    messageSender,
                    userId,
                    userName,
                    wazendResponse,
                    keyReference);
        }

        if (groupId != null) {
            messageLogger.logOutChatGroupMessage(phoneNumber, message, MessageType.TEXT, messageSender, userId,
                    userName,
                    wazendResponse, groupId, keyReference);
        }

        return sendRequest;
    }

    /**
     * Método privado para enviar las solicitudes a la API de Wazend
     */
    private WazendResponse sendRequest(Map<String, Object> requestBody, WazendInstance wazendInstance) {
        // Construir la URL según la documentación de Wazend
        String url = wazendInstance.getServer() + "/message/sendText/" + wazendInstance.getInstance();

        // Crear headers necesarios para la solicitud
        HttpHeaders headers = createHeaders(wazendInstance);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            logger.debug("Enviando solicitud a Wazend API: URL={}, Body={}", url, requestBody);

            // Realizar la solicitud HTTP
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class);

            // Procesar la respuesta
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                try {
                    // Convertir la respuesta JSON a objeto WazendResponse
                    WazendResponse wazendResponse = objectMapper.readValue(response.getBody(), WazendResponse.class);
                    if (wazendInstance.getInstanceIdServer() == null) {
                        wazendInstance.setInstanceIdServer(wazendResponse.getInstanceId());
                        wazendInstanceService.save(wazendInstance);
                    }
                    logger.debug("Respuesta de Wazend API: {}", wazendResponse);
                    return wazendResponse;
                } catch (Exception e) {
                    logger.error("Error al deserializar respuesta de Wazend: {}", e.getMessage(), e);
                    WazendResponse errorResponse = new WazendResponse();
                    errorResponse.setStatus("ERROR");
                    errorResponse.setMessage("Error al procesar la respuesta: " + e.getMessage());
                    return errorResponse;
                }
            } else {
                logger.warn("Se recibió una respuesta no satisfactoria de Wazend API: {}", response.getStatusCode());
                WazendResponse errorResponse = new WazendResponse();
                errorResponse.setStatus("ERROR");
                errorResponse.setMessage("Respuesta no satisfactoria de la API: " + response.getStatusCode());
                return errorResponse;
            }
        } catch (RestClientException e) {
            logger.error("Excepción al enviar solicitud a Wazend API: {}", e.getMessage(), e);
            WazendResponse errorResponse = new WazendResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Error de comunicación con la API: " + e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Crea los headers necesarios para las solicitudes a Wazend
     */
    private HttpHeaders createHeaders(WazendInstance wazendInstance) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("apiKey", wazendInstance.getApiKey());
        return headers;
    }

    /**
     * Método para enviar mensajes a través de la interfaz general
     * 
     * @throws NotFoundException
     */
    public WazendResponse sendMessage(SendMessageRequestDTO request, Long wazendInstanceId, Long userId)
            throws NotFoundException {
        if ("TEXT".equalsIgnoreCase(request.getMessageType())) {
            return sendTextMessage(request.getPhoneNumber(), request.getContent(), userId, wazendInstanceId, null);
        } else {
            throw new UnsupportedOperationException("Tipo de mensaje no soportado actualmente en Wazend");
        }
    }

    /**
     * Método para enviar mensajes a través de la interfaz general
     * 
     * @throws NotFoundException
     */
    public WazendResponse sendMessageGroup(SendMessageRequestDTO request, Long wazendInstanceId, Long userId,
            Long conversationId) throws NotFoundException {
        if ("TEXT".equalsIgnoreCase(request.getMessageType())) {
            return sendTextMessage(request.getPhoneNumber(), request.getContent(), userId, wazendInstanceId,
                    conversationId);
        } else {
            throw new UnsupportedOperationException("Tipo de mensaje no soportado actualmente en Wazend");
        }
    }
}