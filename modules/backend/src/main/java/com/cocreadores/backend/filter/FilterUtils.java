package com.cocreadores.backend.filter;

import java.util.Map;

public class FilterUtils {
    
    /**
     * Verifica si hay filtros avanzados presentes (excluyendo globalSearch)
     * @param filters Mapa de filtros recibidos
     * @return true si hay filtros avanzados, false en caso contrario
     */
    public static boolean hasAdvancedFilters(Map<String, String> filters) {
        if (filters == null || filters.isEmpty()) {
            return false;
        }
        
        // Contar filtros que no sean globalSearch y que tengan valor
        long advancedFilterCount = filters.entrySet().stream()
                .filter(entry -> !isGlobalSearchFilter(entry.getKey()))
                .filter(entry -> entry.getValue() != null && !entry.getValue().trim().isEmpty())
                .count();
                
        return advancedFilterCount > 0;
    }
    
    /**
     * Verifica si una clave de filtro corresponde a globalSearch
     * @param filterKey Clave del filtro
     * @return true si es globalSearch, false en caso contrario
     */
    private static boolean isGlobalSearchFilter(String filterKey) {
        return "globalSearch".equals(filterKey);
    }
    
    /**
     * Remueve los filtros de globalSearch del mapa de filtros
     * @param filters Mapa de filtros original
     * @return Nuevo mapa sin los filtros de globalSearch
     */
    public static Map<String, String> removeGlobalSearchFilters(Map<String, String> filters) {
        if (filters == null) {
            return null;
        }
        
        return filters.entrySet().stream()
                .filter(entry -> !isGlobalSearchFilter(entry.getKey()))
                .collect(java.util.stream.Collectors.toMap(
                    Map.Entry::getKey,
                    Map.Entry::getValue
                ));
    }
    
    /**
     * Obtiene el valor de globalSearch del mapa de filtros
     * @param filters Mapa de filtros
     * @return Valor de globalSearch o null si no existe
     */
    public static String getGlobalSearchValue(Map<String, String> filters) {
        if (filters == null) {
            return null;
        }
        return filters.get("globalSearch");
    }
}