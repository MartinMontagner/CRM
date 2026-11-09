package com.cocreadores.backend.service.student;

import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.InterestType;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.repository.ChatMessageRepository;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;
import com.cocreadores.backend.service.chat.MessageLoggerService;
import com.cocreadores.backend.service.wazend.WazendInstanceServiceImp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class StudentConversationService {

    @Autowired
    StudentConversationRepository studentConversationRepository;

    @Autowired
    ChatMessageRepository chatMessageRepository;

    @Autowired
    MessageLoggerService messageLoggerService;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    WazendInstanceServiceImp wazendInstanceService;

    @Transactional()
    public void updateConversationTag(Long conversationId, String tag) throws NotFoundException {
        StudentConversationEntity studentConversation = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con el id: " + conversationId));

        if (tag != null) {
            String normalizedTag = tag.trim().toUpperCase();
            if (normalizedTag.equals("LEAD") || normalizedTag.equals("ALUMNO") || normalizedTag.equals("EX_ALUMNO") ){
                studentConversation.setStudentTag(StudentType.valueOf(normalizedTag));
            } else {
                studentConversation.setStudentTag(null);
            }
        } else {
            studentConversation.setStudentTag(null);
        }

        studentConversationRepository.save(studentConversation);
    }

    @Transactional
    public void updateConversationName(Long conversationId, String name) throws NotFoundException {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        }

        StudentConversationEntity student = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con el id: " + conversationId));

        student.setFullName(name.trim());
        studentConversationRepository.save(student);
    }

    public void setAnalisis(String phoneNumber, String suggestion) throws NotFoundException {
        StudentConversationEntity student = studentConversationRepository.findByPhone(phoneNumber)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con el número: " + phoneNumber));
        student.setAnalisis(suggestion);
        studentConversationRepository.save(student);
    }

    @Transactional
    public void markConversationAsRead(Long conversationId) throws NotFoundException {
        StudentConversationEntity conversation = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversación no encontrada con ID: " + conversationId));

        // Reset unread count
        conversation.setUnreadCount(0L);
        studentConversationRepository.save(conversation);

        // Notify changes through WebSocket
        messageLoggerService.notifyChanges(conversation);

        // Get the updated conversation
    }

    @Transactional
    public void associateMemberToConversation(Long conversationId, Long memberId) throws NotFoundException {
        // Buscar la conversación por ID
        StudentConversationEntity conversation = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversación no encontrada con ID: " + conversationId));

        // Buscar el miembro por ID
        MemberEntity member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Miembro no encontrado con ID: " + memberId));

        // Establecer la relación bidireccional
        conversation.setMember(member);

        // Asegurarse de que la colección de conversaciones del miembro esté
        // inicializada
        if (member.getStudentConversations() == null) {
            member.setStudentConversations(new HashSet<>());
        }

        member.getStudentConversations().add(conversation);

        memberRepository.save(member);
        studentConversationRepository.save(conversation);

        // Notificar cambios a través de WebSocket
        // messageLoggerService.notifyChanges();

        // Devolver la conversación actualizada como DTO
    }

    @Transactional
    public void updateConversationInterestTag(Long conversationID, String interestTag)
            throws NotFoundException {
        StudentConversationEntity studentConversation = studentConversationRepository.findById(conversationID)
                .orElseThrow(() -> new NotFoundException("Conversación no encontrada con ID: " + conversationID));

        if (interestTag != null) {
            String normalizedTag = interestTag.trim().toUpperCase();
            try {
                studentConversation.setInterestTag(InterestType.valueOf(normalizedTag));
            } catch (IllegalArgumentException e) {
                studentConversation.setInterestTag(null);
                log.warn("Tipo de interés no válido: {}", normalizedTag);
            }
        } else {
            studentConversation.setInterestTag(null);
        }
        studentConversationRepository.save(studentConversation);
    }

    @Transactional
    public void removeConversationInterestTag(Long conversationID) throws NotFoundException {
        StudentConversationEntity studentConversation = studentConversationRepository.findById(conversationID)
                .orElseThrow(() -> new NotFoundException("Conversación no encontrada con ID: " + conversationID));

        studentConversation.setInterestTag(null);
        studentConversationRepository.save(studentConversation);
    }

    public Page<StudentConversationEntity> findAllWithSpecification(Specification<StudentConversationEntity> specification, Pageable pageable){
        return studentConversationRepository.findAllWithSpecification(specification, pageable);
    }

    @Transactional
    public void assignTagsToConversations() {
        List<StudentConversationEntity> conversations = studentConversationRepository.findAll();
        for (StudentConversationEntity conversation : conversations) {
            if (conversation.getStudentTag() != null && conversation.getConversationType() == ConversationType.WAZEND_GROUP) {
                conversation.setStudentTag(null);
                studentConversationRepository.save(conversation);
            }
            if (conversation.getPhone() != null && !conversation.getPhone().isEmpty()
                    && conversation.getConversationType() != ConversationType.WAZEND_GROUP) {
                // Verificcar si existe un miembro asociado a esa conversación
                if (conversation.getMember() != null) {
                    // Verificar si el miembro tiene transacciones activas
                    if (conversation.getMember().getActiveTxnCount() > 0) {
                        // Asignar el tag ALUMNO
                        conversation.setStudentTag(StudentType.ALUMNO);
                    } else {
                        // Asignar el tag EX_ALUMNO
                        conversation.setStudentTag(StudentType.EX_ALUMNO);
                    }
                } else {
                    // Si no hay un miembro asociado buscar por el número de teléfono
                    Optional<MemberEntity> member = memberRepository.findFirstByTelefonoOrderByLastLoginDateDesc(conversation.getPhone());
                    if (member.isPresent()) {
                        // Si se encuentra un miembro por teléfono, asignarlo a la conversación
                        conversation.setMember(member.get());
                        // Verificar si el miembro tiene transacciones activas
                        if (member.get().getActiveTxnCount() > 0) {
                            // Asignar el tag ALUMNO
                            conversation.setStudentTag(StudentType.ALUMNO);
                        } else {
                            // Asignar el tag EX_ALUMNO
                            conversation.setStudentTag(StudentType.EX_ALUMNO);
                        }
                    } else {
                        // Asignar el tag LEAD
                        conversation.setStudentTag(StudentType.LEAD);
                    }
                }
                // Guardar los cambios en la conversación
                studentConversationRepository.save(conversation);
            }
        }
    }
}
