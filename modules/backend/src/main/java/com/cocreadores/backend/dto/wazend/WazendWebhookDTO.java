package com.cocreadores.backend.dto.wazend;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendWebhookDTO {
    private String event;
    private String instance;
    private WazendDataDTO data;
    private String destination;
    @JsonProperty("date_time")
    private String dateTime;
    private String sender;
    @JsonProperty("server_url")
    private String serverUrl;
    private String apikey;
}
