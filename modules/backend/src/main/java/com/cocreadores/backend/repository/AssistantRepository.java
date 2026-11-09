package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.assistant.AssistantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistantRepository extends JpaRepository<AssistantEntity, Long> {
}
