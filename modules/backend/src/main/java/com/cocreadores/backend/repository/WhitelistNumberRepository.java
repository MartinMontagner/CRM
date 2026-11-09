package com.cocreadores.backend.repository;

import com.cocreadores.backend.model.chat.WhitelistNumber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhitelistNumberRepository extends JpaRepository<WhitelistNumber, String> {
}
