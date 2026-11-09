package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.chat.ChatMessageRawData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRawDataRepository extends JpaRepository<ChatMessageRawData, Long> {
}