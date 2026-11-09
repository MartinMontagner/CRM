package com.cocreadores.backend.dto.wordpress;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class SubscriptionDTO {
    private Long id;
    private Long csvId;
    private String subType;
    private String gateway;
    private String productName;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private BigDecimal price;
    private String periodType;
    private Integer period;

    public SubscriptionDTO(Long id, Long csvId, String subType, String gateway,
                           String productName, String status, LocalDateTime expiresAt,
                           LocalDateTime createdAt, BigDecimal price,
                           String periodType, Integer period) {
        this.id = id;
        this.csvId = csvId;
        this.subType = subType;
        this.gateway = gateway;
        this.productName = productName;
        this.status = status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.price = price;
        this.periodType = periodType;
        this.period = period;
    }
}
