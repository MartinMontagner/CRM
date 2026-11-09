package com.cocreadores.backend.dto.user;

import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.user.UserEntity;

public record UserResponseDTO(String username, String email, String name, Role role, Long id) {
    public UserResponseDTO(UserEntity userEntity) {
        this(userEntity.getUsername(), userEntity.getEmail(), userEntity.getName(),
                userEntity.getRoles().iterator().next(), userEntity.getId());
    }
}
