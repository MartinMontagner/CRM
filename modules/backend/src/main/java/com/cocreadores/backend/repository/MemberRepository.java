package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.wordpress.MemberEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<MemberEntity, Long>, JpaSpecificationExecutor<MemberEntity> {

    @Query("SELECT DISTINCT m FROM MemberEntity m " +
            "LEFT JOIN FETCH m.subscriptions s " +
            "LEFT JOIN FETCH m.studentConversations c " +
            "LEFT JOIN FETCH m.country")
    List<MemberEntity> findAllWithSubscriptionsAndCountries();

    @Query("SELECT DISTINCT m FROM MemberEntity m " +
            "LEFT JOIN FETCH m.subscriptions " +
            "LEFT JOIN FETCH m.country " +
            "WHERE m.telefono = :phone")
    Optional<MemberEntity> findByTelefonoWithSubscriptionsAndCountry(@Param("phone") String phone);

    Optional<MemberEntity> findByEmail(String email);

    Optional<MemberEntity> findByTelefono(String phoneNumber);

    Optional<MemberEntity> findFirstByTelefonoOrderByLastLoginDateDesc(String phoneNumber);

    @Query("SELECT m FROM MemberEntity m WHERE m.name = ?1 OR CONCAT(m.firstName, ' ', m.lastName) = ?1")
    Optional<MemberEntity> findByFullName(String fullName);

    @Query("SELECT m FROM MemberEntity m WHERE m.telefono = ?1 OR m.name = ?2 OR CONCAT(m.firstName, ' ', m.lastName) = ?2")
    Optional<MemberEntity> findByPhoneOrName(String phoneNumber, String fullName);

    Optional<MemberEntity> findByCsvId(Long id);

    default Page<MemberEntity> findAllWithSpecification(
                    Specification<MemberEntity> spec,
                    Pageable pageable) {
            return findAll(spec, pageable);
    }
}
