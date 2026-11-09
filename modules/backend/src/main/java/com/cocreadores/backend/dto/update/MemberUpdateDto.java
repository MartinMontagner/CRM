package com.cocreadores.backend.dto.update;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MemberUpdateDto {
    @NotNull(message = "csvId es requerido")
    private Long csvId;

    private String username;
    private String email;
    private String name;
    private String firstName;
    private String lastName;

    // Campos numéricos que pueden llegar como String
    private String txnCount;
    private String activeTxnCount;
    private String expiredTxnCount;
    private String trialTxnCount;
    private String subCount;
    private String activeSubCount;
    private String pendingSubCount;
    private String suspendedSubCount;
    private String cancelledSubCount;
    private String loginCount;

    private LocalDateTime latestTxnDate;
    private LocalDateTime firstTxnDate;
    private String status;
    private String memberships;
    private String inactiveMemberships;
    private LocalDateTime lastLoginDate;

    // BigDecimal que puede llegar como String
    private String totalSpent;

    private LocalDateTime registered;
    private String addressOne;
    private String addressTwo;
    private String addressCity;
    private String addressState;
    private String addressZip;
    private String telefono;
    private String vatCustomerType;
    private String vatNumber;
    private String stripeCustomerIdUsd;
    private String countryCode;

    // Métodos utilitarios para convertir strings a tipos apropiados

    public Integer getTxnCountAsInteger() {
        return parseStringToInteger(this.txnCount);
    }

    public Integer getActiveTxnCountAsInteger() {
        return parseStringToInteger(this.activeTxnCount);
    }

    public Integer getExpiredTxnCountAsInteger() {
        return parseStringToInteger(this.expiredTxnCount);
    }

    public Integer getTrialTxnCountAsInteger() {
        return parseStringToInteger(this.trialTxnCount);
    }

    public Integer getSubCountAsInteger() {
        return parseStringToInteger(this.subCount);
    }

    public Integer getActiveSubCountAsInteger() {
        return parseStringToInteger(this.activeSubCount);
    }

    public Integer getPendingSubCountAsInteger() {
        return parseStringToInteger(this.pendingSubCount);
    }

    public Integer getSuspendedSubCountAsInteger() {
        return parseStringToInteger(this.suspendedSubCount);
    }

    public Integer getCancelledSubCountAsInteger() {
        return parseStringToInteger(this.cancelledSubCount);
    }

    public Integer getLoginCountAsInteger() {
        return parseStringToInteger(this.loginCount);
    }

    public BigDecimal getTotalSpentAsBigDecimal() {
        return parseStringToBigDecimal(this.totalSpent);
    }

    /**
     * Convierte un string a Integer
     * @param value El valor string a convertir
     * @return Integer correspondiente o null si el valor es null, vacío o no es un número válido
     */
    private Integer parseStringToInteger(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            // Log del error si es necesario
            return null;
        }
    }

    /**
     * Convierte un string a BigDecimal
     * @param value El valor string a convertir
     * @return BigDecimal correspondiente o null si el valor es null, vacío o no es un número válido
     */
    private BigDecimal parseStringToBigDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            // Log del error si es necesario
            return null;
        }
    }
}