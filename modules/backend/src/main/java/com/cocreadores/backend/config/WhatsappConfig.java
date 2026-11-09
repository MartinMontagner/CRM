package com.cocreadores.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@Getter
public class WhatsappConfig {
    private final String apiUrl;
    private final String apiToken;
    private final String phoneNumberId;
    private final String businessId;
    private final String verifyToken;

    public WhatsappConfig(@Value("${whatsapp.api.url}") String apiUrl,@Value("${whatsapp.api.token}") String apiToken,@Value("${whatsapp.number.token}") String phoneNumberId,@Value("${whatsapp.business.token}") String businessId,@Value("${whatsapp.secret}") String verifyToken) {
        this.apiUrl = apiUrl;
        this.apiToken = apiToken;
        this.phoneNumberId = phoneNumberId;
        this.businessId = businessId;
        this.verifyToken = verifyToken;
    }

    @Bean(name = "whatsappRestTemplate")
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
