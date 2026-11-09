package com.cocreadores.backend.dto.wazend;

import java.util.Set;

import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.wazend.WazendInstance;

public record WazendInstaceResponseDTO(
        String name,
        String instance,
        String server,
        String apiKey,
        Long id,
        Set<Role> roles
        ) {
    public WazendInstaceResponseDTO(String name, String instance, String server, String apiKey, Long id, Set<Role> roles) {
        this.name = name;
        this.instance = instance;
        this.id = id;
        this.server = server;
        this.apiKey = apiKey;
        this.roles = roles;
    }

    public WazendInstaceResponseDTO(WazendInstance wazendInstance) {
        this(
                wazendInstance.getName(),
                wazendInstance.getInstance(),
                wazendInstance.getServer(),
                wazendInstance.getApiKey(),
                wazendInstance.getId(),
                wazendInstance.getAcceptedRoles() != null ? Set.copyOf(wazendInstance.getAcceptedRoles()) : Set.of()
        );
    }
}
