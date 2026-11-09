package com.cocreadores.backend.dto.user;

import com.cocreadores.backend.model.user.Role;
import jakarta.validation.constraints.NotNull;

public record UserUpdateDTO(
        @NotNull(message = "El rol no puede ser nulo")
        Role role) {
}
