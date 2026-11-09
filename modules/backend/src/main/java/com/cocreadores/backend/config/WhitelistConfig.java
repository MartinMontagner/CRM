package com.cocreadores.backend.config;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "whitelist_config")
public class WhitelistConfig {

    @Id
    private String id = "default";

    @Column(columnDefinition = "boolean default true")
    private boolean enabled = true;
}