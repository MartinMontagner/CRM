package com.cocreadores.backend.model.wordpress;

import com.cocreadores.backend.model.countries.CountriesEntity;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "members", indexes = {
        @Index(name = "idx_telefono", columnList = "telefono"),
        @Index(name = "idx_email", columnList = "email"),
        @Index(name = "idx_first_name", columnList = "first_name"),
        @Index(name = "idx_last_name", columnList = "last_name"),
})
@Getter
@Setter
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "csv_id", unique = true)
    private Long csvId;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "txn_count")
    private Integer txnCount;

    @Column(name = "active_txn_count")
    private Integer activeTxnCount;

    @Column(name = "expired_txn_count")
    private Integer expiredTxnCount;

    @Column(name = "trial_txn_count")
    private Integer trialTxnCount;

    @Column(name = "sub_count")
    private Integer subCount;

    @Column(name = "active_sub_count")
    private Integer activeSubCount;

    @Column(name = "pending_sub_count")
    private Integer pendingSubCount;

    @Column(name = "suspended_sub_count")
    private Integer suspendedSubCount;

    @Column(name = "cancelled_sub_count")
    private Integer cancelledSubCount;

    @Column(name = "latest_txn_date")
    private LocalDateTime latestTxnDate;

    @Column(name = "first_txn_date")
    private LocalDateTime firstTxnDate;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "memberships", length = 1000)
    private String memberships;

    @Column(name = "inactive_memberships", length = 1000)
    private String inactiveMemberships;

    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    @Column(name = "login_count")
    private Integer loginCount;

    @Column(name = "total_spent")
    private BigDecimal totalSpent;

    @Column(name = "registered")
    private LocalDateTime registered;

    // Dirección
    @Column(name = "address_one", length = 255)
    private String addressOne;

    @Column(name = "address_two", length = 255)
    private String addressTwo;

    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_state", length = 100)
    private String addressState;

    @Column(name = "address_zip", length = 20)
    private String addressZip;

    @Column(name = "telefono", length = 50)
    private String telefono;

    @Column(name = "vat_customer_type", length = 50)
    private String vatCustomerType;

    @Column(name = "vat_number", length = 50)
    private String vatNumber;

    @Column(name = "stripe_customer_id_usd", length = 100)
    private String stripeCustomerIdUsd;

    @OneToMany(mappedBy = "memberEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SubscriptionEntity> subscriptions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_country", referencedColumnName = "code")
    private CountriesEntity country;

    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    private Set<StudentConversationEntity> studentConversations = new HashSet<>();

    public void addSubscription(SubscriptionEntity subscription) {
        subscriptions.add(subscription);
        subscription.setMemberEntity(this);
    }

    public String getCountryName() {
        return (country != null) ? country.getName() : "";
    }
}
