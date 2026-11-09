package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.wazend.WazendInstance;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface StudentConversationRepository extends
                JpaRepository<StudentConversationEntity, Long>,
                JpaSpecificationExecutor<StudentConversationEntity> {

        @Query("SELECT s.fullName FROM StudentConversationEntity s WHERE s.phone = :phoneNumber")
        Optional<String> findFullNameByPhone(@Param("phoneNumber") String phoneNumber);

        @Query("SELECT sc FROM StudentConversationEntity sc WHERE sc.phone = :cleanPhone and sc.conversationType = com.cocreadores.backend.model.student.ConversationType.WHATSAPP")
        Optional<StudentConversationEntity> findByPhone(String cleanPhone);

        Optional<StudentConversationEntity> findByPhoneAndWazendInstanceAndConversationType(String phone,
                        WazendInstance wazendInstance, ConversationType conversationType);

        Optional<StudentConversationEntity> findByPhoneAndConversationType(String phone,
                        ConversationType conversationType);

        Optional<StudentConversationEntity> findByPhoneAndInstanceIdServer(String phone, String instanceId);

        @Query("SELECT sc FROM StudentConversationEntity sc " +
                        "LEFT JOIN FETCH sc.member m " +
                        "LEFT JOIN FETCH m.subscriptions " +
                        "WHERE sc.phone = :phone AND sc.id = :conversationId")
        Optional<StudentConversationEntity> findByPhoneWithMemberAndSubscriptions(@Param("phone") String phone, @Param("conversationId") Long conversationId);

        @Modifying
        @Query("UPDATE StudentConversationEntity s SET s.answered = :answered, s.unreadCount = :unreadCount WHERE s.id = :id")
        void updateAnsweredStatusAndUnreadCount(@Param("id") Long id, @Param("answered") boolean answered,
                        @Param("unreadCount") int unreadCount);

        @Modifying
        @Query("UPDATE StudentConversationEntity s SET s.answered = :answered WHERE s.id = :id")
        void updateAnsweredStatus(@Param("id") Long id, @Param("answered") boolean answered);

        @Query("SELECT sc FROM StudentConversationEntity sc LEFT JOIN FETCH sc.member WHERE sc.id = :id")
        Optional<StudentConversationEntity> findByIdWithMember(@Param("id") Long id);

        @Query("SELECT s.fullName FROM StudentConversationEntity s WHERE s.phone = :phoneNumber AND s.wazendInstance = :wazendInstance AND s.instanceIdServer = :instanceIdServer")
        Optional<String> findFullNameByPhoneAndWazendInstanceAndInstanceIdServer(
                        @Param("phoneNumber") String phoneNumber,
                        @Param("wazendInstance") WazendInstance wazendInstance,
                        @Param("instanceIdServer") String instanceIdServer);

        @Query("SELECT s.fullName FROM StudentConversationEntity s WHERE s.phone = :phoneNumber AND s.wazendInstance = :wazendInstance")
        Optional<String> findFullNameByPhoneAndWazendInstance(
                        @Param("phoneNumber") String phoneNumber,
                        @Param("wazendInstance") WazendInstance wazendInstance);

        @Query("SELECT s.fullName FROM StudentConversationEntity s WHERE s.phone = :phoneNumber AND s.instanceIdServer = :instanceIdServer")
        Optional<String> findFullNameByPhoneAndInstanceIdServer(
                        @Param("phoneNumber") String phoneNumber,
                        @Param("instanceIdServer") String instanceIdServer);

        @Query("SELECT s FROM StudentConversationEntity s LEFT JOIN FETCH s.wazendInstance")
        List<StudentConversationEntity> findAllWithWazendInstance();

        @Query("SELECT sc FROM StudentConversationEntity sc LEFT JOIN FETCH sc.wazendInstance WHERE " +
                        "sc.updatedAt IS NOT NULL AND " +
                        "(:search IS NULL OR :search = '' OR " +
                        "LOWER(sc.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(sc.phone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "AND (:conversationType IS NULL OR sc.conversationType = :conversationType) " +
                        "AND sc.conversationType IS NOT NULL" +
                        " AND (:filterStudentType IS NULL OR sc.studentTag = :filterStudentType)")
        Page<StudentConversationEntity> findAllWithWazendInstance(Pageable pageable, @Param("search") String search,
                        @Param("conversationType") ConversationType conversationType, @Param("filterStudentType") String filterStudentType);

        @Query("SELECT s FROM StudentConversationEntity s WHERE s.phone = :phoneNumber AND s.wazendInstance = :instance")
        Optional<StudentConversationEntity> findByPhoneAndWazendInstance(String phoneNumber, WazendInstance instance);

        @Query("SELECT s FROM StudentConversationEntity s WHERE s.updatedAt IS NULL")
        List<StudentConversationEntity> findWhereUpdatedAtIsNull();

        // Metodos con especificaciones

        @Query("SELECT sc FROM StudentConversationEntity sc LEFT JOIN FETCH sc.wazendInstance " +
                        "WHERE sc IN (SELECT s FROM StudentConversationEntity s WHERE (:spec IS NULL OR :spec = true))")
        Page<StudentConversationEntity> findAllWithWazendInstanceAndSpec(
                        Specification<StudentConversationEntity> spec,
                        Pageable pageable,
                        @Param("spec") Boolean specParam);

        // Método más limpio para Specifications (recomendado)
        default Page<StudentConversationEntity> findAllWithSpecification(
                        Specification<StudentConversationEntity> spec,
                        Pageable pageable) {
                return findAll(spec, pageable);
        }

        @Query("SELECT sc FROM StudentConversationEntity sc " +
                        "WHERE sc.phone = :phone")
        List<StudentConversationEntity> findAllByPhone(@Param("phone") String phone);

}
