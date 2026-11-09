package com.cocreadores.backend.service.wazend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class JsonRepairService {

    private static final AtomicInteger malformedJsonCount = new AtomicInteger(0);
    private static final AtomicInteger unreparableJsonCount = new AtomicInteger(0);

    // Patrones regex compilados para mejor performance
    private static final Pattern PATTERN_MISSING_COMMA_BRACE = Pattern.compile("}\"([a-zA-Z_])");
    private static final Pattern PATTERN_MISSING_COMMA_BRACKET = Pattern.compile("\\]\"([a-zA-Z_])");
    private static final Pattern PATTERN_MISSING_COMMA_STRING = Pattern.compile("\"([^\"\\\\]*(\\\\.[^\"\\\\]*)*)\"([a-zA-Z_])");
    private static final Pattern PATTERN_MISSING_COMMA_NUMBER = Pattern.compile("([0-9]+)\"([a-zA-Z_])");
    private static final Pattern PATTERN_MISSING_COMMA_BOOLEAN = Pattern.compile("(true|false)\"([a-zA-Z_])");
    private static final Pattern PATTERN_CONVERSATION = Pattern.compile("\"conversation\"\\s*:\\s*\"([^\"]*(?:\\\\.[^\"]*)*)\"");
    private static final Pattern PATTERN_DOUBLE_QUOTES = Pattern.compile("\"\"");
    private static final Pattern PATTERN_ESCAPED_QUOTES = Pattern.compile("\\\\\"");

    private final ObjectMapper objectMapper;

    public JsonRepairService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Método principal para parsear JSON con múltiples estrategias de reparación
     */
    public JsonNode parseJsonWithRepair(String jsonString, String fieldName, long recordNumber) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return objectMapper.createObjectNode();
        }

        String originalJson = jsonString;

        // Intento 1: Parsing directo
        try {
            return objectMapper.readTree(jsonString);
        } catch (Exception e1) {
            log.debug("Parsing directo falló para {}, línea {}: {}", fieldName, recordNumber, e1.getMessage());
        }

        // Intento 2: Limpieza básica y reparación
        try {
            String repairedJson = repairJsonString(jsonString);
            JsonNode result = objectMapper.readTree(repairedJson);

            int count = malformedJsonCount.incrementAndGet();
            if (count % 50 == 0) {
                log.info("Reparados {} JSONs malformados hasta ahora", count);
            }

            log.debug("JSON reparado exitosamente para {}, línea {}", fieldName, recordNumber);
            return result;

        } catch (Exception e2) {
            log.debug("Reparación automática falló para {}, línea {}: {}", fieldName, recordNumber, e2.getMessage());
        }

        // Intento 3: Extracción selectiva de campos importantes
        try {
            JsonNode result = extractImportantFields(jsonString);
            if (result.size() > 0) {
                log.debug("Extracción selectiva exitosa para {}, línea {}", fieldName, recordNumber);
                return result;
            }
        } catch (Exception e3) {
            log.debug("Extracción selectiva falló para {}, línea {}: {}", fieldName, recordNumber, e3.getMessage());
        }

        // Si llegamos aquí, no pudimos reparar el JSON
        logUnrepairableJson(originalJson, fieldName, recordNumber);
        return objectMapper.createObjectNode();
    }

    /**
     * Intenta reparar un JSON malformado aplicando múltiples estrategias
     */
    private String repairJsonString(String json) {
        if (json == null) return "{}";

        // Paso 1: Limpieza inicial
        json = json.trim();

        // Si no parece JSON, retornar objeto vacío
        if (!json.startsWith("{") && !json.startsWith("[")) {
            return "{}";
        }

        // Paso 2: Reparar comillas dobles escapadas incorrectamente
        json = PATTERN_DOUBLE_QUOTES.matcher(json).replaceAll("\"");

        // Paso 3: Reparar comas faltantes después de objetos cerrados
        json = PATTERN_MISSING_COMMA_BRACE.matcher(json).replaceAll("},\"$1");

        // Paso 4: Reparar comas faltantes después de arrays cerrados
        json = PATTERN_MISSING_COMMA_BRACKET.matcher(json).replaceAll("],\"$1");

        // Paso 5: Reparar comas faltantes después de strings
        json = repairMissingCommasAfterStrings(json);

        // Paso 6: Reparar comas faltantes después de números
        json = PATTERN_MISSING_COMMA_NUMBER.matcher(json).replaceAll("$1,\"$2");

        // Paso 7: Reparar comas faltantes después de booleanos
        json = PATTERN_MISSING_COMMA_BOOLEAN.matcher(json).replaceAll("$1,\"$2");

        // Paso 8: Reparar llaves/corchetes desbalanceados
        json = balanceBrackets(json);

        // Paso 9: Validar estructura básica
        json = ensureValidJsonStructure(json);

        return json;
    }

    /**
     * Reparar comas faltantes después de strings (más complejo debido a escapes)
     */
    private String repairMissingCommasAfterStrings(String json) {
        StringBuilder result = new StringBuilder();
        boolean inString = false;
        boolean escaped = false;

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);

            if (!inString && c == '"') {
                inString = true;
                result.append(c);
            } else if (inString && c == '"' && !escaped) {
                inString = false;
                result.append(c);

                // Verificar si necesitamos agregar coma
                if (i + 1 < json.length() && json.charAt(i + 1) == '"') {
                    result.append(',');
                }
            } else if (inString && c == '\\') {
                escaped = !escaped;
                result.append(c);
            } else {
                escaped = false;
                result.append(c);
            }
        }

        return result.toString();
    }

    /**
     * Balancear llaves y corchetes
     */
    private String balanceBrackets(String json) {
        int braceCount = 0;
        int bracketCount = 0;

        // Contar llaves y corchetes
        for (char c : json.toCharArray()) {
            switch (c) {
                case '{': braceCount++; break;
                case '}': braceCount--; break;
                case '[': bracketCount++; break;
                case ']': bracketCount--; break;
            }
        }

        // Agregar llaves/corchetes faltantes al final
        StringBuilder result = new StringBuilder(json);

        while (braceCount > 0) {
            result.append('}');
            braceCount--;
        }

        while (bracketCount > 0) {
            result.append(']');
            bracketCount--;
        }

        return result.toString();
    }

    /**
     * Asegurar estructura JSON válida básica
     */
    private String ensureValidJsonStructure(String json) {
        json = json.trim();

        // Si está vacío, retornar objeto vacío
        if (json.isEmpty()) {
            return "{}";
        }

        // Si no empieza con { o [, envolver en objeto
        if (!json.startsWith("{") && !json.startsWith("[")) {
            return "{\"data\": \"" + json.replace("\"", "\\\"") + "\"}";
        }

        // Remover caracteres de control problemáticos
        json = json.replaceAll("[\\x00-\\x1F\\x7F]", "");

        return json;
    }

    /**
     * Extraer campos importantes cuando la reparación automática falla
     */
    private JsonNode extractImportantFields(String malformedJson) throws Exception {
        StringBuilder jsonBuilder = new StringBuilder("{");
        boolean hasFields = false;

        // Extraer conversation
        Matcher conversationMatcher = PATTERN_CONVERSATION.matcher(malformedJson);
        if (conversationMatcher.find()) {
            String conversation = conversationMatcher.group(1);
            conversation = conversation.replace("\\\"", "\""); // Unescape quotes
            jsonBuilder.append("\"conversation\": \"").append(escapeJsonString(conversation)).append("\"");
            hasFields = true;
        }

        // Extraer messageContextInfo
        String messageContextInfo = extractFieldValue(malformedJson, "messageContextInfo");
        if (messageContextInfo != null) {
            if (hasFields) jsonBuilder.append(",");
            jsonBuilder.append("\"messageContextInfo\": ").append(messageContextInfo);
            hasFields = true;
        }

        // Extraer otros campos importantes
        String[] fieldsToExtract = {
                "documentMessage", "imageMessage", "audioMessage", "videoMessage",
                "reactionMessage", "stickerMessage", "locationMessage", "contactMessage"
        };

        for (String field : fieldsToExtract) {
            String fieldValue = extractFieldValue(malformedJson, field);
            if (fieldValue != null) {
                if (hasFields) jsonBuilder.append(",");
                jsonBuilder.append("\"").append(field).append("\": ").append(fieldValue);
                hasFields = true;
            }
        }

        jsonBuilder.append("}");

        if (!hasFields) {
            return objectMapper.createObjectNode();
        }

        return objectMapper.readTree(jsonBuilder.toString());
    }

    /**
     * Extraer valor de un campo específico del JSON malformado
     */
    private String extractFieldValue(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + fieldName + "\"\\s*:\\s*({[^}]*}|\\[[^\\]]*\\]|\"[^\"]*\"|[^,}\\]]+)");
        Matcher matcher = pattern.matcher(json);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }

    /**
     * Escapar string para JSON
     */
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    /**
     * Log de JSONs que no se pudieron reparar para debugging
     */
    private void logUnrepairableJson(String originalJson, String fieldName, long recordNumber) {
        int count = unreparableJsonCount.incrementAndGet();

        // Log cada JSON no reparable para debugging
        log.error("=== JSON NO REPARABLE #{} ===", count);
        log.error("Campo: {}", fieldName);
        log.error("Línea: {}", recordNumber);
        log.error("Longitud: {} caracteres", originalJson.length());

        // Si es muy largo, mostrar solo el inicio y final
        if (originalJson.length() > 500) {
            log.error("Inicio (200 chars): {}", originalJson.substring(0, 200));
            log.error("Final (200 chars): {}", originalJson.substring(originalJson.length() - 200));
        } else {
            log.error("Contenido completo: {}", originalJson);
        }

        // Análisis de caracteres problemáticos
        analyzeProblematicCharacters(originalJson);

        log.error("=== FIN JSON NO REPARABLE #{} ===", count);

        // Cada 10 JSONs no reparables, mostrar estadísticas
        if (count % 10 == 0) {
            log.warn("ESTADÍSTICAS: {} JSONs reparados exitosamente, {} no reparables",
                    malformedJsonCount.get(), count);
        }
    }

    /**
     * Analizar caracteres problemáticos en el JSON
     */
    private void analyzeProblematicCharacters(String json) {
        // Contar tipos de caracteres
        int quotes = 0, braces = 0, brackets = 0, backslashes = 0;
        int openBraces = 0, closeBraces = 0;

        for (char c : json.toCharArray()) {
            switch (c) {
                case '"': quotes++; break;
                case '{': braces++; openBraces++; break;
                case '}': braces++; closeBraces++; break;
                case '[': case ']': brackets++; break;
                case '\\': backslashes++; break;
            }
        }

        log.error("Análisis: {} comillas, {} llaves ({} abrir, {} cerrar), {} corchetes, {} backslashes",
                quotes, braces, openBraces, closeBraces, brackets, backslashes);

        if (openBraces != closeBraces) {
            log.error("❌ Llaves desbalanceadas: {} abrir vs {} cerrar", openBraces, closeBraces);
        }

        if (quotes % 2 != 0) {
            log.error("❌ Comillas impares: {}", quotes);
        }

        // Buscar patrones problemáticos comunes
        if (json.contains("\"\"")) {
            log.error("❌ Contiene comillas dobles: \"\"");
        }

        if (json.contains("}\"")) {
            log.error("❌ Contiene patrón problemático: }\"");
        }

        if (json.contains("\":\"") && !json.contains("\",\"")) {
            log.error("❌ Posibles comas faltantes después de strings");
        }
    }

    /**
     * Obtener estadísticas de reparación
     */
    public static String getRepairStats() {
        return String.format("JSONs reparados: %d, No reparables: %d",
                malformedJsonCount.get(), unreparableJsonCount.get());
    }
}