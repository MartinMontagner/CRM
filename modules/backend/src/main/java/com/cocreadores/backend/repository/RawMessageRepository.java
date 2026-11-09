package com.cocreadores.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cocreadores.backend.model.RawMessage;

@Repository
public interface RawMessageRepository extends JpaRepository<RawMessage, Long> {
}