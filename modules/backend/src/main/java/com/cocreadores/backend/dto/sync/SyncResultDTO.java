package com.cocreadores.backend.dto.sync;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class SyncResultDTO {
    public int sentAtCount;
    public List<Long> sentAtIds;
    public int createdAtCount;
    public List<Long> createdAtIds;
    public int nowCount;
    public List<Long> nowIds;
}
