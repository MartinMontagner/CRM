package com.cocreadores.backend.repository;

import com.cocreadores.backend.config.WhitelistConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhitelistConfigRepository extends JpaRepository<WhitelistConfig, String> {
}