package com.cocreadores.backend.model.wordpress;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
public class SubscriptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "csv_id", unique = true)
    private Long csvId;

    @Column(name = "sub_type", length = 50)
    private String subType;

    @Column(name = "user_email", length = 255)
    private String userEmail;

    @Column(name = "gateway", length = 50)
    private String gateway;

    @Column(name = "member_name", length = 255)
    private String memberName;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "product_name", length = 255)
    private String productName;

    @Column(name = "first_txn_id", length = 50)
    private String firstTxnId;

    @Column(name = "latest_txn_id", length = 50)
    private String latestTxnId;

    @Column(name = "expiring_txn_id", length = 50)
    private String expiringTxnId;

    @Column(name = "txn_count")
    private Integer txnCount;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "subscr_id", length = 100)
    private String subscrId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "coupon_id")
    private Long couponId;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "period")
    private Integer period;

    @Column(name = "period_type", length = 20)
    private String periodType;

    @Column(name = "limit_cycles")
    private Boolean limitCycles;

    @Column(name = "limit_cycles_num")
    private Integer limitCyclesNum;

    @Column(name = "limit_cycles_action", length = 50)
    private String limitCyclesAction;

    @Column(name = "limit_cycles_expires_after")
    private Integer limitCyclesExpiresAfter;

    @Column(name = "limit_cycles_expires_type", length = 20)
    private String limitCyclesExpiresType;

    @Column(name = "prorated_trial")
    private Boolean proratedTrial;

    @Column(name = "trial")
    private Boolean trial;

    @Column(name = "trial_days")
    private Integer trialDays;

    @Column(name = "trial_amount", precision = 10, scale = 2)
    private BigDecimal trialAmount;

    @Column(name = "trial_tax_amount", precision = 10, scale = 2)
    private BigDecimal trialTaxAmount;

    @Column(name = "trial_tax_reversal_amount", precision = 10, scale = 2)
    private BigDecimal trialTaxReversalAmount;

    @Column(name = "trial_total", precision = 10, scale = 2)
    private BigDecimal trialTotal;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "tax_reversal_amount", precision = 10, scale = 2)
    private BigDecimal taxReversalAmount;

    @Column(name = "tax_desc", length = 255)
    private String taxDesc;

    @Column(name = "tax_class", length = 100)
    private String taxClass;

    @Column(name = "cc_last4", length = 4)
    private String ccLast4;

    @Column(name = "cc_exp_month", length = 2)
    private String ccExpMonth;

    @Column(name = "cc_exp_year", length = 4)
    private String ccExpYear;

    @Column(name = "token", length = 255)
    private String token;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(name = "_mepr_stripe_customer_id_rzrbd9-n7_USD", length = 255)
    private String meprStripeCustomerIdRzrbd9n7USD;

    @Column(name = "_mepr_stripe_customer_id_spzjfm-251_USD", length = 255)
    private String meprStripeCustomerIdSpzjfm251USD;

    @Column(name = "active")
    private String active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity memberEntity;
}