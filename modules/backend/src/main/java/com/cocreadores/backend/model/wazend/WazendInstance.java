package com.cocreadores.backend.model.wazend;

import com.cocreadores.backend.dto.wazend.WazendInstanceCreateDto;
import com.cocreadores.backend.model.chat.ChatMessage;
import com.cocreadores.backend.model.user.Role;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "wazend_instance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WazendInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(updatable = false, nullable = false)
    private Long id;

    private String name;
    private String instance;
    private String apiKey;
    private String server;

    @Column(name = "instance_id_server", nullable = true)
    private String instanceIdServer;

    @OneToMany(mappedBy = "wazendInstance", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<ChatMessage> chatMessages;

    @Column(columnDefinition = "boolean default true")
    private Boolean isActive;

    @Column(name = "accepted_roles")
    @Enumerated(EnumType.STRING)
    private Set<Role> acceptedRoles = new HashSet<>(Set.of(Role.SUPER_ADMIN));

    public WazendInstance(WazendInstanceCreateDto wazendInstanceCreateDto) {
        this.name = wazendInstanceCreateDto.name();
        this.instance = wazendInstanceCreateDto.instance();
        this.apiKey = wazendInstanceCreateDto.apiKey();
        this.server = wazendInstanceCreateDto.server();
        this.acceptedRoles = new HashSet<>(Set.of(Role.SUPER_ADMIN));

        if (wazendInstanceCreateDto.roles() != null && !wazendInstanceCreateDto.roles().isEmpty()) {
            List<Role> roles = Role.getAllRolesByListString(wazendInstanceCreateDto.roles());
            if (roles != null && !roles.isEmpty()) {
                roles.forEach(this::designRole);
            }
        }

        this.isActive = true;
    }

    public void designRole(Role role) {
        if (this.acceptedRoles == null) {
            this.acceptedRoles = new HashSet<>();
        }
        if (this.acceptedRoles.contains(role)) {
            return;
        } else {
            this.acceptedRoles.add(role);
        }
    }

    public void removeRole(Role role) {
        if (this.acceptedRoles != null && this.acceptedRoles.contains(role)) {
            this.acceptedRoles.remove(role);
        }
    }

    @Override
    public String toString() {
        return "WazendInstance{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", instance='" + instance + '\'' +
                ", apiKey='" + apiKey + '\'' +
                ", server='" + server + '\'' +
                ", isActive=" + isActive +
                '}';
    }

    public void updateRoles(List<String> roles) {
        List<Role> rolesEnum = Role.getAllRolesByListString(roles);
        if (this.acceptedRoles == null) {
            this.acceptedRoles = new HashSet<>();
        } else {
            this.acceptedRoles.clear();
        }
        if (rolesEnum != null && !rolesEnum.isEmpty()) {
            rolesEnum.forEach(this::designRole);
        }
        if (!this.acceptedRoles.contains(Role.SUPER_ADMIN)) {
            this.acceptedRoles.add(Role.SUPER_ADMIN);
        }
    }
}
