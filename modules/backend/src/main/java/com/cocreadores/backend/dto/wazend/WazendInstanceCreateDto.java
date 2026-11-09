package com.cocreadores.backend.dto.wazend;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public record WazendInstanceCreateDto(
    @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Instance name is required")
        String instance,
        @NotBlank(message = "API Key is required")
        String apiKey,
        @NotBlank(message = "Server URL is required")
        String server,
        List<String> roles
        ) {
    public WazendInstanceCreateDto(String name, String instance, String apiKey, String server, List<String> roles) {
        this.name = name;
        this.instance = instance;
        this.apiKey = apiKey;
        this.server = server;
        this.roles = roles;

    }
}