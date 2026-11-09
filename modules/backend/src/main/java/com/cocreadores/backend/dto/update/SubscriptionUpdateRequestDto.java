package com.cocreadores.backend.dto.update;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class SubscriptionUpdateRequestDto {
    @Valid
    @NotEmpty(message = "La lista de suscripciones no puede estar vacía")
    private List<SubscriptionUpdateDto> subscriptions;
}
