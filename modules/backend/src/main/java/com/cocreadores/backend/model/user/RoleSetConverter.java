package com.cocreadores.backend.model.user;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Converter
public class RoleSetConverter implements AttributeConverter<Set<Role>, String> {

    @Override
    public String convertToDatabaseColumn(Set<Role> roles) {
        return roles != null ? roles.stream().map(Role::name).collect(Collectors.joining(",")) : "";
    }

    @Override
    public Set<Role> convertToEntityAttribute(String s) {
        return s != null ? Arrays.stream(s.split(",")).map(Role::valueOf).collect(Collectors.toSet()) : Collections.emptySet();
    }
}