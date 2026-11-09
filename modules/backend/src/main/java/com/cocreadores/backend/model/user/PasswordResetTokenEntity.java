package com.cocreadores.backend.model.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "password_reset_token")
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetTokenEntity {
    @Id
    @GeneratedValue
    private Long id;
    private String token;
    private Instant expiresAt;

    @ManyToOne(optional = false)
    private UserEntity user;


    public PasswordResetTokenEntity(String token, Instant expiresAt, UserEntity user) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.user = user;
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
