package com.cocreadores.backend.service.chat;

import com.cocreadores.backend.client.WebhookClient;
import com.cocreadores.backend.dto.chat.SuggestionRequestDTO;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.service.student.StudentConversationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class AiSuggestionService {
    private static final Logger logger = LoggerFactory.getLogger(AiSuggestionService.class);

    @Autowired
    private WebhookClient webhookClient;

    @Autowired
    private MessageLoggerService messageLogger;

    @Autowired
    private StudentConversationService studentConversationService;

    /**
     * Obtiene una sugerencia del asistente de IA basado en conversaciones previas
     */
    public String getAiSuggestion(String phoneNumber, String assistantName) throws NotFoundException {
        List<SuggestionRequestDTO> messageList = messageLogger.getMessagesByPhoneNumberSuggestion(phoneNumber);

        String suggestion = webhookClient.getSuggestedMessage(messageList, assistantName, null);

        if (Objects.equals(assistantName, "analisis")) {
            studentConversationService.setAnalisis(phoneNumber, suggestion);
        }

        return suggestion;
    }

    /**
     * Obtiene una sugerencia del asistente de IA con contenido adicional
     */
    public String getAiSuggestion(String phoneNumber, String assistantName, String content) throws NotFoundException {
        List<SuggestionRequestDTO> messageList = messageLogger.getMessagesByPhoneNumberSuggestion(phoneNumber);

        String suggestion = webhookClient.getSuggestedMessage(messageList, assistantName, content);

        if (Objects.equals(assistantName, "analisis")) {
            studentConversationService.setAnalisis(phoneNumber, suggestion);
        }

        return suggestion;
    }

    /**
     * Envía feedback sobre el asistente de IA
     */
    public void sendAssistantFeedback(String phoneNumber, String userName, String assistantName, String feedback, String suggestion, String like) {
        logger.info("Procesando feedback para el asistente {} del número {}", assistantName, phoneNumber);

        // Enviar el feedback a través del webhook client
        webhookClient.sendAssistantFeedback(phoneNumber, userName, assistantName, feedback, suggestion, like);

        // Opcionalmente, registrar el feedback en la base de datos o realizar otras acciones
        logger.info("Feedback enviado correctamente para el asistente {} del número {}", assistantName, phoneNumber);
    }
}