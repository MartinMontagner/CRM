package com.cocreadores.backend.dto.wordpress.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

/**
 * Base class for all WordPress webhook events
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WebhookEventDTO {
    private String event;
    private String type;
    private Object data;
}

