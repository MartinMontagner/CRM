package com.cocreadores.backend.dto.wazend;

import java.util.List;

import io.micrometer.common.lang.Nullable;

public record WazendInstaceUpdateDTO(
        @Nullable String name,
        @Nullable String instance,
        @Nullable String server,
        @Nullable String apiKey,
        @Nullable List<String> roles
) {
}
