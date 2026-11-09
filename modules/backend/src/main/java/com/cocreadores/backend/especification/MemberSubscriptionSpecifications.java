package com.cocreadores.backend.especification;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.domain.Specification;

import com.cocreadores.backend.model.countries.CountriesEntity;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.model.wordpress.SubscriptionEntity;

import jakarta.persistence.criteria.*;

public class MemberSubscriptionSpecifications {

    public static Specification<MemberEntity> withFilters(Map<String, List<String>> filters) {
        return Specification.where(
                MemberSubscriptionSpecifications.getWithFilter(filters));
    }

    private static Specification<MemberEntity> getWithFilter(Map<String, List<String>> filters) {
        return (root, query, criteriaBuilder) -> {
            if (filters == null || filters.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            Predicate predicate = criteriaBuilder.conjunction();

            for (Map.Entry<String, List<String>> entry : filters.entrySet()) {
                String key = entry.getKey();
                List<String> values = entry.getValue();

                if (values != null && !values.isEmpty()) {
                    // Ignorar operadores en esta iteración
                    if (key.endsWith("__op")) {
                        continue;
                    }

                    // Obtener el operador si existe
                    String operator = getOperator(filters, key);

                    switch (key) {
                        case "category":
                            predicate = criteriaBuilder.and(predicate,
                                    createCategoryPredicate(root, criteriaBuilder, values));
                            break;
                        case "activeTxnCount":
                            predicate = criteriaBuilder.and(predicate,
                                    createActiveTxnCountPredicate(root, criteriaBuilder, values));
                            break;
                        case "subscriptions":
                            predicate = criteriaBuilder.and(predicate,
                                    createSubscriptionsPredicate(root, criteriaBuilder, values));
                            break;
                        case "addressCountry":
                            predicate = criteriaBuilder.and(predicate,
                                    createCountryPredicate(root, criteriaBuilder, values));
                            break;
                        default:
                            // Filtros genéricos con soporte para múltiples valores y operadores
                            predicate = criteriaBuilder.and(predicate,
                                    createGenericPredicate(root, criteriaBuilder, key, values, operator));
                            break;
                    }
                }
            }
            return predicate;
        };
    }

    private static String getOperator(Map<String, List<String>> filters, String fieldName) {
        List<String> operatorValues = filters.get(fieldName + "__op");
        return (operatorValues != null && !operatorValues.isEmpty()) ? operatorValues.get(0) : "like";
    }

    private static Predicate createCategoryPredicate(Root<MemberEntity> root,
            CriteriaBuilder criteriaBuilder,
            List<String> values) {
        Join<MemberEntity, StudentConversationEntity> conversationJoin = root.join("studentConversations",
                JoinType.LEFT);

        if (values.size() == 1) {
            return criteriaBuilder.equal(conversationJoin.get("studentTag"), values.get(0));
        } else {
            return conversationJoin.get("studentTag").in(values);
        }
    }

    private static Predicate createActiveTxnCountPredicate(Root<MemberEntity> root,
            CriteriaBuilder criteriaBuilder,
            List<String> values) {
        Predicate[] predicates = new Predicate[values.size()];

        for (int i = 0; i < values.size(); i++) {
            String value = values.get(i);
            if ("Con Acceso".equals(value)) {
                predicates[i] = criteriaBuilder.and(
                        criteriaBuilder.isNotNull(root.get("activeTxnCount")),
                        criteriaBuilder.greaterThanOrEqualTo(root.get("activeTxnCount"), 1));
            } else {
                predicates[i] = criteriaBuilder.or(
                        criteriaBuilder.equal(root.get("activeTxnCount"), 0),
                        criteriaBuilder.isNull(root.get("activeTxnCount")));
            }
        }

        return criteriaBuilder.or(predicates);
    }

    private static Predicate createSubscriptionsPredicate(Root<MemberEntity> root,
            CriteriaBuilder criteriaBuilder,
            List<String> values) {
        Join<MemberEntity, SubscriptionEntity> subscriptionJoin = root.join("subscriptions", JoinType.LEFT);

        if (values.size() == 1) {
            return criteriaBuilder.equal(subscriptionJoin.get("productName"), values.get(0));
        } else {
            return subscriptionJoin.get("productName").in(values);
        }
    }

    private static Predicate createCountryPredicate(Root<MemberEntity> root,
            CriteriaBuilder criteriaBuilder,
            List<String> values) {
        Join<MemberEntity, CountriesEntity> countryJoin = root.join("country", JoinType.LEFT);

        if (values.size() == 1) {
            return criteriaBuilder.equal(countryJoin.get("name"), values.get(0));
        } else {
            return countryJoin.get("name").in(values);
        }
    }

    private static Predicate createGenericPredicate(Root<MemberEntity> root,
            CriteriaBuilder criteriaBuilder,
            String fieldName,
            List<String> values,
            String operator) {
        Predicate[] predicates = new Predicate[values.size()];

        for (int i = 0; i < values.size(); i++) {
            String value = values.get(i);

            switch (operator.toLowerCase()) {
                case "equals":
                case "equal":
                    predicates[i] = criteriaBuilder.equal(root.get(fieldName), value);
                    break;
                case "contains":
                case "like":
                default:
                    predicates[i] = criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(fieldName)),
                            "%" + value.toLowerCase() + "%");
                    break;
                case "starts_with":
                case "startsWith":
                    predicates[i] = criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(fieldName)),
                            value.toLowerCase() + "%");
                    break;
                case "ends_with":
                case "endsWith":
                    predicates[i] = criteriaBuilder.like(
                            criteriaBuilder.lower(root.get(fieldName)),
                            "%" + value.toLowerCase());
                    break;
            }
        }

        // Usar OR para múltiples valores del mismo campo
        return criteriaBuilder.or(predicates);
    }
}