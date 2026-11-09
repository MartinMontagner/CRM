package com.cocreadores.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/status")
@CrossOrigin
@PreAuthorize("permitAll()")
public class StatusController {

    @GetMapping
    public ResponseEntity<Void> getStatus() {
        return ResponseEntity.ok().build();
    }

}
