package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendDeviceListMetadataDTO {
    private String senderKeyHash;
    private String senderTimestamp;
    private String recipientKeyHash;
    private String recipientTimestamp;
}