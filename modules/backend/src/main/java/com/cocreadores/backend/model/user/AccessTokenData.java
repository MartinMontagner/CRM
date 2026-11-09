package com.cocreadores.backend.model.user;

import java.util.Set;

public record AccessTokenData(Long userId, Set<Role> roles) {}