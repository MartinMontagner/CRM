package com.cocreadores.backend.model.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(updatable = false, nullable = false)
    private Long id;
    private String email;
    private String username;
    private String name;
    private String password;
    @Convert(converter = RoleSetConverter.class)
    private Set<Role> roles;
    @Column(columnDefinition = "boolean default false")
    private boolean enabled = false;
    @Column(nullable = true)
    private LocalDateTime approvedAt = null;

    @Column(columnDefinition = "boolean default false")
    private boolean disabled = false;


// Getter y setter se generan automáticamente con Lombok

    public UserEntity(String email, String username, String fullName, String password, Set<Role> roles, boolean enabled) {
        this.email = email;
        this.username = username;
        this.name = fullName;
        this.password = password;
        this.roles = roles;
        this.enabled = enabled;
    }

    public UserEntity setEnabled(Role role) {
        this.enabled = true;
        this.approvedAt = enabled ? LocalDateTime.now() : null;
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);

        return this;
    }
    public void setRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
            this.roles.add(role);
            this.roles.add(Role.USER);
            return;
        }
        if (this.roles.contains(role)) {
            return;
        }
        this.roles.add(role);
    }

    public void updateRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
            this.roles.add(role);
            this.roles.add(Role.USER);
        }
        this.roles.clear();
        this.roles.add(Role.USER);
        this.roles.add(role);
    }
}