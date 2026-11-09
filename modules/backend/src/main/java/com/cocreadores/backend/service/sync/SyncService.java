package com.cocreadores.backend.service.sync;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import com.cocreadores.backend.dto.sync.SyncResultDTO;
import com.cocreadores.backend.model.chat.ChatMessage;
import com.cocreadores.backend.model.student.StudentConversationEntity;

import com.cocreadores.backend.repository.ChatMessageRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;

@Service
public class SyncService {

    @Autowired
    private StudentConversationRepository studentConversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Transactional
    public SyncResultDTO syncDateStudentConversations() {
        List<StudentConversationEntity> conversations = studentConversationRepository.findWhereUpdatedAtIsNull();
        if (conversations.isEmpty()) {
            return new SyncResultDTO(0, List.of(), 0, List.of(), 0, List.of());
        }

        int sentAtCount = 0;
        int createdAtCount = 0;
        int nowCount = 0;
        List<Long> sentAtIds = new java.util.ArrayList<>();
        List<Long> createdAtIds = new java.util.ArrayList<>();
        List<Long> nowIds = new java.util.ArrayList<>();

        for (StudentConversationEntity c : conversations) {
            ChatMessage lastMessage = chatMessageRepository.findTopByConversationOrderBySentAtDesc(c);

            if (lastMessage != null) {
                c.setUpdatedAt(lastMessage.getSentAt());
                sentAtCount++;
                sentAtIds.add(c.getId());
            } else if (c.getCreatedAt() != null) {
                c.setUpdatedAt(c.getCreatedAt());
                createdAtCount++;
                createdAtIds.add(c.getId());
            } else {
                c.setUpdatedAt(LocalDateTime.now());
                nowCount++;
                nowIds.add(c.getId());
            }
        }
        // Persist changes if needed
        studentConversationRepository.saveAll(conversations);

        return new SyncResultDTO(
                sentAtCount,
                sentAtIds,
                createdAtCount,
                createdAtIds,
                nowCount,
                nowIds);
    }

}
