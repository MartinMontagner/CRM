package com.cocreadores.backend.service.assistant;

import com.cocreadores.backend.dto.assistant.AssistantDTO;
import com.cocreadores.backend.repository.AssistantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssistantService {

    private final AssistantRepository assistantRepository;

    public AssistantService(AssistantRepository assistantRepository) {
        this.assistantRepository = assistantRepository;
    }

    public List<AssistantDTO> getAllAssistants() {
        return assistantRepository.findAll().stream()
                .map(assistant -> new AssistantDTO(
                        assistant.getId(),
                        assistant.getLabel(),
                        assistant.getValue()
                ))
                .collect(Collectors.toList());
    }
}
