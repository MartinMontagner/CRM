package com.cocreadores.backend.controller;

import com.cocreadores.backend.dto.tag.CreateCustomTagDTO;
import com.cocreadores.backend.dto.tag.UpdateCustomTagDTO;
import com.cocreadores.backend.model.student.CustomTag;
import com.cocreadores.backend.service.tag.CustomTagService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/custom-tags")
@CrossOrigin(allowCredentials = "true", originPatterns = "*")
@PreAuthorize("isAuthenticated()")
public class CustomTagController {

    private final CustomTagService customTagService;

    public CustomTagController(CustomTagService customTagService) {
        this.customTagService = customTagService;
    }

    @PostMapping
    public ResponseEntity<CustomTag> createCustomTag(@RequestBody @Valid CreateCustomTagDTO createDto) {
        CustomTag newTag = customTagService.createCustomTag(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newTag);
    }

    @GetMapping
    public ResponseEntity<List<CustomTag>> getAllActiveCustomTags() {
        List<CustomTag> tags = customTagService.getAllActiveCustomTags();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomTag> getActiveCustomTag(@PathVariable Long id) {
        CustomTag customTag = customTagService.getActiveCustomTagById(id);
        return ResponseEntity.ok(customTag);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomTag> updateCustomTag(
            @PathVariable Long id,
            @RequestBody @Valid UpdateCustomTagDTO updateDto) {
        CustomTag updatedTag = customTagService.updateCustomTag(id, updateDto);
        return ResponseEntity.ok(updatedTag);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateCustomTag(@PathVariable Long id) {
        customTagService.deactivateCustomTag(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{conversationId}/available")
    public ResponseEntity<List<CustomTag>> getMethodName(@PathVariable Long conversationId) {
        try {
            List<CustomTag> availableTags = customTagService.getAvailableCustomTagsForConversation(conversationId);
            return ResponseEntity.ok(availableTags);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{conversationId}/add")
    public ResponseEntity<Void> addCustomTagToConversation(
            @PathVariable Long conversationId,
            @RequestBody CustomTag tag) {
        try {
            customTagService.addCustomTagToConversation(conversationId, tag);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{conversationId}/remove")
    public ResponseEntity<Void> removeCustomTagFromConversation(
            @PathVariable Long conversationId,
            @RequestBody CustomTag tag) {
        try {
            customTagService.removeCustomTagFromConversation(conversationId, tag);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
}