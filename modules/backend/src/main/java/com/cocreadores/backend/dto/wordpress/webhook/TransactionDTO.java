package com.cocreadores.backend.dto.wordpress.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionDTO {
    private String id;
    @JsonProperty("trans_num")
    private String transNum;
    private String amount;
    private String status;
    @JsonProperty("txn_type")
    private String txnType;
    @JsonProperty("created_at")
    private String createdAt;
    @JsonProperty("expires_at")
    private String expiresAt;
    private MembershipDTO membership;
    private MemberDTO member;
}