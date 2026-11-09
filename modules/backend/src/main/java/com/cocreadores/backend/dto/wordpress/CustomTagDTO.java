package com.cocreadores.backend.dto.wordpress;

import com.cocreadores.backend.model.student.StudentType;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@Getter
@Setter
public class CustomTagDTO {
    private Long id;
    private String name;
    private String color;
    private boolean enabled;
    private StudentType studentTag;
    private boolean important;
    private boolean dark;

    public CustomTagDTO(Long id, String name, String color, boolean enabled, StudentType studentTag, boolean important, boolean dark) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.enabled = enabled;
        this.studentTag = studentTag;
        this.important = important;
        this.dark = dark;
    }
}
