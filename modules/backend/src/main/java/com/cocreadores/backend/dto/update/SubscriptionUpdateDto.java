package com.cocreadores.backend.dto.update;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SubscriptionUpdateDto {
    @NotNull(message = "csvId es requerido")
    private Long csvId;

    private String subType;
    private String userEmail;
    private String gateway;
    private String memberName;
    private String firstName;
    private String lastName;
    private String productName;
    private String firstTxnId;
    private String latestTxnId;
    private String expiringTxnId;
    private Integer txnCount;
    private LocalDateTime expiresAt;
    private String subscrId;
    private Long userId;
    private Long productId;
    private Long couponId;
    private BigDecimal price;
    private Integer period;
    private String periodType;

    // Campos booleanos como String para manejar "0" y "1"
    private String limitCycles;
    private Integer limitCyclesNum;
    private String limitCyclesAction;
    private Integer limitCyclesExpiresAfter;
    private String limitCyclesExpiresType;
    private String proratedTrial;
    private String trial;

    private Integer trialDays;
    private BigDecimal trialAmount;
    private BigDecimal trialTaxAmount;
    private BigDecimal trialTaxReversalAmount;
    private BigDecimal trialTotal;
    private String status;
    private LocalDateTime createdAt;
    private BigDecimal total;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal taxReversalAmount;
    private String taxDesc;
    private String taxClass;
    private String ccLast4;
    private String ccExpMonth;
    private String ccExpYear;
    private String token;
    private String orderId;
    private String meprStripeCustomerIdRzrbd9n7USD;
    private String meprStripeCustomerIdSpzjfm251USD;
    private String active;
    private Long memberCsvId;

    // Métodos utilitarios para convertir strings a booleanos
    public Boolean getLimitCyclesAsBoolean() {
        return parseStringToBoolean(this.limitCycles);
    }

    public Boolean getProratedTrialAsBoolean() {
        return parseStringToBoolean(this.proratedTrial);
    }

    public Boolean getTrialAsBoolean() {
        return parseStringToBoolean(this.trial);
    }

    public Boolean getActiveAsBoolean() {
        return parseStringToBoolean(this.active);
    }

    /**
     * Convierte un string ("0", "1", "true", "false") a Boolean
     * @param value El valor string a convertir
     * @return Boolean correspondiente o null si el valor es null o vacío
     */
    private Boolean parseStringToBoolean(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalizedValue = value.trim().toLowerCase();

        // Manejar casos numéricos
        if ("1".equals(normalizedValue) || "true".equals(normalizedValue)) {
            return true;
        } else if ("0".equals(normalizedValue) || "false".equals(normalizedValue)) {
            return false;
        }

        // Si no es un valor reconocido, retornar null
        return null;
    }
}