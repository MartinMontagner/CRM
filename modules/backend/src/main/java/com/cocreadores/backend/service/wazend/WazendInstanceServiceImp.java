package com.cocreadores.backend.service.wazend;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cocreadores.backend.dto.wazend.WazendInstaceResponseDTO;
import com.cocreadores.backend.dto.wazend.WazendInstaceUpdateDTO;
import com.cocreadores.backend.dto.wazend.WazendInstanceCreateDto;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.wazend.WazendInstance;
import com.cocreadores.backend.repository.WazendInstanceRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class WazendInstanceServiceImp implements WazendInstanceService {
    private final WazendInstanceRepository wazendInstanceRepository;

    public WazendInstanceServiceImp(WazendInstanceRepository wazendInstanceRepository) {
        this.wazendInstanceRepository = wazendInstanceRepository;
    }

    @Transactional(readOnly = true)
    @Override
    public WazendInstaceResponseDTO getInstance(Long id) throws NotFoundException {
        Optional<WazendInstance> wazendInstance = wazendInstanceRepository.findById(id);
        if (wazendInstance.isPresent()) {
            return new WazendInstaceResponseDTO(wazendInstance.get());
        }

        if (!wazendInstance.get().getIsActive()) {
            throw new NotFoundException("WazendInstance is not active with id: " + id);
        }

        throw new NotFoundException("WazendInstance not found with id: " + id);
    }

    @Transactional(readOnly = true)
    @Override
    public WazendInstance getInstanceForAnotherServices(Long id) throws NotFoundException {
        Optional<WazendInstance> wazendInstance = wazendInstanceRepository.findById(id);
        if (wazendInstance.isPresent()) {
            return wazendInstance.get();
        }

        throw new NotFoundException("WazendInstance not found with id: " + id);
    }

    @Transactional(readOnly = true)
    @Override
    public WazendInstance getInstanceForAnotherServicesByInstance(String instance) throws NotFoundException {
        Optional<WazendInstance> wazendInstance = wazendInstanceRepository.findByInstance(instance);
        if (wazendInstance.isPresent()) {
            return wazendInstance.get();
        }

        throw new NotFoundException("WazendInstance not found with id: " + instance);
    }

    @Transactional(readOnly = true)
    @Override
    public List<WazendInstaceResponseDTO> getInstances(List<Role> roleNames) {
        List<WazendInstance> wazendInstances = wazendInstanceRepository.findAllByIsActiveTrue();

        return wazendInstances.stream()
                .filter(wazendInstance -> wazendInstance.getAcceptedRoles().stream()
                        .anyMatch(roleNames::contains))
                .distinct()
                .map(WazendInstaceResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public WazendInstaceResponseDTO create(WazendInstanceCreateDto wazendInstanceCreateDto) {
        WazendInstance wazendInstance = new WazendInstance(wazendInstanceCreateDto);
        String server = wazendInstance.getServer();
        if (server.endsWith("/")) {
            wazendInstance.setServer(server.substring(0, server.length() - 1));
        }
        wazendInstanceRepository.save(wazendInstance);
        return new WazendInstaceResponseDTO(wazendInstance);
    }

    @Override
    @Transactional
    public void delete(Long id) throws NotFoundException {
        Optional<WazendInstance> wazendInstance = wazendInstanceRepository.findById(id);
        if (wazendInstance.isEmpty()) {
            throw new NotFoundException("WazendInstance not found with id: ");
        }
        wazendInstance.get().setIsActive(false);
        wazendInstanceRepository.save(wazendInstance.get());
    }

    @Transactional
    @Override
    public WazendInstaceResponseDTO update(Long id, WazendInstaceUpdateDTO wazendInstanceUpdate)
            throws NotFoundException {
        Optional<WazendInstance> wazendInstanceOpt = wazendInstanceRepository.findById(id);
        if (wazendInstanceOpt.isEmpty()) {
            throw new NotFoundException("WazendInstance not found with id: ");
        }

        WazendInstance wazendInstance = wazendInstanceOpt.get();
        if (wazendInstanceUpdate.server() != null) {
            wazendInstance.setServer(wazendInstanceUpdate.server());
        }
        if (wazendInstanceUpdate.name() != null) {
            wazendInstance.setName(wazendInstanceUpdate.name());
        }
        if (wazendInstanceUpdate.instance() != null) {
            wazendInstance.setInstance(wazendInstanceUpdate.instance());
        }
        if (wazendInstanceUpdate.apiKey() != null) {
            wazendInstance.setApiKey(wazendInstanceUpdate.apiKey());
        }
        if (wazendInstanceUpdate.roles() != null) {
            wazendInstance.updateRoles(wazendInstanceUpdate.roles());
        }
        wazendInstanceRepository.save(wazendInstance);

        return new WazendInstaceResponseDTO(wazendInstance);
    }

    public void save(WazendInstance wazendInstance) {
        wazendInstanceRepository.save(wazendInstance);
    }

    public WazendInstance createForAnotherServices(WazendInstance wazendInstance) {
        return wazendInstanceRepository.save(wazendInstance);
    }
}
