package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.countries.CountriesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CountriesRepository extends JpaRepository<CountriesEntity, Long> {
    @Query("SELECT c FROM CountriesEntity c WHERE c.code = :code")
    Optional<CountriesEntity> findByCode(@Param("code") String code);

    List<CountriesEntity> findAllByCodeIn(Collection<String> codes);
}