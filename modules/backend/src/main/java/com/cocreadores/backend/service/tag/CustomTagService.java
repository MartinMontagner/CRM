package com.cocreadores.backend.service.tag;

import com.cocreadores.backend.dto.tag.CreateCustomTagDTO;
import com.cocreadores.backend.dto.tag.UpdateCustomTagDTO;
import com.cocreadores.backend.model.student.CustomTag;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.repository.CustomTagRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomTagService {

    private final CustomTagRepository customTagRepository;

    private final StudentConversationRepository studentConversationRepository;

    public CustomTagService(CustomTagRepository customTagRepository,
            StudentConversationRepository studentConversationRepository) {
        this.customTagRepository = customTagRepository;
        this.studentConversationRepository = studentConversationRepository;
    }

    @Transactional
    public CustomTag createCustomTag(CreateCustomTagDTO createDto) {
        CustomTag customTag = new CustomTag();
        customTag.setName(createDto.getName());
        customTag.setColor(createDto.getColor());
        customTag.setStudentTag(createDto.getStudentTag());
        customTag.setEnabled(true);
        customTag.setDark(getDarkMode(createDto.getColor()));
        customTag.setImportant(createDto.isImportant());

        return customTagRepository.save(customTag);
    }

    public List<CustomTag> getAllActiveCustomTags() {
        return customTagRepository.findAllByEnabledTrue();
    }

    public CustomTag getActiveCustomTagById(Long id) {
        return customTagRepository.findActiveById(id)
                .orElseThrow(() -> new EntityNotFoundException("Active CustomTag not found with id: " + id));
    }

    @Transactional
    public CustomTag updateCustomTag(Long id, UpdateCustomTagDTO updateDto) {
        CustomTag customTag = getActiveCustomTagById(id);

        if (updateDto.getName() != null) {
            customTag.setName(updateDto.getName());
        }
        if (updateDto.getColor() != null) {
            customTag.setColor(updateDto.getColor());
            // Actualizar dark mode según el nuevo color
            customTag.setDark(getDarkMode(updateDto.getColor()));
        }
        if (updateDto.getStudentTag() != null) {
            customTag.setStudentTag(updateDto.getStudentTag());
        }
        if (updateDto.getImportant() != null ) {
            customTag.setImportant(updateDto.getImportant());
        }
        if (updateDto.getEnabled() != null) {
            customTag.setEnabled(updateDto.getEnabled());
        }

        System.out.println("CustomTag updated: " + updateDto.toString());
        return customTagRepository.save(customTag);
    }

    @Transactional
    public void deactivateCustomTag(Long id) {
        if (!customTagRepository.existsByIdAndEnabledTrue(id)) {
            throw new EntityNotFoundException("Active CustomTag not found with id: " + id);
        }
        customTagRepository.softDelete(id);
    }

    @Transactional(readOnly = true)
    public List<CustomTag> getAvailableCustomTagsForConversation(Long conversationId) {
        // Obtener las custom tags disponibles cuando la studentTag es similar a la de
        // la conversación
        return customTagRepository.findAvailableTagsForConversation(conversationId);
    }

    @Transactional
    public void addCustomTagToConversation(Long conversationId, CustomTag tag) {
        // Verificar si la etiqueta personalizada existe y está habilitada
        if (!customTagRepository.existsByIdAndEnabledTrue(tag.getId())) {
            throw new EntityNotFoundException("CustomTag not found or not enabled with id: " + tag.getId());
        }
        // Verificar si la conversación existe y guardar la etiqueta personalizada
        StudentConversationEntity conversation = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found with id: " + conversationId));
        // Agregar la etiqueta personalizada a la conversación
        conversation.getCustomTags().add(tag);
        // Guardar la conversación actualizada
        studentConversationRepository.save(conversation);
    }

    @Transactional
    public void removeCustomTagFromConversation(Long conversationId, CustomTag tag) {
        // Verificar si la etiqueta personalizada existe y está habilitada
        if (!customTagRepository.existsByIdAndEnabledTrue(tag.getId())) {
            throw new EntityNotFoundException("CustomTag not found or not enabled with id: " + tag.getId());
        }

        // Verificar si la conversación existe
        StudentConversationEntity conversation = studentConversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found with id: " + conversationId));

        // Eliminar la etiqueta personalizada de la conversación comparando por ID
        conversation.getCustomTags().removeIf(existingTag -> existingTag.getId().equals(tag.getId()));

        // Guardar la conversación actualizada
        studentConversationRepository.save(conversation);
    }

        /**
     * Función simple para determinar si un color es claro u oscuro
     * @param hexColor Color en formato hexadecimal (ej: "#FF5733" o "FF5733")
     * @return true si el color es claro, false si es oscuro
     */
    private boolean isLightColor(String hexColor) {
        // Remover el # si existe
        String hex = hexColor.replace("#", "");
        
        // Convertir a RGB
        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);
        
        // Calcular luminancia (formula simplificada)
        double luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
        
        // Si luminancia > 0.5 es claro, sino es oscuro
        return luminance > 0.5;
    }
    
    /**
     * Función que retorna blanco o negro según el fondo
     * @param backgroundColor Color de fondo en formato hexadecimal
     * @return false para fondos claros, true para fondos oscuros
     */
    private boolean getDarkMode(String backgroundColor) {
        return isLightColor(backgroundColor) ? false : true;
    }
}