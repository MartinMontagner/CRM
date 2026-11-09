package com.cocreadores.backend.model.chat;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "whitelist_numbers")
public class WhitelistNumber {

    @Id
    private String phoneNumber;
}
