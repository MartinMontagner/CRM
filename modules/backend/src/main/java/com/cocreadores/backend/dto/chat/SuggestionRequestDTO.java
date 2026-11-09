package com.cocreadores.backend.dto.chat;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SuggestionRequestDTO {
    private String dateTime;
    private String content;
    private String sender; // USER, BOT, etc.
}

