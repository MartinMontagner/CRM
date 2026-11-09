package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.wordpress.SubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, Long> {
    Optional<SubscriptionEntity> findByCsvId(Long id);

    Optional<SubscriptionEntity> findBySubscrId(String subscrId);
}