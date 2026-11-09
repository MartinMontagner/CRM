package com.cocreadores.backend.dto.whatsapp;

import lombok.Data;

import java.util.List;

@Data
public class BulkTemplateRequestDTO {
    private String template;
    private List<String> params;
    private List<String>  phoneNumbers;
    private String language;
    private List<String> paramNames;
    private List<String> paramTypes;
    private String parameterFormat;
}