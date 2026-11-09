package com.cocreadores.backend.config;

import lombok.Getter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@Getter
public class WazendConfig {

    @Bean(name = "wazendRestTemplate")
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}