package com.cocreadores.backend.model.student;
import com.cocreadores.backend.model.wordpress.MemberEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.cocreadores.backend.model.chat.GroupMember;
import com.cocreadores.backend.model.wazend.WazendInstance;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "student_conversations", indexes = {
        @Index(name = "idx_phone", columnList = "phone"),
        @Index(name = "idx_member_id", columnList = "member_id"),
        @Index(name = "idx_custom_tag_id", columnList = "custom_tag_id"),
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentConversationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private StudentType studentTag;

    @Enumerated(EnumType.STRING)
    private InterestType interestTag;

    @ManyToMany
    @JoinTable(name = "student_conversation_custom_tags",
            joinColumns = @JoinColumn(name = "conversation_id"),
            inverseJoinColumns = @JoinColumn(name = "custom_tag_id"))
    private Set<CustomTag> customTags;

    @Enumerated(EnumType.STRING)
    private ConversationType conversationType;

    private String fullName;

    private String phone;

    private Long unreadCount;

    private String note;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean answered = false;

    @Column(columnDefinition = "TEXT")
    private String analisis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity member;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "wazend_instance_id", nullable = true)
    private WazendInstance wazendInstance;

    @Column(name = "instance_id_server", nullable = true)
    private String instanceIdServer;

    @OneToMany(mappedBy = "conversation", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<GroupMember> groupMembers;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Override
    public String toString() {
        return "StudentConversationEntity{" +
                "id=" + id +
                ", studentTag=" + studentTag +
                ", interestTag=" + interestTag +
                ", conversationType=" + conversationType +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                ", unreadCount=" + unreadCount +
                ", note='" + note + '\'' +
                ", answered=" + answered +
                ", analisis='" + analisis + '\'' +
                ", member=" + (member != null ? member.getId() : null) +
                ", wazendInstance=" + (wazendInstance != null ? wazendInstance.getId() : null) +
                ", instanceIdServer='" + instanceIdServer + '\'' +
                ", updatedAt=" + updatedAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
