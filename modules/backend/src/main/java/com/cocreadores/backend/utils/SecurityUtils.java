package com.cocreadores.backend.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.cocreadores.backend.model.user.Role;

@Component
public class SecurityUtils {

    public List<Role> getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        List<Role> roles = new ArrayList<>();

        if (authentication != null && authentication.isAuthenticated()) {
            List<String> roleNames = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(r -> r.replace("ROLE_", ""))
                    .toList();

            for (String roleName : roleNames) {
                Optional<Role> role = Role.fromString(roleName);
                if (role.isPresent()) {
                    roles.add(role.get());
                }
            }
        }

        if (roles.isEmpty()) {
            throw new IllegalArgumentException("ROLES_NOT_FOUND");
        }

        return roles;
    }

    public List<String> getCurrentUserRoleStrings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        List<String> roleNames = new ArrayList<>();

        if (authentication != null && authentication.isAuthenticated()) {
            roleNames = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(r -> r.replace("ROLE_", ""))
                    .toList();
        }

        if (roleNames.isEmpty()) {
            throw new IllegalArgumentException("ROLES_NOT_FOUND");
        }

        return roleNames;
    }
}
