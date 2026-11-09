package com.cocreadores.backend.config;

import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.user.UserEntity;
import com.cocreadores.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Configuration
public class StartupUserConfig {

    @Bean
    @Transactional
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            String defaultEmail = "admin@fixriver.com";
            String defaultPassword = "adminF1XCoCreadores@2025";

            userRepository.findByEmail(defaultEmail).ifPresentOrElse(
                    user -> {
                        System.out.println("El usuario administrador ya existe.");
                    },
                    () -> {
                        UserEntity admin = new UserEntity(
                                defaultEmail,
                                "admin",
                                "ADMIN FIXRIVER",
                                passwordEncoder.encode(defaultPassword),
                                Set.of(Role.ADMIN, Role.SUPER_ADMIN),
                                true
                        );

                        UserEntity savedAdmin = userRepository.save(admin);
                        System.out.println("Usuario administrador creado con ID: " + savedAdmin.getId());
                    }
            );
        };
    }
}
