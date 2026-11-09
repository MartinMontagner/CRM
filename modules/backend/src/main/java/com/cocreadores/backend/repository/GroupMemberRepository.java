package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.chat.GroupMember;
import com.cocreadores.backend.model.student.StudentConversationEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    @Query("SELECT gm FROM GroupMember gm WHERE gm.conversation = ?1 AND gm.participant = ?2")
    Optional<GroupMember> findByConversationAndParticipant(StudentConversationEntity conversation, String participant);
}