package com.cocreadores.backend.model.chat;

import java.time.LocalDateTime;
import java.util.List;

import com.cocreadores.backend.model.student.StudentConversationEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con StudentConversationEntity
    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private StudentConversationEntity conversation;

    private String participant;
    private String fullname;

    @Column(updatable = false)
    private LocalDateTime joinedAt;

    // Relación para tener múltiples mensajes
    @OneToMany(mappedBy = "groupMember", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages;
}