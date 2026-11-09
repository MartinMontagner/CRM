package com.cocreadores.backend.model.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chat_message_raw_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRawData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_message_id", referencedColumnName = "id")
    private ChatMessage chatMessage;

    @Column(columnDefinition = "TEXT")
    private String rawData;
}