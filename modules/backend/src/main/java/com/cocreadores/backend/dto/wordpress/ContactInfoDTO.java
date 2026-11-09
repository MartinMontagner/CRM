package com.cocreadores.backend.dto.wordpress;

import com.cocreadores.backend.model.student.InterestType;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
public class ContactInfoDTO {
    private Long conversationId;
    private String email;
    private String firstName;
    private String lastName;
    private String telefono;
    private String status;
    private String productName;
    private String addressCountry;
    private InterestType interestTag;
    private String note;
    private String activeTxnCount;
    private Integer expiredTxnCount;
    private String lastLoginDate;
    private String registered;
    private Set<CustomTagDTO> customTags;

    public ContactInfoDTO(Long conversationId, String email, String firstName, String lastName,
            String telefono, String status,
            String productName, String addressCountry, InterestType interestTag,
            String note, String activeTxnCount, Integer expiredTxnCount, String lastLoginDate,
            String registered, Set<CustomTagDTO> customTags) {
        this.conversationId = conversationId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.telefono = telefono;
        this.status = status;
        this.productName = productName;
        this.addressCountry = addressCountry;
        this.interestTag = interestTag;
        this.note = note;
        this.activeTxnCount = activeTxnCount;
        this.expiredTxnCount = expiredTxnCount;
        this.lastLoginDate = lastLoginDate;
        this.registered = registered;
        this.customTags = customTags;
    }
}