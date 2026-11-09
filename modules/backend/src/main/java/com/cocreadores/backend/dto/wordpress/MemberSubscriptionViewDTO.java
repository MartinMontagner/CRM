package com.cocreadores.backend.dto.wordpress;

import com.cocreadores.backend.model.student.StudentType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Setter
public class MemberSubscriptionViewDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String addressCountry;
    private String registered;
    private String activeTxnCount;
    private Integer expiredTxnCount;
    private String latestTxnDate;
    private String lastLoginDate;

    @Enumerated(EnumType.STRING)
    private UnreadType chat;

    @Enumerated(EnumType.STRING)
    private StudentType category;

    private List<SubscriptionDTO> subscriptions;

    public MemberSubscriptionViewDTO(Long id, String email, String firstName, String lastName,
                                     String phone, String addressCountry,
                                     String registered, String activeTxnCount,
                                     Integer expiredTxnCount, String latestTxnDate,
                                     String lastLoginDate) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.addressCountry = addressCountry;
        this.registered = registered;
        this.activeTxnCount = activeTxnCount;
        this.expiredTxnCount = expiredTxnCount;
        this.latestTxnDate = latestTxnDate;
        this.lastLoginDate = lastLoginDate;
    }
}