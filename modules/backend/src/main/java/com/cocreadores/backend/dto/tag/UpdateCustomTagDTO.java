package com.cocreadores.backend.dto.tag;

import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.validation.EnumValidator;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class UpdateCustomTagDTO {
    @Nullable
    private String name;

    @Nullable
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid color format. Must be a valid hex color (e.g., #FFFFFF or #FFF)")
    private String color;

    @Nullable
    @EnumValidator(enumClass = StudentType.class, message = "Invalid student tag. Allowed values: LEAD, ALUMNO, EX_ALUMNO")
    private StudentType studentTag;
    @Nullable
    private Boolean enabled;

    @Nullable
    private Boolean important;
}