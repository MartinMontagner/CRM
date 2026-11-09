package com.cocreadores.backend.model.user;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public enum Role {
    SUPER_ADMIN,
    ADMIN,
    RESP_MARKETING,
    MARKETING,
    RESP_ATT_ALUMNO,
    ATT_ALUMNO,
    COACH_HEBREO,
    COACH_MENTORIA,
    VENTAS,
    USER;

    public static Optional<Role> fromString(String role) {
        try {
            return Optional.of(Role.valueOf(role.toUpperCase()));
        } catch (Exception e) {
            System.out.println("Error al convertir el rol: " + role + ". Rol no reconocido.");
            return Optional.empty();
        }
    }

    public static List<Role> getAllRolesByListString(List<String> roles) {
        return roles.stream()
                .map(Role::fromString)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    public static List<RoleDescription> getRolesWithDescriptions() {
        return Arrays.stream(Role.values())
                .map(role -> new RoleDescription(role, getDescriptionForRole(role)))
                .collect(Collectors.toList());
    }

    private static String getDescriptionForRole(Role role) {
        switch (role) {
            case SUPER_ADMIN:
                return "Super Administrador";
            case ADMIN:
                return "Administrador";
            case RESP_MARKETING:
                return "Responsable de Marketing";
            case MARKETING:
                return "Miembro del equipo de Marketing";
            case RESP_ATT_ALUMNO:
                return "Responsable de Atención al Alumno";
            case ATT_ALUMNO:
                return "Miembro del equipo de Atención al Alumno";
            case COACH_HEBREO:
                return "Coach de Hebreo";
            case COACH_MENTORIA:
                return "Coach de Mentoría";
            case VENTAS:
                return "Ventas";
            case USER:
                return "Usuario estándar";
            default:
                return "Rol desconocido";
        }
    }

    public static class RoleDescription {
        private final Role role;
        private final String description;

        public RoleDescription(Role role, String description) {
            this.role = role;
            this.description = description;
        }

        public Role getRole() {
            return role;
        }

        public String getDescription() {
            return description;
        }
    }
}
