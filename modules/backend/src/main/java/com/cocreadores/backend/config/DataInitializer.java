package com.cocreadores.backend.config;

import com.cocreadores.backend.service.wordpress.CsvDataLoaderService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CsvDataLoaderService csvDataLoaderService;

    public DataInitializer(CsvDataLoaderService csvDataLoaderService) {
        this.csvDataLoaderService = csvDataLoaderService;
    }

    @Override
    public void run(String... args) throws Exception {
        csvDataLoaderService.loadAllData();
    }
}