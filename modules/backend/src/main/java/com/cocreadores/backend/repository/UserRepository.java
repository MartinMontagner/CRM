package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String username);

    List<UserEntity> findByEnabledFalse();

    Optional<UserEntity> findByUsername(String username);
    List<UserEntity> findAllByEnabledTrueAndApprovedAtIsNotNull();

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.enabled = true AND u.approvedAt IS NOT NULL AND FUNCTION('DATE', u.approvedAt) = CURRENT_DATE")
    Optional<Long> getCountAprovedUsersToday();

    Optional<UserEntity> findByName(String name);
}
