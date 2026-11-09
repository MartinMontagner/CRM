package com.cocreadores.backend.dto.wordpress.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MemberAccountUpdatedDTO {
    private String id;
    private String email;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("display_name")
    private String displayName;

    private String username;

    @JsonProperty("active_memberships")
    private List<MembershipDTO> activeMemberships;

    @JsonProperty("active_txn_count")
    private String activeTxnCount;

    @JsonProperty("expired_txn_count")
    private String expiredTxnCount;

    @JsonProperty("trial_txn_count")
    private String trialTxnCount;

    @JsonProperty("sub_count")
    private String subCount;

    @JsonProperty("login_count")
    private String loginCount;
}