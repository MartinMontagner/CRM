package com.cocreadores.backend.service.whatsapp;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.cocreadores.backend.config.WhatsappConfig;
import com.cocreadores.backend.dto.chat.SendBulkMessagesRequestDTO;
import com.cocreadores.backend.dto.chat.SendMessageRequestDTO;
import com.cocreadores.backend.dto.whatsapp.BulkMessageResultDTO;
import com.cocreadores.backend.dto.whatsapp.BulkTemplateResponseDTO;
import com.cocreadores.backend.dto.whatsapp.WhatsappResponse;
import com.cocreadores.backend.model.chat.MessageSender;
import com.cocreadores.backend.model.chat.MessageType;
import com.cocreadores.backend.service.chat.MessageLoggerService;
import com.cocreadores.backend.service.user.UserEntityService;
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

import java.util.*;

@Slf4j
@Service
public class WhatsappService {
    private static final Logger logger = LoggerFactory.getLogger(WhatsappService.class);

    @Autowired
    private WhatsappConfig whatsappConfig;

    @Autowired
    private MessageLoggerService messageLogger;

    @Autowired
    private UserEntityService userEntityService;

    @Autowired
    @Qualifier("whatsappRestTemplate")
    private RestTemplate restTemplate;


    /**
     * Envía mensaje de texto simple
     */
    public WhatsappResponse sendTextMessage(String phoneNumber, String message, Long userId) {
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> recipient = new HashMap<>();
        Map<String, Object> messageObj = new HashMap<>();
        Map<String, String> text = new HashMap<>();


        String userName = "Bot";
        if (userId != null)
        {
            userName = userEntityService.getUserName(userId);
        }


        recipient.put("phone_number", phoneNumber);
        text.put("body", message);
        messageObj.put("text", text);

        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("recipient_type", "individual");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "text");
        requestBody.put("text", text);

        // Determine the correct MessageSender enum value based on the sender string
        MessageSender messageSender = (userId != null) ? MessageSender.USER : MessageSender.BOT;
        log.info("Logging message from user ID: {}, userName: {}",
                userId, userName);

        messageLogger.logOutgoingMessage(
                phoneNumber,
                message,
                MessageType.TEXT,
                messageSender,
                userId,
                userName
        );


        return sendRequest(requestBody);
    }

    /**
     * Envía mensaje con botones Sí/No
     */
    public WhatsappResponse sendYesNoButtons(String phoneNumber, String message, String yesButtonText, String noButtonText, String contextId) {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> buttons = new ArrayList<>();

        // Botón SÍ con identificador contextual
        Map<String, Object> yesButton = new HashMap<>();
        yesButton.put("type", "reply");
        Map<String, String> yesReply = new HashMap<>();
        yesReply.put("id", "yes_" + contextId);
        yesReply.put("title", yesButtonText);
        yesButton.put("reply", yesReply);
        buttons.add(yesButton);

        // Botón NO con identificador contextual
        Map<String, Object> noButton = new HashMap<>();
        noButton.put("type", "reply");
        Map<String, String> noReply = new HashMap<>();
        noReply.put("id", "no_" + contextId);
        noReply.put("title", noButtonText);
        noButton.put("reply", noReply);
        buttons.add(noButton);

        // Interactive message
        Map<String, Object> interactive = new HashMap<>();
        interactive.put("type", "button");

        Map<String, Object> body = new HashMap<>();
        body.put("text", message);
        interactive.put("body", body);

        Map<String, Object> action = new HashMap<>();
        action.put("buttons", buttons);
        interactive.put("action", action);

        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("recipient_type", "individual");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "interactive");
        requestBody.put("interactive", interactive);

        messageLogger.logOutgoingMessage(
                phoneNumber,
                message,
                MessageType.BUTTON,
                MessageSender.BOT,
                null,
                null
        );

        return sendRequest(requestBody);
    }

    /**
     * Envía lista seleccionable
     */
    public WhatsappResponse sendListMessage(String phoneNumber, String headerText, String bodyText, String buttonText, List<Map<String, Object>> sections) {
        Map<String, Object> requestBody = new HashMap<>();

        // Interactive message
        Map<String, Object> interactive = new HashMap<>();
        interactive.put("type", "list");

        // Header (opcional)
        if (headerText != null && !headerText.isEmpty()) {
            Map<String, Object> header = new HashMap<>();
            header.put("type", "text");
            header.put("text", headerText);
            interactive.put("header", header);
        }

        // Body (obligatorio)
        Map<String, Object> body = new HashMap<>();
        body.put("text", bodyText);
        interactive.put("body", body);

        // Footer (opcional)
        Map<String, Object> footer = new HashMap<>();
        footer.put("text", "Selecciona una opción");
        interactive.put("footer", footer);

        // Action (obligatorio)
        Map<String, Object> action = new HashMap<>();
        action.put("button", buttonText);
        action.put("sections", sections);
        interactive.put("action", action);

        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("recipient_type", "individual");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "interactive");
        requestBody.put("interactive", interactive);

        messageLogger.logOutgoingMessage(
                phoneNumber,
                headerText + " " + bodyText,
                MessageType.LIST,
                MessageSender.BOT,
                null,
                null
        );

        return sendRequest(requestBody);
    }

    /**
     * Crea una sección para una lista
     */
    public Map<String, Object> createListSection(String title, List<Map<String, String>> rows) {
        Map<String, Object> section = new HashMap<>();
        section.put("title", title);
        section.put("rows", rows);
        return section;
    }

    /**
     * Crea un elemento de lista
     */
    public Map<String, String> createListItem(String id, String title, String description) {
        Map<String, String> row = new HashMap<>();
        row.put("id", id);
        row.put("title", title);
        if (description != null && !description.isEmpty()) {
            row.put("description", description);
        }
        return row;
    }

    /**
     * Envía plantilla con variables
     */
    public WhatsappResponse sendTemplate(String phoneNumber, String templateName, List<Map<String, String>> components, String sender) {
        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> template = new HashMap<>();
        template.put("name", templateName);
        template.put("language", Map.of("code", "es"));
        template.put("components", components);

        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("recipient_type", "individual");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "template");
        requestBody.put("template", template);

        MessageSender messageSender = "USER".equalsIgnoreCase(sender) ? MessageSender.USER : MessageSender.BOT;

        messageLogger.logOutgoingMessage(
                phoneNumber,
                templateName,
                MessageType.TEMPLATE,
                messageSender,
                null,
                null
        );

        return sendRequest(requestBody);
    }

    /**
     * Método para recibir imágenes desde WhatsApp
     * Cuando la API de WhatsApp recibe una imagen, descarga la imagen del servidor
     */
    public byte[] downloadMedia(String mediaId) {
        try {
            String mediaInfoUrl = whatsappConfig.getApiUrl() + mediaId;
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> mediaInfoResponse = restTemplate.exchange(
                    mediaInfoUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (mediaInfoResponse.getBody() != null) {
                String mediaUrl = (String) mediaInfoResponse.getBody().get("url");

                if (mediaUrl == null) {
                    logger.error("No media URL found for media ID: {}", mediaId);
                    return null;
                }

                // Download the media using the retrieved URL
                HttpHeaders downloadHeaders = new HttpHeaders();
                downloadHeaders.set("Authorization", "Bearer " + whatsappConfig.getApiToken());
                HttpEntity<String> downloadEntity = new HttpEntity<>(downloadHeaders);

                ResponseEntity<byte[]> mediaResponse = restTemplate.exchange(
                        mediaUrl,
                        HttpMethod.GET,
                        downloadEntity,
                        byte[].class
                );

                if (mediaResponse.getStatusCode().is2xxSuccessful()) {
                    return mediaResponse.getBody();
                } else {
                    logger.error("Failed to download media. Status: {}", mediaResponse.getStatusCode());
                    return null;
                }
            }

            logger.error("Failed to retrieve media information for ID: {}", mediaId);
            return null;

        } catch (RestClientException e) {
            logger.error("Error downloading media: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Obtiene la lista de templates aprobados desde la API de WhatsApp Business
     */
    public Map<String, Object> getTemplates() {
        String url = whatsappConfig.getApiUrl() + whatsappConfig.getBusinessId() + "/message_templates";

        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
        );

        return response.getBody();
    }

    private String getTemplateParameterFormat(String templateName) {
        return "POSITIONAL";
    }

    public BulkTemplateResponseDTO sendBulkTemplateMessages(
            String templateName,
            List<String> params,
            List<String> phoneNumbers,
            String language,
            List<String> paramNames,
            List<String> paramTypes,
            String explicitParameterFormat) {

        MessageSender user = MessageSender.USER;
        BulkTemplateResponseDTO response = new BulkTemplateResponseDTO();
        List<BulkMessageResultDTO> results = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        // Determinar el formato de parámetros
        log.info("Recibiendo solicitud con template={}, params={}, paramNames={}, paramTypes={}, format={}",
                templateName, params, paramNames, paramTypes, explicitParameterFormat);

        String parameterFormat = explicitParameterFormat;
        if (parameterFormat == null || parameterFormat.isEmpty()) {
            parameterFormat = getTemplateParameterFormat(templateName);
        }
        log.info("Formato determinado para la plantilla '{}': {}", templateName, parameterFormat);

        if (templateName.equals("seleccionar_candidatos") || templateName.equals("confirma_hora_inicio")) {
            parameterFormat = "NAMED";
            log.info("Forzando formato NAMED para plantilla '{}'", templateName);
        }

        // Validación de parámetros nombrados
        if ("NAMED".equals(parameterFormat) && (paramNames == null || paramNames.isEmpty())) {
            String errorMsg = "No se proporcionaron nombres de parámetros para una plantilla con formato NAMED";
            log.error(errorMsg);
            response.setSuccess(0);
            response.setFailure(phoneNumbers != null ? phoneNumbers.size() : 0);
            response.setErrorMessage(errorMsg);
            return response;
        }

        // Completar los tipos si no se proporcionaron
        List<String> effectiveParamTypes = paramTypes;
        if (effectiveParamTypes == null || effectiveParamTypes.isEmpty()) {
            effectiveParamTypes = new ArrayList<>();
            for (int i = 0; i < params.size(); i++) {
                effectiveParamTypes.add("text");
            }
        }

        // Validar que hay números telefónicos
        if (phoneNumbers == null || phoneNumbers.isEmpty()) {
            String errorMsg = "No se proporcionaron números telefónicos";
            log.error(errorMsg);
            response.setSuccess(0);
            response.setFailure(0);
            response.setErrorMessage(errorMsg);
            return response;
        }

        // Iterar sobre cada número telefónico
        for (String phoneNumber : phoneNumbers) {
            try {
                if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                    throw new IllegalArgumentException("Número de teléfono vacío");
                }

                // Registrar el mensaje saliente para cada número
                messageLogger.logOutgoingMessage(
                        phoneNumber,
                        "Plantilla enviada:" + templateName,
                        MessageType.TEMPLATE,
                        user,
                        null,
                        null
                );

                WhatsappResponse whatsappResponse;

                // Elegir el método apropiado según el formato de los parámetros
                if ("NAMED".equals(parameterFormat)) {
                    whatsappResponse = sendTemplateWithNamedParams(
                            phoneNumber,
                            templateName,
                            new ArrayList<>(params),
                            paramNames,
                            effectiveParamTypes,
                            language
                    );
                } else {
                    whatsappResponse = sendTemplateWithTextParams(
                            phoneNumber,
                            templateName,
                            new ArrayList<>(params),
                            effectiveParamTypes,
                            language
                    );
                }

                // Procesar respuesta
                String messageId = whatsappResponse.getMessages().toString();
                if (messageId != null) {
                    successCount++;
                    results.add(new BulkMessageResultDTO(messageId, null));
                    log.info("Mensaje enviado con éxito a {}, messageId={}", phoneNumber, messageId);
                } else {
                    failureCount++;
                    results.add(new BulkMessageResultDTO(null, "No se devolvió ID de mensaje"));
                    log.warn("No se pudo obtener ID de mensaje para template enviado a {}", phoneNumber);
                }
            } catch (Exception e) {
                log.error("Error al enviar template a {}: {}", phoneNumber, e.getMessage(), e);
                failureCount++;
                results.add(new BulkMessageResultDTO(null, e.getMessage()));
            }
        }

        response.setSuccess(successCount);
        response.setFailure(failureCount);
        response.setResults(results);

        log.info("Envío masivo completado. Total: {}, Éxitos: {}, Fallos: {}",
                phoneNumbers.size(), successCount, failureCount);
        return response;
    }

    public WhatsappResponse sendTemplateWithNamedParams(
            String phoneNumber,
            String templateName,
            List<String> textParams,
            List<String> paramNames,
            List<String> paramTypes,
            String languageCode) {

        // Verificaciones
        if (paramNames == null || paramNames.size() < textParams.size()) {
            throw new IllegalArgumentException("Para plantillas con formato NAMED, cada parámetro debe tener un nombre definido");
        }

        // Log para depuración
        log.debug("Enviando plantilla NAMED con parámetros: {}, nombres: {}, tipos: {}",
                textParams, paramNames, paramTypes);

        // Normalizar tipos
        List<String> effectiveParamTypes = paramTypes;
        if (effectiveParamTypes == null || effectiveParamTypes.size() < textParams.size()) {
            effectiveParamTypes = new ArrayList<>();
            for (int i = 0; i < textParams.size(); i++) {
                effectiveParamTypes.add(i < paramTypes.size() ? paramTypes.get(i) : "text");
            }
        }

        Map<String, Object> requestBody = new HashMap<>();

        // Estructura de la solicitud
        List<Map<String, Object>> components = new ArrayList<>();
        Map<String, Object> bodyComponent = new HashMap<>();
        bodyComponent.put("type", "body");

        List<Map<String, Object>> bodyParams = new ArrayList<>();

        // CRUCIAL: Para parámetros NAMED, usar parameter_name (NO name)
        for (int i = 0; i < textParams.size(); i++) {
            Map<String, Object> param = new HashMap<>();
            param.put("type", effectiveParamTypes.get(i));
            param.put("text", textParams.get(i));

            // CORRECTO: Usar parameter_name según la documentación
            if (i < paramNames.size()) {
                String paramName = paramNames.get(i);
                if (paramName == null || paramName.trim().isEmpty()) {
                    throw new IllegalArgumentException("El nombre del parámetro no puede estar vacío para plantillas con formato NAMED");
                }
                param.put("parameter_name", paramName.trim());
            }

            bodyParams.add(param);
        }

        bodyComponent.put("parameters", bodyParams);
        components.add(bodyComponent);

        Map<String, Object> template = new HashMap<>();
        template.put("name", templateName);
        template.put("language", Map.of("code", languageCode));
        template.put("components", components);

        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "template");
        requestBody.put("template", template);

        // Log del JSON
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            log.info("Enviando solicitud a WhatsApp API: {}", jsonRequest);
        } catch (Exception e) {
            log.warn("No se pudo serializar la solicitud para logging: {}", e.getMessage());
        }

        return sendRequest(requestBody);
    }

    /**
     * Método para enviar plantillas con parámetros posicionales
     * Este método usa la estructura correcta para plantillas con formato POSITIONAL
     */
    public WhatsappResponse sendTemplateWithTextParams(
            String phoneNumber,
            String templateName,
            List<String> textParams,
            List<String> paramTypes,  // Nuevo parámetro para tipos
            String languageCode) {

        Map<String, Object> requestBody = new HashMap<>();

        // Validar y completar los tipos si no son suficientes
        List<String> effectiveParamTypes = paramTypes;
        if (effectiveParamTypes == null || effectiveParamTypes.size() < textParams.size()) {
            effectiveParamTypes = new ArrayList<>();
            for (int i = 0; i < textParams.size(); i++) {
                effectiveParamTypes.add(i < paramTypes.size() ? paramTypes.get(i) : "text");
            }
        }

        // Creamos la estructura para los componentes
        List<Map<String, Object>> components = new ArrayList<>();

        // Añadimos el componente BODY con sus parámetros
        Map<String, Object> bodyComponent = new HashMap<>();
        bodyComponent.put("type", "body");

        List<Map<String, Object>> bodyParams = new ArrayList<>();

        // Para parámetros posicionales, incluimos el tipo y el texto
        for (int i = 0; i < textParams.size(); i++) {
            Map<String, Object> param = new HashMap<>();
            param.put("type", effectiveParamTypes.get(i));
            param.put("text", textParams.get(i));
            bodyParams.add(param);
        }

        bodyComponent.put("parameters", bodyParams);
        components.add(bodyComponent);

        Map<String, Object> template = new HashMap<>();
        template.put("name", templateName);
        template.put("language", Map.of("code", languageCode));
        template.put("components", components);

        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "template");
        requestBody.put("template", template);

        // Loguear el JSON exacto que se está enviando para depuración
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            log.info("Enviando solicitud a WhatsApp API: {}", objectMapper.writeValueAsString(requestBody));
        } catch (Exception e) {
            log.warn("No se pudo serializar el cuerpo de la solicitud para logging: {}", e.getMessage());
        }

        return sendRequest(requestBody);
    }

    /**
     * Normaliza el número de teléfono al formato requerido por WhatsApp
     */
    private String normalizePhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            throw new IllegalArgumentException("El número de teléfono no puede estar vacío");
        }

        String digitsOnly = phone.replaceAll("[^0-9]", "");

        if (digitsOnly.startsWith("00")) {
            digitsOnly = digitsOnly.substring(2);
        }

        if (phone.startsWith("+")) {
            digitsOnly = phone.substring(1).replaceAll("[^0-9]", "");
        }

        if (!digitsOnly.startsWith("34") && digitsOnly.length() == 9) {
            digitsOnly = "34" + digitsOnly;
        }


        return digitsOnly;
    }



    /**
     * Método privado para enviar las solicitudes a WhatsApp API
     */
    private WhatsappResponse sendRequest(Map<String, Object> requestBody) {
        String url = whatsappConfig.getApiUrl() + whatsappConfig.getPhoneNumberId() + "/messages";

        HttpHeaders headers = createHeaders();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            logger.debug("Enviando solicitud a WhatsApp API: URL={}, Body={}", url, requestBody);
            ResponseEntity<WhatsappResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    WhatsappResponse.class
            );

            // Log de la respuesta recibida
            WhatsappResponse responseBody = response.getBody();
            if (responseBody != null) {
                logger.debug("Respuesta de WhatsApp API: {}", responseBody);
                if (responseBody.isError()) {
                    logger.error("Error en respuesta de WhatsApp API: {}", responseBody.getErrorMessage());
                }
            } else {
                logger.warn("Se recibió una respuesta nula de WhatsApp API");
                WhatsappResponse errorResponse = new WhatsappResponse();
                errorResponse.setError(true);
                errorResponse.setErrorMessage("Respuesta nula de la API");
                return errorResponse;
            }

            return responseBody;
        } catch (Exception e) {
            logger.error("Excepción al enviar solicitud a WhatsApp API: {}", e.getMessage(), e);
            WhatsappResponse errorResponse = new WhatsappResponse();
            errorResponse.setError(true);
            errorResponse.setErrorMessage(e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Crea los headers necesarios para las solicitudes
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + whatsappConfig.getApiToken());
        headers.set("Content-Type", "application/json");
        return headers;
    }

    public WhatsappResponse sendMessage(SendMessageRequestDTO request, Long userId) {
        if ("TEXT".equalsIgnoreCase(request.getMessageType())) {
            return sendTextMessage(request.getPhoneNumber(), request.getContent(), userId);

        } else if ("TEMPLATE".equalsIgnoreCase(request.getMessageType())) {
            List<Map<String, String>> components = new ArrayList<>();

            if (request.getTemplateParams() != null && !request.getTemplateParams().isEmpty()) {
                Map<String, Object> bodyComponent = new HashMap<>();
                bodyComponent.put("type", "body");

                List<Map<String, String>> params = new ArrayList<>();
                for (String param : request.getTemplateParams()) {
                    params.add(Map.of("type", "text", "text", param));
                }
                bodyComponent.put("parameters", params);
                components.add((Map) bodyComponent);
            }

            // For template messages, also pass the sender information
            return sendTemplate(
                    request.getPhoneNumber(),
                    request.getContent(),   // Content es el nombre de la plantilla
                    components,
                    request.getSender()
            );
        } else {
            throw new UnsupportedOperationException("Message type not supported");
        }
    }

    public void sendBulkMessages(SendBulkMessagesRequestDTO request, Long userId) {
        if (request.getPhoneNumbers() == null || request.getPhoneNumbers().isEmpty()) {
            throw new IllegalArgumentException("No phone numbers provided");
        }

        // Enviar mensaje a cada número
        for (String phoneNumber : request.getPhoneNumbers()) {
            SendMessageRequestDTO messageRequest = new SendMessageRequestDTO();
            messageRequest.setPhoneNumber(phoneNumber);
            messageRequest.setContent(request.getContent());
            messageRequest.setSender(request.getSender());
            messageRequest.setMessageType(request.getMessageType());

            sendMessage(messageRequest, userId);

            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public WhatsappResponse sendInteractiveMessage(String phoneNumber, String bodyText, Map<String, Object> options) {
        Map<String, Object> requestBody = new HashMap<>();

        // Configuración básica del mensaje
        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("recipient_type", "individual");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "interactive");

        // Crear estructura del mensaje interactivo
        Map<String, Object> interactive = new HashMap<>();

        // Determinar el tipo de interacción (button, list, etc.)
        String type = options.containsKey("type") ? (String) options.get("type") : "button";
        interactive.put("type", type);

        // Agregar el cuerpo del mensaje
        Map<String, Object> body = new HashMap<>();
        body.put("text", bodyText);
        interactive.put("body", body);

        // Añadir header si está presente
        if (options.containsKey("header")) {
            interactive.put("header", options.get("header"));
        }

        // Añadir footer si está presente
        if (options.containsKey("footer")) {
            interactive.put("footer", options.get("footer"));
        }

        // Añadir la acción (botones o secciones)
        Map<String, Object> action = new HashMap<>();
        if (options.containsKey("buttons")) {
            action.put("buttons", options.get("buttons"));
            interactive.put("action", action);
        } else if (options.containsKey("action")) {
            interactive.put("action", options.get("action"));
        }

        // Añadir el objeto interactive al body
        requestBody.put("interactive", interactive);

        // Log para depuración
        logger.debug("Enviando mensaje interactivo: {}", requestBody);

        // Registrar el mensaje saliente
        messageLogger.logOutgoingMessage(
                phoneNumber,
                bodyText,
                MessageType.INTERACTIVE,
                MessageSender.BOT,
                null,
                null
        );

        // Enviar la solicitud
        WhatsappResponse response = sendRequest(requestBody);

        // Registrar la respuesta para depuración
        if (response.isError()) {
            logger.error("Error al enviar mensaje interactivo a {}: {}", phoneNumber, response.getErrorMessage());
        } else {
            logger.debug("Mensaje interactivo enviado correctamente a {}", phoneNumber);
        }

        return response;
    }
}
