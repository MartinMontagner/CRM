package com.cocreadores.backend.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.cocreadores.backend.model.wazend.WazendInstance;

@Repository
public interface WazendInstanceRepository extends JpaRepository<WazendInstance, Long> {
    Optional<WazendInstance> findById(Long id);

    Optional<WazendInstance> findByInstance(String instance);

    @Query("SELECT w FROM WazendInstance w WHERE w.isActive = true")
    List<WazendInstance> findAllByIsActiveTrue();
}
