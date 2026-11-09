package com.cocreadores.backend.dto.user;

import com.cocreadores.backend.model.user.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private String username;
    private String email;
    private String name;

    public UserDTO(UserEntity user) {
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.name = user.getName();
    }
}
