package com.cocreadores.backend.dto.wordpress.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubscriptionUpdateDTO {
    private String id;
    @JsonProperty("subscr_id")
    private String subscrId;
    private String status;
    private String price;
    private String period;
    @JsonProperty("period_type")
    private String periodType;
    @JsonProperty("trial")
    private String trial;
    @JsonProperty("trial_days")
    private String trialDays;
    private MembershipDTO membership;
    private MemberDTO member;
}