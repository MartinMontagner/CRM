package com.cocreadores.backend.service.wordpress;


import com.cocreadores.backend.dto.update.EntityUpdateResult;
import com.cocreadores.backend.dto.update.SubscriptionUpdateDto;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.model.wordpress.SubscriptionEntity;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionEntityService {

    private final SubscriptionRepository subscriptionRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public EntityUpdateResult updateOrCreateSubscriptionsByCsvId(List<SubscriptionUpdateDto> subscriptionUpdates) {
        int updatedCount = 0;
        int createdCount = 0;

        for (SubscriptionUpdateDto updateDto : subscriptionUpdates) {
            try {
                Optional<SubscriptionEntity> optionalSubscription = subscriptionRepository.findByCsvId(updateDto.getCsvId());

                if (optionalSubscription.isPresent()) {
                    // ACTUALIZAR suscripción existente
                    SubscriptionEntity subscription = optionalSubscription.get();
                    updateSubscriptionFields(subscription, updateDto);
                    subscriptionRepository.save(subscription);
                    updatedCount++;
                    log.debug("Suscripción actualizada con csvId: {}", updateDto.getCsvId());
                } else {
                    // CREAR nueva suscripción
                    SubscriptionEntity newSubscription = createSubscriptionFromDto(updateDto);
                    subscriptionRepository.save(newSubscription);
                    createdCount++;
                    log.debug("Suscripción creada con csvId: {}", updateDto.getCsvId());
                }
            } catch (Exception e) {
                log.error("Error procesando suscripción con csvId: {}", updateDto.getCsvId(), e);
                throw new RuntimeException("Error procesando suscripción con csvId: " + updateDto.getCsvId(), e);
            }
        }

        return new EntityUpdateResult(updatedCount, createdCount);
    }

    private SubscriptionEntity createSubscriptionFromDto(SubscriptionUpdateDto updateDto) {
        SubscriptionEntity subscription = new SubscriptionEntity();

        // Establecer csvId (obligatorio)
        subscription.setCsvId(updateDto.getCsvId());

        // Establecer todos los campos
        subscription.setSubType(updateDto.getSubType());
        subscription.setUserEmail(updateDto.getUserEmail());
        subscription.setGateway(updateDto.getGateway());
        subscription.setMemberName(updateDto.getMemberName());
        subscription.setFirstName(updateDto.getFirstName());
        subscription.setLastName(updateDto.getLastName());
        subscription.setProductName(updateDto.getProductName());
        subscription.setFirstTxnId(updateDto.getFirstTxnId());
        subscription.setLatestTxnId(updateDto.getLatestTxnId());
        subscription.setExpiringTxnId(updateDto.getExpiringTxnId());
        subscription.setTxnCount(updateDto.getTxnCount() != null ? updateDto.getTxnCount() : 0);
        subscription.setExpiresAt(updateDto.getExpiresAt());
        subscription.setSubscrId(updateDto.getSubscrId());
        subscription.setUserId(updateDto.getUserId());
        subscription.setProductId(updateDto.getProductId());
        subscription.setCouponId(updateDto.getCouponId());
        subscription.setPrice(updateDto.getPrice());
        subscription.setPeriod(updateDto.getPeriod());
        subscription.setPeriodType(updateDto.getPeriodType());

        // Usar los métodos de conversión para campos booleanos
        subscription.setLimitCycles(updateDto.getLimitCyclesAsBoolean() != null ? updateDto.getLimitCyclesAsBoolean() : false);
        subscription.setLimitCyclesNum(updateDto.getLimitCyclesNum());
        subscription.setLimitCyclesAction(updateDto.getLimitCyclesAction());
        subscription.setLimitCyclesExpiresAfter(updateDto.getLimitCyclesExpiresAfter());
        subscription.setLimitCyclesExpiresType(updateDto.getLimitCyclesExpiresType());
        subscription.setProratedTrial(updateDto.getProratedTrialAsBoolean() != null ? updateDto.getProratedTrialAsBoolean() : false);
        subscription.setTrial(updateDto.getTrialAsBoolean() != null ? updateDto.getTrialAsBoolean() : false);

        subscription.setTrialDays(updateDto.getTrialDays() != null ? updateDto.getTrialDays() : 0);
        subscription.setTrialAmount(updateDto.getTrialAmount());
        subscription.setTrialTaxAmount(updateDto.getTrialTaxAmount());
        subscription.setTrialTaxReversalAmount(updateDto.getTrialTaxReversalAmount());
        subscription.setTrialTotal(updateDto.getTrialTotal());
        subscription.setStatus(updateDto.getStatus() != null ? updateDto.getStatus() : "active");
        subscription.setCreatedAt(updateDto.getCreatedAt() != null ? updateDto.getCreatedAt() : LocalDateTime.now());
        subscription.setTotal(updateDto.getTotal());
        subscription.setTaxRate(updateDto.getTaxRate());
        subscription.setTaxAmount(updateDto.getTaxAmount());
        subscription.setTaxReversalAmount(updateDto.getTaxReversalAmount());
        subscription.setTaxDesc(updateDto.getTaxDesc());
        subscription.setTaxClass(updateDto.getTaxClass());
        subscription.setCcLast4(updateDto.getCcLast4());
        subscription.setCcExpMonth(updateDto.getCcExpMonth());
        subscription.setCcExpYear(updateDto.getCcExpYear());
        subscription.setToken(updateDto.getToken());
        subscription.setOrderId(updateDto.getOrderId());
        subscription.setMeprStripeCustomerIdRzrbd9n7USD(updateDto.getMeprStripeCustomerIdRzrbd9n7USD());
        subscription.setMeprStripeCustomerIdSpzjfm251USD(updateDto.getMeprStripeCustomerIdSpzjfm251USD());

        // Usar el método de conversión para el campo active
        subscription.setActive(updateDto.getActive() != null ? updateDto.getActive() : "1");

        // Vincular con miembro si se proporciona el CSV ID del miembro
        if (updateDto.getMemberCsvId() != null) {
            Optional<MemberEntity> member = memberRepository.findByCsvId(updateDto.getMemberCsvId());
            member.ifPresent(subscription::setMemberEntity);
        }

        return subscription;
    }

    private void updateSubscriptionFields(SubscriptionEntity subscription, SubscriptionUpdateDto updateDto) {
        if (isNotEmpty(updateDto.getSubType())) subscription.setSubType(updateDto.getSubType());
        if (isNotEmpty(updateDto.getUserEmail())) subscription.setUserEmail(updateDto.getUserEmail());
        if (isNotEmpty(updateDto.getGateway())) subscription.setGateway(updateDto.getGateway());
        if (isNotEmpty(updateDto.getMemberName())) subscription.setMemberName(updateDto.getMemberName());
        if (isNotEmpty(updateDto.getFirstName())) subscription.setFirstName(updateDto.getFirstName());
        if (isNotEmpty(updateDto.getLastName())) subscription.setLastName(updateDto.getLastName());
        if (isNotEmpty(updateDto.getProductName())) subscription.setProductName(updateDto.getProductName());
        if (isNotEmpty(updateDto.getFirstTxnId())) subscription.setFirstTxnId(updateDto.getFirstTxnId());
        if (isNotEmpty(updateDto.getLatestTxnId())) subscription.setLatestTxnId(updateDto.getLatestTxnId());
        if (isNotEmpty(updateDto.getExpiringTxnId())) subscription.setExpiringTxnId(updateDto.getExpiringTxnId());
        if (updateDto.getTxnCount() != null) subscription.setTxnCount(updateDto.getTxnCount());
        if (updateDto.getExpiresAt() != null) subscription.setExpiresAt(updateDto.getExpiresAt());
        if (isNotEmpty(updateDto.getSubscrId())) subscription.setSubscrId(updateDto.getSubscrId());
        if (updateDto.getUserId() != null) subscription.setUserId(updateDto.getUserId());
        if (updateDto.getProductId() != null) subscription.setProductId(updateDto.getProductId());
        if (updateDto.getCouponId() != null) subscription.setCouponId(updateDto.getCouponId());
        if (updateDto.getPrice() != null) subscription.setPrice(updateDto.getPrice());
        if (updateDto.getPeriod() != null) subscription.setPeriod(updateDto.getPeriod());
        if (isNotEmpty(updateDto.getPeriodType())) subscription.setPeriodType(updateDto.getPeriodType());

        // Usar los métodos de conversión para campos booleanos en las actualizaciones
        if (updateDto.getLimitCyclesAsBoolean() != null) subscription.setLimitCycles(updateDto.getLimitCyclesAsBoolean());
        if (updateDto.getLimitCyclesNum() != null) subscription.setLimitCyclesNum(updateDto.getLimitCyclesNum());
        if (isNotEmpty(updateDto.getLimitCyclesAction())) subscription.setLimitCyclesAction(updateDto.getLimitCyclesAction());
        if (updateDto.getLimitCyclesExpiresAfter() != null) subscription.setLimitCyclesExpiresAfter(updateDto.getLimitCyclesExpiresAfter());
        if (isNotEmpty(updateDto.getLimitCyclesExpiresType())) subscription.setLimitCyclesExpiresType(updateDto.getLimitCyclesExpiresType());
        if (updateDto.getProratedTrialAsBoolean() != null) subscription.setProratedTrial(updateDto.getProratedTrialAsBoolean());
        if (updateDto.getTrialAsBoolean() != null) subscription.setTrial(updateDto.getTrialAsBoolean());

        if (updateDto.getTrialDays() != null) subscription.setTrialDays(updateDto.getTrialDays());
        if (updateDto.getTrialAmount() != null) subscription.setTrialAmount(updateDto.getTrialAmount());
        if (updateDto.getTrialTaxAmount() != null) subscription.setTrialTaxAmount(updateDto.getTrialTaxAmount());
        if (updateDto.getTrialTaxReversalAmount() != null) subscription.setTrialTaxReversalAmount(updateDto.getTrialTaxReversalAmount());
        if (updateDto.getTrialTotal() != null) subscription.setTrialTotal(updateDto.getTrialTotal());
        if (isNotEmpty(updateDto.getStatus())) subscription.setStatus(updateDto.getStatus());
        if (updateDto.getCreatedAt() != null) subscription.setCreatedAt(updateDto.getCreatedAt());
        if (updateDto.getTotal() != null) subscription.setTotal(updateDto.getTotal());
        if (updateDto.getTaxRate() != null) subscription.setTaxRate(updateDto.getTaxRate());
        if (updateDto.getTaxAmount() != null) subscription.setTaxAmount(updateDto.getTaxAmount());
        if (updateDto.getTaxReversalAmount() != null) subscription.setTaxReversalAmount(updateDto.getTaxReversalAmount());
        if (isNotEmpty(updateDto.getTaxDesc())) subscription.setTaxDesc(updateDto.getTaxDesc());
        if (isNotEmpty(updateDto.getTaxClass())) subscription.setTaxClass(updateDto.getTaxClass());
        if (isNotEmpty(updateDto.getCcLast4())) subscription.setCcLast4(updateDto.getCcLast4());
        if (isNotEmpty(updateDto.getCcExpMonth())) subscription.setCcExpMonth(updateDto.getCcExpMonth());
        if (isNotEmpty(updateDto.getCcExpYear())) subscription.setCcExpYear(updateDto.getCcExpYear());
        if (isNotEmpty(updateDto.getToken())) subscription.setToken(updateDto.getToken());
        if (isNotEmpty(updateDto.getOrderId())) subscription.setOrderId(updateDto.getOrderId());
        if (isNotEmpty(updateDto.getMeprStripeCustomerIdRzrbd9n7USD())) subscription.setMeprStripeCustomerIdRzrbd9n7USD(updateDto.getMeprStripeCustomerIdRzrbd9n7USD());
        if (isNotEmpty(updateDto.getMeprStripeCustomerIdSpzjfm251USD())) subscription.setMeprStripeCustomerIdSpzjfm251USD(updateDto.getMeprStripeCustomerIdSpzjfm251USD());
        if (isNotEmpty(updateDto.getActive())) subscription.setActive(updateDto.getActive());

        // Vincular con miembro si se proporciona el CSV ID del miembro
        if (updateDto.getMemberCsvId() != null) {
            Optional<MemberEntity> member = memberRepository.findByCsvId(updateDto.getMemberCsvId());
            if (member.isPresent()) {
                subscription.setMemberEntity(member.get());
            } else {
                log.warn("No se encontró miembro con csvId: {}", updateDto.getMemberCsvId());
            }
        }
    }

    // Método utilitario para verificar si un string no está vacío
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}