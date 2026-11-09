package com.cocreadores.backend.dto.wordpress;

import lombok.Data;

@Data
public class UpdateContactInfoDTO {
    private String email;
    private String firstName;
    private String lastName;
    private String telefono;
    private String addressCountry;
    private String note;
}
