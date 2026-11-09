package com.cocreadores.backend.dto.whatsapp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class WhatsappResponse {

    @JsonProperty("messages")
    private List<Message> messages;

    private boolean error = false;
    private String errorMessage;

    // En caso de que la API devuelva error en otro formato
    private Object error_data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String id;
    }
}
