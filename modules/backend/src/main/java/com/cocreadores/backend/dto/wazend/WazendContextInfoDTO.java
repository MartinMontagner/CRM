package com.cocreadores.backend.dto.wazend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WazendContextInfoDTO {
    private int expiration;
    private String ephemeralSettingTimestamp;
    private WazendDisappearingModeDTO disappearingMode;
}