package com.cocreadores.backend.dto.whatsapp;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BulkTemplateResponseDTO {
    private int success; // Número de mensajes enviados con éxito
    private int failure; // Número de mensajes fallidos
    private List<BulkMessageResultDTO> results = new ArrayList<>(); // Resultados detallados por trabajador
    private String errorMessage;
}

