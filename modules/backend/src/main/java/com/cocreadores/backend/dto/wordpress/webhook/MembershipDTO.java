package com.cocreadores.backend.dto.wordpress.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MembershipDTO {
    private String id;
    private String title;
}
