package com.cocreadores.backend.dto.tag;

import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.validation.EnumValidator;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateCustomTagDTO {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Color cannot be blank")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid color format. Must be a valid hex color (e.g., #FFFFFF or #FFF)")
    private String color;

    @NotNull(message = "Student tag cannot be null")
    @EnumValidator(enumClass = StudentType.class, message = "Invalid student tag. Allowed values: LEAD, ALUMNO, EX_ALUMNO")
    private StudentType studentTag;

    @NotNull(message = "Important status cannot be null")
    private boolean important;
}