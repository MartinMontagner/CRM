package com.cocreadores.backend.dto.wazend;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendDataDTO {
    private WazendKeyDTO key;
    private String pushName;
    private String status;
    private WazendMessageDTO message;
    private WazendContextInfoDTO contextInfo;
    private String messageType;
    @JsonProperty("messageTimestamp")
    private long messageTimestamp;
    @JsonProperty("instanceId")
    private String instanceId;
    private String source;
}