package com.cocreadores.backend.service.user;

import com.cocreadores.backend.model.user.RefreshTokenEntity;
import com.cocreadores.backend.repository.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
public class RefreshTokenEntityService {
    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenEntityService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public Optional<RefreshTokenEntity> saveOrUpdate(RefreshTokenEntity entity){
        try {
            return Optional.of(refreshTokenRepository.save(entity));
        } catch (Exception e){
            log.error("Saving RefreshTokenEntity for userId: " + entity.getUser().getId(), e);
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public Optional<RefreshTokenEntity> findByToken(String token) {
        try {
            return refreshTokenRepository.findByToken(token);
        } catch (Exception e){
            log.error("Fetching RefreshTokenEntity with token: " + token, e);
            return Optional.empty();
        }
    }

    @Transactional
    public void delete(RefreshTokenEntity entity) {
        try {
            refreshTokenRepository.delete(entity);
        } catch (Exception e){
            log.error("Deleting RefreshTokenEntity", e);
        }
    }

    @Transactional
    public void deleteByToken(String token) {
        try {
            refreshTokenRepository.deleteByToken(token);
        } catch (Exception e){
            log.error("Deleting RefreshTokenEntity", e);
        }
    }
}