package com.cocreadores.backend.especification;

import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.CustomTag;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.text.Normalizer;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class StudentConversationSpecifications {

    public static Specification<StudentConversationEntity> withFilters(
            Map<String, String> filters, 
            String globalSearch, 
            ConversationType conversationType,
            Set<String> filterStudentTypeByRole) {

        return Specification.where(hasUpdatedAt())
                .and(hasConversationType())
                .and(withConversationTypeFilter(conversationType))
                .and(withGlobalSearch(globalSearch))
                .and(withAdvancedFilters(filters))
                .and(withStudentTypeFilter(filterStudentTypeByRole));
    }

    private static Specification<StudentConversationEntity> hasUpdatedAt() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.isNotNull(root.get("updatedAt"));
    }

    private static Specification<StudentConversationEntity> hasConversationType() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.isNotNull(root.get("conversationType"));
    }

    private static Specification<StudentConversationEntity> withConversationTypeFilter(ConversationType conversationType) {
        return (root, query, criteriaBuilder) -> {
            if (conversationType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("conversationType"), conversationType);
        };
    }

    private static Specification<StudentConversationEntity> withGlobalSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            
            String searchPattern = "%" + search.toLowerCase() + "%";
            
            Predicate fullNamePredicate = criteriaBuilder.like(
                criteriaBuilder.lower(root.get("fullName")), 
                searchPattern
            );
            
            Predicate phonePredicate = criteriaBuilder.like(
                criteriaBuilder.lower(root.get("phone")), 
                searchPattern
            );
            
            return criteriaBuilder.or(fullNamePredicate, phonePredicate);
        };
    }

    private static Specification<StudentConversationEntity> withAdvancedFilters(Map<String, String> filters) {
        return (root, query, criteriaBuilder) -> {
            if (filters == null || filters.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            Predicate predicate = criteriaBuilder.conjunction();

            for (Map.Entry<String, String> entry : filters.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                
                if (value == null || value.trim().isEmpty()) {
                    continue;
                }

                switch (key) {
                    case "phoneNumber":
                        predicate = criteriaBuilder.and(predicate, 
                            criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("phone")), 
                                "%" + value.toLowerCase() + "%"
                            )
                        );
                        break;

                    case "wazendInstanceId":
                        Long instanceId;
                        try {
                            instanceId = Long.parseLong(value);
                        } catch (NumberFormatException e) {
                            // Si no es un número válido, ignorar el filtro
                            continue;
                        }
                        // Cambio principal: usar el ID de la relación wazendInstance
                        predicate = criteriaBuilder.and(predicate,
                            criteriaBuilder.equal(root.get("wazendInstance").get("id"), instanceId)
                        );
                        break;

                    case "studentName":
                        // Remover los % si vienen en el valor
                        String cleanName = value.replace("%", "");
                        predicate = criteriaBuilder.and(predicate, 
                            criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("fullName")), 
                                "%" + cleanName.toLowerCase() + "%"
                            )
                        );
                        break;
                        
                    case "studentLastName":
                        String cleanLastName = value.replace("%", "");
                        predicate = criteriaBuilder.and(predicate, 
                            criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("fullName")), 
                                "%" + cleanLastName.toLowerCase() + "%"
                            )
                        );
                        break;
                        
                    case "customTag":
                        try {
                            // Buscamos la custom tag por su id
                            Long customTagId = Long.parseLong(value);
                            Join<StudentConversationEntity, CustomTag> customTagJoin = root.join("customTags", JoinType.LEFT);
                            predicate = criteriaBuilder.and(predicate, 
                                criteriaBuilder.equal(customTagJoin.get("id"), customTagId)
                            );
                        } catch (NumberFormatException e) {
                            // Si no es un número valido, ignorar el filtro
                        }
                        break;
                        
                    case "country":
                        String cleanCountry = value.replace("%", "").toLowerCase();
                        cleanCountry = removeAccents(cleanCountry); // quitar tildes

                        String[] words = cleanCountry.split("\\s+"); // dividir por espacios

                        Join<Object, Object> memberJoin = root.join("member", JoinType.LEFT);
                        Join<Object, Object> countryJoin = memberJoin.join("country", JoinType.LEFT);

                        // Empezamos con el predicado base
                        Expression<String> normalizedCountryName = criteriaBuilder.function("unaccent", String.class,
                                criteriaBuilder.lower(countryJoin.get("name")));

                        for (String word : words) {
                            predicate = criteriaBuilder.and(predicate,
                                    criteriaBuilder.like(
                                            normalizedCountryName,
                                            "%" + word + "%"));
                        }

                        break;

                        
                    case "product":
                        String cleanProduct = value.replace("%", "").toLowerCase();
                        cleanProduct = removeAccents(cleanProduct); // quitar tildes

                        String[] wordsProducts = cleanProduct.split("\\s+"); // dividir en palabras

                        // join con member y luego con subscriptions (directamente a productName)
                        Join<Object, Object> memberJoinProduct = root.join("member", JoinType.LEFT);
                        Join<Object, Object> subscriptionJoinProduct = memberJoinProduct.join("subscriptions",
                                JoinType.LEFT);

                        Expression<String> normalizedProductName = criteriaBuilder.function("unaccent", String.class,
                                criteriaBuilder.lower(subscriptionJoinProduct.get("productName")));

                        for (String word : wordsProducts) {
                            predicate = criteriaBuilder.and(predicate,
                                    criteriaBuilder.like(
                                            normalizedProductName,
                                            "%" + word + "%"));
                        }
                        break;
                      case "readStatus":
                        try {
                            Long unreadCount = Long.parseLong(value);
                            if (unreadCount == 0) {
                                // Filtrar solo los leídos
                                predicate = criteriaBuilder.and(predicate,
                                        criteriaBuilder.equal(root.get("unreadCount"), 0L));
                            } else {
                                // Filtrar solo los no leídos (unreadCount > 0)
                                predicate = criteriaBuilder.and(predicate,
                                        criteriaBuilder.greaterThan(root.get("unreadCount"), 0L));
                            }
                        } catch (IllegalArgumentException e) {
                            continue;
                        }
                        break;
                    case "studentTag":
                        // Convertir a uppercase para consistencia
                        try {
                            String upperCaseTag = value.toUpperCase();
                            // Filtrar por studentTag
                            predicate = criteriaBuilder.and(predicate,
                                    criteriaBuilder.equal(
                                            criteriaBuilder.upper(root.get("studentTag")),
                                            upperCaseTag));
                        } catch (IllegalArgumentException e) {
                            // Si el valor no es válido, ignorar el filtro
                        }
                        break;
                    default:
                        // Para filtros no reconocidos, intentar buscar en el campo directamente
                        try {
                            predicate = criteriaBuilder.and(predicate, 
                                criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get(key)), 
                                    "%" + value.toLowerCase() + "%"
                                )
                            );
                        } catch (IllegalArgumentException e) {
                            // Si el campo no existe, ignorar el filtro
                        }
                        break;
                }
            }

            return predicate;
        };
    }

    private static Specification<StudentConversationEntity> withStudentTypeFilter(Set<String> filterStudentTypeByRole) {
        return (root, query, criteriaBuilder) -> {
            if (filterStudentTypeByRole == null || filterStudentTypeByRole.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            // Crear predicado para ignorar el filtro si conversationType es WAZEND_GROUP
            Predicate isWazendGroup = criteriaBuilder.equal(root.get("conversationType"), ConversationType.WAZEND_GROUP);
            
            // Convertir a uppercase para consistencia
            Set<String> upperCaseTypes = filterStudentTypeByRole.stream()
                    .map(String::toUpperCase)
                    .collect(Collectors.toSet());
            
            // Predicado para el filtro normal de studentTag        
            Predicate studentTagFilter = root.get("studentTag").in(upperCaseTypes);
            
            // Si es WAZEND_GROUP, ignorar el filtro, sino aplicar el filtro
            return criteriaBuilder.or(isWazendGroup, studentTagFilter);
        };
    }
    // Método auxiliar para crear fetch joins cuando sea necesario
    public static Specification<StudentConversationEntity> withFetchJoins() {
        return (root, query, criteriaBuilder) -> {
            if (query.getResultType() != Long.class) {
                root.fetch("wazendInstance", JoinType.LEFT);
            }
            return criteriaBuilder.conjunction();
        };
    }

    private static String removeAccents(String input) {
    return Normalizer.normalize(input, Normalizer.Form.NFD)
                     .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
}
}