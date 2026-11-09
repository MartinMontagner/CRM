package com.cocreadores.backend.dto.wazend;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WazendResponse {
    private KeyWazendResponseDTO key;
    private String pushName;
    private String status;
    private Object message; 
    private Object contextInfo;
    private String messageType;
    private Long messageTimestamp;
    private String instanceId;
    private String source;

    // Campos adicionales para manejar errores
    private boolean error;
    private String errorMessage;

    public boolean isError() {
        return error || !"PENDING".equals(status);
    }

    public String getErrorMessage() {
        if (errorMessage != null) return errorMessage;
        if (status != null && !status.equals("PENDING")) return "Estado: " + status;
        if (message != null) return message.toString();
        return null;
    }

    public void setMessage(Object message) { // <-- Cambia aquí
        this.message = message;
        if (message != null && message instanceof String) {
            this.errorMessage = (String) message;
        } else if (message != null) {
            this.errorMessage = message.toString();
        }
    }
}