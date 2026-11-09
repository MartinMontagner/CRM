package com.cocreadores.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.cocreadores.backend.model.chat.ChatMessage;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.StudentConversationEntity;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

        List<ChatMessage> findByConversationIdOrderBySentAtAsc(Long conversationId);

        boolean existsByWhatsappMessageId(String whatsappMessageId);

        List<ChatMessage> findByPhoneNumberAndConversationTypeOrderBySentAtAsc(String phoneNumber,
                        ConversationType conversationType);

        List<ChatMessage> findByPhoneNumberAndWazendInstance_IdOrderBySentAtAsc(String phoneNumber,
                        Long wazendInstanceId);

        @Query(value = "SELECT * FROM chat_messages c WHERE c.conversation_id = :conversationId AND c.conversation_type IS NOT NULL AND c.message_type IS NOT NULL ORDER BY c.sent_at ASC", nativeQuery = true)
        List<ChatMessage> findByIdConversationWithGroupMemberAndStudentConversationOrderBySentAtAsc(
                        Long conversationId);

        @Query(value = "SELECT * FROM chat_messages c WHERE c.conversation_id = :conversationId AND c.message_type IS NOT NULL AND c.conversation_type IS NOT NULL AND (:search IS NULL OR :search = '' OR LOWER(c.content::text) LIKE LOWER(CONCAT('%', :search, '%')))", nativeQuery = true)
        Page<ChatMessage> findByConversation_IdOrderBySentAtAsc(Long conversationId, Pageable pageable, String search);

        @Query("SELECT c.conversation.id, c.phoneNumber, c.content, c.sentAt, c.read " +
                        "FROM ChatMessage c WHERE c.id IN (" +
                        "  SELECT MAX(c2.id) FROM ChatMessage c2 WHERE c2.phoneNumber = c.phoneNumber GROUP BY c2.phoneNumber)")
        List<Object[]> findLatestMessagesByPhoneNumber();

        @Modifying
        @Transactional
        @Query("UPDATE ChatMessage c SET c.read = true WHERE c.phoneNumber = :phoneNumber")
        void markAsReadByPhoneNumber(String phoneNumber);

        void deleteByPhoneNumber(String phoneNumber);

        ChatMessage findTopByPhoneNumberOrderBySentAtDesc(String phone);

        ChatMessage findTopByConversationOrderBySentAtDesc(StudentConversationEntity conversation);

        List<ChatMessage> findTop30ByPhoneNumberOrderBySentAtDesc(String phoneNumber);

        List<ChatMessage> findTop30ByPhoneNumberOrderBySentAtAsc(String phoneNumber);

        void deleteByConversationId(Long id);

        @Query("SELECT cm FROM ChatMessage cm WHERE cm.whatsappMessageId = :messageId AND cm.conversation.id = :conversationId")
        Optional<ChatMessage> findByWhatsappMessageIdAndConversationId(@Param("messageId") String messageId,
                        @Param("conversationId") Long conversationId);

        @Query("SELECT cm FROM ChatMessage cm WHERE cm.whatsappMessageId = :messageId AND cm.wazendInstance.id = :instanceId")
        Optional<ChatMessage> findByWhatsappMessageIdAndInstanceId(@Param("messageId") String messageId,
                        @Param("instanceId") Long instanceId);

        Optional<ChatMessage> findByWhatsappMessageId(String referencedWhatsappMessageId);

        @Query("SELECT cm FROM ChatMessage cm WHERE cm.referencedWhatsappMessageId = :referencedWhatsappMessageId")
        Optional<List<ChatMessage>> findByReferencedWhatsappMessageId(String referencedWhatsappMessageId);
}
