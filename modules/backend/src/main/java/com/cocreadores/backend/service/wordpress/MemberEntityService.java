package com.cocreadores.backend.service.wordpress;

import com.cocreadores.backend.dto.update.EntityUpdateResult;
import com.cocreadores.backend.dto.update.MemberUpdateDto;
import com.cocreadores.backend.model.countries.CountriesEntity;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.repository.CountriesRepository;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;

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
public class MemberEntityService {

    private final MemberRepository memberRepository;
    private final CountriesRepository countriesRepository;
    private final StudentConversationRepository studentConversationRepository;

    @Transactional
    public EntityUpdateResult updateOrCreateMembersByCsvId(List<MemberUpdateDto> memberUpdates) {
        int updatedCount = 0;
        int createdCount = 0;

        for (MemberUpdateDto updateDto : memberUpdates) {
            try {
                Optional<MemberEntity> optionalMember = memberRepository.findByCsvId(updateDto.getCsvId());

                if (optionalMember.isPresent()) {
                    // ACTUALIZAR miembro existente
                    MemberEntity member = optionalMember.get();
                    updateMemberFields(member, updateDto);
                    cleanPhoneNumber(member);
                    updateStudentTag(member);
                    memberRepository.save(member);
                    updatedCount++;
                    log.debug("Miembro actualizado con csvId: {}", updateDto.getCsvId());
                } else {
                    // CREAR nuevo miembro
                    MemberEntity newMember = createMemberFromDto(updateDto);
                    cleanPhoneNumber(newMember);
                    MemberEntity memberCreated = memberRepository.save(newMember);
                    updateStudentTag(memberCreated);
                    createdCount++;
                    log.debug("Miembro creado con csvId: {}", updateDto.getCsvId());
                }
            } catch (Exception e) {
                log.error("Error procesando miembro con csvId: {}", updateDto.getCsvId(), e);
                throw new RuntimeException("Error procesando miembro con csvId: " + updateDto.getCsvId(), e);
            }
        }

        return new EntityUpdateResult(updatedCount, createdCount);
    }

    @Transactional
    private void updateStudentTag(MemberEntity member) {
        // Buscar conversación por némero de teléfono
        List<StudentConversationEntity> conversations = studentConversationRepository
                .findAllByPhone(member.getTelefono());
        if (conversations != null && !conversations.isEmpty()) {
            // Actualizar el miembro en la conversación
            for (StudentConversationEntity conversation : conversations) {
                conversation.setMember(member);
                // Actualizar el studentTag del miembro en la conversación
                if (member.getActiveTxnCount() > 0) {
                    conversation.setStudentTag(StudentType.ALUMNO);
                } else {
                    conversation.setStudentTag(StudentType.EX_ALUMNO);
                }
                studentConversationRepository.save(conversation);
                log.debug("Miembro actualizado en conversación con id: {}", conversation.getId());
            }
        } else {
            log.debug("No se encontraron conversaciones para el número de teléfono: {}", member.getTelefono());
        }
    }

    private void cleanPhoneNumber(MemberEntity member) {
        String telefono = member.getTelefono();
        if (telefono != null && telefono.startsWith("+")) {
            // Eliminar el símbolo '+' al principio del número de teléfono
            member.setTelefono(telefono.substring(1));
            log.debug("Número de teléfono limpiado para csvId: {}", member.getCsvId());
        } else {
            log.debug("Número de teléfono no requiere limpieza para csvId: {}", member.getCsvId());
        }
        // Eliminar caracteres no numéricos
        if (telefono != null) {
            String cleanedPhone = telefono.replaceAll("[^0-9]", "");
            if (!cleanedPhone.equals(telefono)) {
                member.setTelefono(cleanedPhone);
                log.debug("Número de teléfono limpiado para csvId: {}", member.getCsvId());
            }
        }
    }

    private MemberEntity createMemberFromDto(MemberUpdateDto updateDto) {
        MemberEntity member = new MemberEntity();

        // Establecer csvId (obligatorio)
        member.setCsvId(updateDto.getCsvId());

        // Establecer campos de texto directamente
        member.setUsername(updateDto.getUsername());
        member.setEmail(updateDto.getEmail());
        member.setName(updateDto.getName());
        member.setFirstName(updateDto.getFirstName());
        member.setLastName(updateDto.getLastName());
        member.setStatus(updateDto.getStatus() != null ? updateDto.getStatus() : "active");
        member.setMemberships(updateDto.getMemberships());
        member.setInactiveMemberships(updateDto.getInactiveMemberships());
        member.setAddressOne(updateDto.getAddressOne());
        member.setAddressTwo(updateDto.getAddressTwo());
        member.setAddressCity(updateDto.getAddressCity());
        member.setAddressState(updateDto.getAddressState());
        member.setAddressZip(updateDto.getAddressZip());
        member.setTelefono(updateDto.getTelefono());
        member.setVatCustomerType(updateDto.getVatCustomerType());
        member.setVatNumber(updateDto.getVatNumber());
        member.setStripeCustomerIdUsd(updateDto.getStripeCustomerIdUsd());

        // Usar los métodos de conversión para campos numéricos con valores por defecto
        member.setTxnCount(updateDto.getTxnCountAsInteger() != null ? updateDto.getTxnCountAsInteger() : 0);
        member.setActiveTxnCount(updateDto.getActiveTxnCountAsInteger() != null ? updateDto.getActiveTxnCountAsInteger() : 0);
        member.setExpiredTxnCount(updateDto.getExpiredTxnCountAsInteger() != null ? updateDto.getExpiredTxnCountAsInteger() : 0);
        member.setTrialTxnCount(updateDto.getTrialTxnCountAsInteger() != null ? updateDto.getTrialTxnCountAsInteger() : 0);
        member.setSubCount(updateDto.getSubCountAsInteger() != null ? updateDto.getSubCountAsInteger() : 0);
        member.setActiveSubCount(updateDto.getActiveSubCountAsInteger() != null ? updateDto.getActiveSubCountAsInteger() : 0);
        member.setPendingSubCount(updateDto.getPendingSubCountAsInteger() != null ? updateDto.getPendingSubCountAsInteger() : 0);
        member.setSuspendedSubCount(updateDto.getSuspendedSubCountAsInteger() != null ? updateDto.getSuspendedSubCountAsInteger() : 0);
        member.setCancelledSubCount(updateDto.getCancelledSubCountAsInteger() != null ? updateDto.getCancelledSubCountAsInteger() : 0);
        member.setLoginCount(updateDto.getLoginCountAsInteger() != null ? updateDto.getLoginCountAsInteger() : 0);

        // BigDecimal (sin valor por defecto, puede ser null)
        member.setTotalSpent(updateDto.getTotalSpentAsBigDecimal());

        // Fechas
        member.setLatestTxnDate(updateDto.getLatestTxnDate());
        member.setFirstTxnDate(updateDto.getFirstTxnDate());
        member.setLastLoginDate(updateDto.getLastLoginDate());
        member.setRegistered(updateDto.getRegistered() != null ? updateDto.getRegistered() : LocalDateTime.now());

        // Establecer país si se proporciona el código
        if (updateDto.getCountryCode() != null) {
            Optional<CountriesEntity> country = countriesRepository.findByCode(updateDto.getCountryCode());
            country.ifPresent(member::setCountry);
        }

        return member;
    }

    private void updateMemberFields(MemberEntity member, MemberUpdateDto updateDto) {
        // Actualizar campos de texto si no están vacíos
        if (isNotEmpty(updateDto.getUsername())) member.setUsername(updateDto.getUsername());
        if (isNotEmpty(updateDto.getEmail())) member.setEmail(updateDto.getEmail());
        if (isNotEmpty(updateDto.getName())) member.setName(updateDto.getName());
        if (isNotEmpty(updateDto.getFirstName())) member.setFirstName(updateDto.getFirstName());
        if (isNotEmpty(updateDto.getLastName())) member.setLastName(updateDto.getLastName());
        if (isNotEmpty(updateDto.getStatus())) member.setStatus(updateDto.getStatus());
        if (isNotEmpty(updateDto.getMemberships())) member.setMemberships(updateDto.getMemberships());
        if (isNotEmpty(updateDto.getInactiveMemberships())) member.setInactiveMemberships(updateDto.getInactiveMemberships());
        if (isNotEmpty(updateDto.getAddressOne())) member.setAddressOne(updateDto.getAddressOne());
        if (isNotEmpty(updateDto.getAddressTwo())) member.setAddressTwo(updateDto.getAddressTwo());
        if (isNotEmpty(updateDto.getAddressCity())) member.setAddressCity(updateDto.getAddressCity());
        if (isNotEmpty(updateDto.getAddressState())) member.setAddressState(updateDto.getAddressState());
        if (isNotEmpty(updateDto.getAddressZip())) member.setAddressZip(updateDto.getAddressZip());
        if (isNotEmpty(updateDto.getTelefono())) member.setTelefono(updateDto.getTelefono());
        if (isNotEmpty(updateDto.getVatCustomerType())) member.setVatCustomerType(updateDto.getVatCustomerType());
        if (isNotEmpty(updateDto.getVatNumber())) member.setVatNumber(updateDto.getVatNumber());
        if (isNotEmpty(updateDto.getStripeCustomerIdUsd())) member.setStripeCustomerIdUsd(updateDto.getStripeCustomerIdUsd());

        // Usar los métodos de conversión para campos numéricos en las actualizaciones
        if (updateDto.getTxnCountAsInteger() != null) member.setTxnCount(updateDto.getTxnCountAsInteger());
        if (updateDto.getActiveTxnCountAsInteger() != null) member.setActiveTxnCount(updateDto.getActiveTxnCountAsInteger());
        if (updateDto.getExpiredTxnCountAsInteger() != null) member.setExpiredTxnCount(updateDto.getExpiredTxnCountAsInteger());
        if (updateDto.getTrialTxnCountAsInteger() != null) member.setTrialTxnCount(updateDto.getTrialTxnCountAsInteger());
        if (updateDto.getSubCountAsInteger() != null) member.setSubCount(updateDto.getSubCountAsInteger());
        if (updateDto.getActiveSubCountAsInteger() != null) member.setActiveSubCount(updateDto.getActiveSubCountAsInteger());
        if (updateDto.getPendingSubCountAsInteger() != null) member.setPendingSubCount(updateDto.getPendingSubCountAsInteger());
        if (updateDto.getSuspendedSubCountAsInteger() != null) member.setSuspendedSubCount(updateDto.getSuspendedSubCountAsInteger());
        if (updateDto.getCancelledSubCountAsInteger() != null) member.setCancelledSubCount(updateDto.getCancelledSubCountAsInteger());
        if (updateDto.getLoginCountAsInteger() != null) member.setLoginCount(updateDto.getLoginCountAsInteger());

        // BigDecimal
        if (updateDto.getTotalSpentAsBigDecimal() != null) member.setTotalSpent(updateDto.getTotalSpentAsBigDecimal());

        // Fechas
        if (updateDto.getLatestTxnDate() != null) member.setLatestTxnDate(updateDto.getLatestTxnDate());
        if (updateDto.getFirstTxnDate() != null) member.setFirstTxnDate(updateDto.getFirstTxnDate());
        if (updateDto.getLastLoginDate() != null) member.setLastLoginDate(updateDto.getLastLoginDate());
        if (updateDto.getRegistered() != null) member.setRegistered(updateDto.getRegistered());

        // Actualizar país si se proporciona el código
        if (isNotEmpty(updateDto.getCountryCode())) {
            Optional<CountriesEntity> country = countriesRepository.findByCode(updateDto.getCountryCode());
            if (country.isPresent()) {
                member.setCountry(country.get());
            } else {
                log.warn("No se encontró país con código: {}", updateDto.getCountryCode());
            }
        }
    }

    // Método utilitario para verificar si un string no está vacío
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}