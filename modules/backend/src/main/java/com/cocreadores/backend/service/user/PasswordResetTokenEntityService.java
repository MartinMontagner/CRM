package com.cocreadores.backend.service.user;


import com.cocreadores.backend.model.user.PasswordResetTokenEntity;
import com.cocreadores.backend.model.user.UserEntity;
import com.cocreadores.backend.repository.PasswordResetTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class PasswordResetTokenEntityService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public PasswordResetTokenEntityService(PasswordResetTokenRepository passwordResetTokenRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public PasswordResetTokenEntity createPasswordResetToken(UserEntity user) {
        PasswordResetTokenEntity passToken = new PasswordResetTokenEntity();
        passToken.setUser(user);
        passToken.setExpiresAt(Instant.now().plusMillis(30 * 60 * 1000L));
        passToken.setToken(UUID.randomUUID().toString());
        passToken = passwordResetTokenRepository.save(passToken);
        return passToken;
    }

    @Transactional
    public Optional<PasswordResetTokenEntity> saveOrUpdate(PasswordResetTokenEntity entity){
        try {
            return Optional.of(passwordResetTokenRepository.save(entity));
        } catch (Exception e){
            log.error("Saving PasswordResetTokenEntity for userId: " + entity.getUser().getId(), e);
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public Optional<PasswordResetTokenEntity> findByToken(String token) {
        try {
            return passwordResetTokenRepository.findByToken(token);
        } catch (Exception e){
            log.error("Fetching PasswordResetTokenEntity with token: " + token, e);
            return Optional.empty();
        }
    }

    @Transactional
    public void delete(PasswordResetTokenEntity entity) {
        try {
            passwordResetTokenRepository.delete(entity);
        } catch (Exception e){
            log.error("Deleting PasswordResetTokenEntity", e);
        }
    }

    @Transactional
    public void deleteByToken(String token) {
        try {
            passwordResetTokenRepository.deleteByToken(token);
        } catch (Exception e){
            log.error("Deleting PasswordResetTokenEntity", e);
        }
    }
}