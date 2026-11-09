package com.cocreadores.backend.dto.user;

import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.user.UserEntity;

public record UserUpdateRoleDTO(String username, String email, String name, Role role, Long id, boolean disabled) {
    public UserUpdateRoleDTO(UserEntity userEntity, Role mostImportantRole) {
        this(
                userEntity.getUsername(),
                userEntity.getEmail(),
                userEntity.getName(),
                mostImportantRole,
                userEntity.getId(),
                userEntity.isDisabled()
        );
    }
}