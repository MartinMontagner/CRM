package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.student.CustomTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomTagRepository extends JpaRepository<CustomTag, Long> {
    List<CustomTag> findAllByEnabledTrue();

    @Modifying
    @Query("UPDATE CustomTag c SET c.enabled = false WHERE c.id = :id")
    void softDelete(@Param("id") Long id);

    default Optional<CustomTag> findActiveById(Long id) {
        return findById(id).filter(CustomTag::isEnabled);
    }

    boolean existsByIdAndEnabledTrue(Long id);

    // Obtiene las custom tags disponibles cuando la studentTag es similar a la de la conversación
    @Query("SELECT ct FROM CustomTag ct " +
           "JOIN StudentConversationEntity sce ON sce.studentTag = ct.studentTag " +
           "WHERE sce.id = :conversationId AND ct.enabled = true")
    List<CustomTag> findAvailableTagsForConversation(Long conversationId);
}