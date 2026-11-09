package com.cocreadores.backend.model.chat;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.OnDelete;

import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.wazend.WazendInstance;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "whatsapp_message_id", length = 500)
    private String whatsappMessageId;

    // ID del usuario o del cliente de WhatsApp
    private String phoneNumber;

    // Opcional: Relacionar con usuario del sistema si aplica
    private Long userId;
    private String userName;

    // Quién envía el mensaje: "USER", "BOT", "ADMIN", "WORKER" (usuario que
    // conversa)
    @Enumerated(EnumType.STRING)
    private MessageSender sender;

    @Enumerated(EnumType.STRING)
    private ConversationType conversationType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType messageType;

    @Column(name = "media_url", columnDefinition = "TEXT")
    private String mediaUrl;

    private String fileType;
    private String fileName;

    private Boolean read = false;

    private Boolean fromMe;

    private Boolean imported;

    private LocalDateTime sentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_member_id", nullable = true)
    private GroupMember groupMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wazend_instance_id", referencedColumnName = "id")
    @OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    private WazendInstance wazendInstance;

    @Column(name = "instance_id", nullable = true)
    private String instanceIdServer;

    @Column(name = "message_secret", length = 1000)
    private String messageSecret;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conversation_id")
    private StudentConversationEntity conversation;

    @OneToOne(mappedBy = "chatMessage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ChatMessageRawData rawDataEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referenced_message_id")
    private ChatMessage referencedMessage;

    @Column(name = "referenced_whatsapp_message_id", length = 500)
    private String referencedWhatsappMessageId;

    @OneToMany(mappedBy = "chatMessage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ReactionWazend> reactions; // Relación con ReactionWazend

    @Override
    public String toString() {
        return "ChatMessage{" +
                "id=" + id +
                ", whatsappMessageId='" + whatsappMessageId + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", userId=" + userId +
                ", userName='" + userName + '\'' +
                ", sender=" + sender +
                ", conversationType=" + conversationType +
                ", content='" + content + '\'' +
                ", messageType=" + messageType +
                ", mediaUrl='" + mediaUrl + '\'' +
                ", read=" + read +
                ", sentAt=" + sentAt +
                ", groupMember=" + (groupMember != null ? groupMember.getId() : "null") +
                ", wazendInstance=" + (wazendInstance != null ? "Lazy Loaded" : "null") +
                ", instanceIdServer='" + instanceIdServer + '\'' +
                ", messageSecret='" + messageSecret + '\'' +
                '}';
    }
}
