package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendMessageContextInfoDTO {
    private WazendDeviceListMetadataDTO deviceListMetadata;
    private int deviceListMetadataVersion;
    private String messageSecret;
}