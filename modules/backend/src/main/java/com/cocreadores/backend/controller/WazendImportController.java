package com.cocreadores.backend.controller;

import com.cocreadores.backend.service.wazend.WazendImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/import")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("permitAll()")
public class WazendImportController {

    private final WazendImportService importService;

    // Directorio para archivos temporales de importación
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir") + "/wazend-imports/";

    @PostMapping("/wazend")
    public ResponseEntity<?> importChatMessages(
            @RequestParam() MultipartFile file,
            @RequestParam(required = false) String instanceId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Archivo no puede estar vacío");
        }

        if (!Objects.requireNonNull(file.getOriginalFilename()).toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().body("Solo se permiten archivos CSV");
        }

        log.info("Iniciando importación de mensajes desde archivo: {}", file.getOriginalFilename());

        try {
            // Crear directorio temporal si no existe
            Path tempDirPath = Paths.get(TEMP_DIR);
            if (!Files.exists(tempDirPath)) {
                Files.createDirectories(tempDirPath);
                log.info("Directorio temporal creado: {}", TEMP_DIR);
            }

            // Guardar archivo con nombre único para evitar conflictos
            String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path tempFilePath = tempDirPath.resolve(uniqueFilename);
            file.transferTo(tempFilePath.toFile());

            log.info("Archivo guardado temporalmente en: {}", tempFilePath);

            String originalFilename = file.getOriginalFilename();

            // Procesar archivo de forma asíncrona
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("Iniciando procesamiento asíncrono de: {}", originalFilename);
                    importService.importChatMessagesFromFile(tempFilePath.toFile(), instanceId);
                    log.info("Importación completada para archivo: {}", originalFilename);
                } catch (Exception e) {
                    log.error("Error en importación de {}: ", originalFilename, e);
                } finally {
                    try {
                        if (Files.deleteIfExists(tempFilePath)) {
                            log.info("Archivo temporal eliminado: {}", tempFilePath);
                        }
                    } catch (IOException e) {
                        log.warn("No se pudo eliminar archivo temporal: {}", tempFilePath, e);
                    }
                }
            });

            return ResponseEntity.accepted().body("Importación iniciada. Procesando en segundo plano.");

        } catch (IOException e) {
            log.error("Error guardando archivo temporal: ", e);
            return ResponseEntity.internalServerError().body("Error procesando el archivo");
        }
    }
}