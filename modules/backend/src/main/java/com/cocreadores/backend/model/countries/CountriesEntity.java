package com.cocreadores.backend.model.countries;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "countries",
        indexes = @Index(name = "idx_country_code", columnList = "code", unique = true))
@Getter
@Setter
public class CountriesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2, unique = true)
    private String code;

    private String name;
}
