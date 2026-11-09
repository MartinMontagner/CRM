package com.cocreadores.backend.event;

import com.cocreadores.backend.model.student.ConversationType;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class RawMessageEvent {
    private ConversationType source;
    private String raw;
}