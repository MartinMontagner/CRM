package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.chat.ReactionWazend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReactionWazendRepository extends JpaRepository<ReactionWazend, Long> {

}