package com.cocreadores.backend.service.wazend;

import java.util.List;

import com.cocreadores.backend.dto.wazend.WazendInstaceResponseDTO;
import com.cocreadores.backend.dto.wazend.WazendInstaceUpdateDTO;
import com.cocreadores.backend.dto.wazend.WazendInstanceCreateDto;
import com.cocreadores.backend.exception.NotFoundException;
import com.cocreadores.backend.model.user.Role;
import com.cocreadores.backend.model.wazend.WazendInstance;

/**
 * Servicio para la gestión de instancias de Wazend.
 */
interface WazendInstanceService {

    /**
     * Obtiene una instancia de Wazend por su ID.
     *
     * @param id ID de la instancia de Wazend.
     * @return WazendInstaceResponseDTO con los datos de la instancia.
     * @throws NotFoundException 
     */
    public WazendInstance getInstanceForAnotherServicesByInstance(String instance) throws NotFoundException;

    /**
     * Obtiene una instancia de Wazend por su ID.
     *
     * @param id ID de la instancia de Wazend.
     * @return WazendInstaceResponseDTO con los datos de la instancia.
     * @throws NotFoundException 
     */
    public WazendInstance getInstanceForAnotherServices(Long id) throws NotFoundException;
    /**
     * Obtiene una instancia de Wazend por su ID.
     *
     * @param id ID de la instancia de Wazend.
     * @return WazendInstaceResponseDTO con los datos de la instancia.
     * @throws NotFoundException 
     */
    WazendInstaceResponseDTO getInstance(Long id) throws NotFoundException;

    /**
     * Obtiene todas las instancias de Wazend.
     *
     * @return Lista de WazendInstaceResponseDTO.
     */
    List<WazendInstaceResponseDTO> getInstances(List<Role> roleNames);

    /**
     * Crea una nueva instancia de Wazend.
     *
     * @param wazendInstanceCreateDto DTO con los datos para crear la instancia.
     * @return WazendInstaceResponseDTO con los datos de la instancia creada.
     */
    WazendInstaceResponseDTO create(WazendInstanceCreateDto wazendInstanceCreateDto);

    /**
     * Elimina una instancia de Wazend por su ID.
     *
     * @param id ID de la instancia a eliminar.
     * @throws NotFoundException si la instancia no existe.
     */
    void delete(Long id) throws NotFoundException;

    /**
     * Actualiza una instancia de Wazend.
     *
     * @param id ID de la instancia a actualizar.
     * @param wazendInstanceUpdate DTO con los datos a actualizar.
     * @return WazendInstaceResponseDTO con los datos actualizados.
     * @throws NotFoundException si la instancia no existe.
     */
    WazendInstaceResponseDTO update(Long id, WazendInstaceUpdateDTO wazendInstanceUpdate) throws NotFoundException;

}