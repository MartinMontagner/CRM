package com.cocreadores.backend.dto.auth;

import com.cocreadores.backend.model.user.Role;

import java.util.Set;

public record AuthDataDTO(String accessToken, Set<Role> roles) {}
