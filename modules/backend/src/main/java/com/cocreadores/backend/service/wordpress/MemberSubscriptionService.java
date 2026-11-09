package com.cocreadores.backend.service.wordpress;

import com.cocreadores.backend.dto.wordpress.*;
import com.cocreadores.backend.especification.MemberSubscriptionSpecifications;
import com.cocreadores.backend.model.countries.CountriesEntity;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.model.student.InterestType;
import com.cocreadores.backend.model.student.StudentConversationEntity;
import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.model.wordpress.SubscriptionEntity;
import com.cocreadores.backend.repository.CountriesRepository;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.StudentConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MemberSubscriptionService {

    private final MemberRepository memberRepository;
    private final CountriesRepository countriesRepository;
    private final StudentConversationRepository studentConversationRepository;

    public MemberSubscriptionService(MemberRepository memberRepository, CountriesRepository countriesRepository, StudentConversationRepository studentConversationRepository) {
        this.memberRepository = memberRepository;
        this.countriesRepository = countriesRepository;
        this.studentConversationRepository = studentConversationRepository;
    }

    /**
     * Obtiene todos los datos de miembros con suscripciones
     * Utiliza caché para mejorar el rendimiento
     * Ahora incluye información de conversación
     */
    @Cacheable("memberSubscriptionData")
    public List<MemberSubscriptionViewDTO> getCombinedMemberSubscriptionData() {
        // Obtener todos los miembros con sus suscripciones y conversaciones
        List<MemberEntity> members = memberRepository.findAllWithSubscriptionsAndCountries();

        // Crear mapa de respaldo para buscar conversaciones por teléfono
        Map<String, StudentConversationEntity> phoneToConversationMap = createPhoneToConversationMap();

        // Convertir miembros a DTOs
        return members.stream()
                .map(member -> convertToDto(member, phoneToConversationMap))
                .collect(Collectors.toList());
    }

    @Transactional
    public Page<MemberSubscriptionViewDTO> getFilteredWithSpecifications(
            Map<String, List<String>> filters,
            Pageable pageable) {

        Specification<MemberEntity> spec = MemberSubscriptionSpecifications.withFilters(filters);
        Page<MemberEntity> memberPage = memberRepository.findAllWithSpecification(spec, pageable);
        // Convertir la página de entidades a DTOs
        return convertToDto(memberPage);
    }

    // El resto de métodos permanecen igual
    private Page<MemberSubscriptionViewDTO> convertToDto(Page<MemberEntity> memberPage) {
        Page<MemberSubscriptionViewDTO> membersDtoPage = memberPage.map(member -> {
            String acceso = member.getActiveTxnCount() > 0 ? "Con Acceso" : "Sin Acceso";
            String registered = getFormattedDate(member.getRegistered());
            String latestTxnDate = getFormattedDate(member.getLatestTxnDate());
            String lastLoginDate = getFormattedDate(member.getLastLoginDate());
            StudentType studentType = member.getStudentConversations().stream()
                    .filter(conv -> conv.getStudentTag() != null)
                    .map(StudentConversationEntity::getStudentTag)
                    .findFirst()
                    .orElse(null);

            MemberSubscriptionViewDTO dto = new MemberSubscriptionViewDTO(
                    member.getId(),
                    member.getEmail(),
                    member.getFirstName(),
                    member.getLastName(),
                    member.getTelefono(),
                    member.getCountryName(),
                    registered,
                    acceso,
                    member.getExpiredTxnCount(),
                    latestTxnDate,
                    lastLoginDate);

            dto.setCategory(studentType);

            List<SubscriptionDTO> subscriptionDTOs = member.getSubscriptions().stream()
                    .map(this::convertToSubscriptionDto)
                    .sorted((s1, s2) -> {
                        boolean s1Active = "active".equalsIgnoreCase(s1.getStatus());
                        boolean s2Active = "active".equalsIgnoreCase(s2.getStatus());

                        if (s1Active && !s2Active)
                            return -1;
                        if (!s1Active && s2Active)
                            return 1;
                        return 0;
                    })
                    .collect(Collectors.toList());

            dto.setSubscriptions(subscriptionDTOs);

            return dto;
        });
        return membersDtoPage;
    }

    /**
     * Crea un mapa que asocia números de teléfono con conversaciones de estudiantes
     * (como método de respaldo)
     */
    private Map<String, StudentConversationEntity> createPhoneToConversationMap() {
        List<StudentConversationEntity> conversations = studentConversationRepository.findAll();
        return conversations.stream()
                .filter(conv -> conv.getPhone() != null && !conv.getPhone().isEmpty())
                .collect(Collectors.toMap(
                        StudentConversationEntity::getPhone,
                        conv -> conv,
                        (conv1, conv2) -> conv1.getId() > conv2.getId() ? conv1 : conv2
                ));
    }

    /**
     * Convierte la entidad MemberEntity a DTO con sus suscripciones y datos de conversación
     * Intenta usar la relación JPA primero, y si no está disponible, busca por teléfono
     */
    private MemberSubscriptionViewDTO convertToDto(MemberEntity member, Map<String, StudentConversationEntity> phoneToConversationMap) {
        String acceso = member.getActiveTxnCount() > 0 ? "Con Acceso" : "Sin Acceso";
        String registered = getFormattedDate(member.getRegistered());
        String latestTxnDate = getFormattedDate(member.getLatestTxnDate());
        String lastLoginDate = getFormattedDate(member.getLastLoginDate());

        MemberSubscriptionViewDTO dto = new MemberSubscriptionViewDTO(
                member.getId(),
                member.getEmail(),
                member.getFirstName(),
                member.getLastName(),
                member.getTelefono(),
                member.getCountryName(),
                registered,
                acceso,
                member.getExpiredTxnCount(),
                latestTxnDate,
                lastLoginDate
        );

        // Convertir y agregar las suscripciones ordenadas (activas primero)
        List<SubscriptionDTO> subscriptionDTOs = member.getSubscriptions().stream()
                .map(this::convertToSubscriptionDto)
                .sorted((s1, s2) -> {
                    boolean s1Active = "active".equalsIgnoreCase(s1.getStatus());
                    boolean s2Active = "active".equalsIgnoreCase(s2.getStatus());

                    if (s1Active && !s2Active) return -1;
                    if (!s1Active && s2Active) return 1;
                    return 0;
                })
                .collect(Collectors.toList());

        dto.setSubscriptions(subscriptionDTOs);

        // Intentar conseguir la conversación a través de la relación JPA
        StudentConversationEntity conversation = null;

        // Método 1: Intentar a través de la relación JPA (si está disponible y cargada)
        if (member.getStudentConversations() != null && !member.getStudentConversations().isEmpty()) {
            // Tomar la conversación más reciente (ID más alto)
            conversation = member.getStudentConversations().stream()
                    .max(Comparator.comparing(StudentConversationEntity::getId))
                    .orElse(null);
        }

        // Método 2: Si no se encontró por JPA, intentar buscar por teléfono
        if (conversation == null && member.getTelefono() != null && !member.getTelefono().isEmpty()) {
            conversation = phoneToConversationMap.get(member.getTelefono());
        }

        // Si se encontró una conversación, establecer los datos en el DTO
        if (conversation != null) {
            // Establecer el tag de la conversación
            dto.setCategory(conversation.getStudentTag());

            // Determinar el unreadStatus
            if (conversation.isAnswered()) {
                dto.setChat(UnreadType.ANSWERED);
            } else if (conversation.getUnreadCount() != null && conversation.getUnreadCount() > 0) {
                dto.setChat(UnreadType.UNREAD);
            } else {
                dto.setChat(UnreadType.READ);
            }
        }

        return dto;
    }

    /**
     * Formatea la fecha a un string legible
     */
    private String getFormattedDate(LocalDateTime date) {
        if (date == null) {
            return "";
        }
        // Retornar fecha en formato "dd/MM/yyyy HH:mm:ss"
        return date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
    }

    /**
     * Convierte la entidad SubscriptionEntity a DTO
     */
    private SubscriptionDTO convertToSubscriptionDto(SubscriptionEntity subscription) {
        return new SubscriptionDTO(
                subscription.getId(),
                subscription.getCsvId(),
                subscription.getSubType(),
                subscription.getGateway(),
                subscription.getProductName(),
                subscription.getStatus(),
                subscription.getExpiresAt(),
                subscription.getCreatedAt(),
                subscription.getPrice(),
                subscription.getPeriodType(),
                subscription.getPeriod()
        );
    }

    /**
     * Obtiene datos paginados y ordenados con la opción de filtrar
     */
    public Page<MemberSubscriptionViewDTO> getFilteredMemberSubscriptions(
            Map<String, String> filters,
            Pageable pageable) {

        List<MemberSubscriptionViewDTO> allData = getCombinedMemberSubscriptionData();

        // Aplicar filtros si hay alguno
        List<MemberSubscriptionViewDTO> filteredData = filters.isEmpty()
                ? allData
                : applyFilters(allData, filters);

        // Aplicar ordenamiento
        List<MemberSubscriptionViewDTO> sortedData = applySorting(filteredData, pageable);

        // Implementar paginación manual
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), sortedData.size());

        if (start > sortedData.size()) {
            start = 0;
            end = 0;
        }

        List<MemberSubscriptionViewDTO> pageContent = sortedData.subList(start, end);
        return new PageImpl<>(pageContent, pageable, sortedData.size());
    }

    /**
     * Aplica ordenamiento a la lista de miembros según el objeto Pageable
     */
    private List<MemberSubscriptionViewDTO> applySorting(
            List<MemberSubscriptionViewDTO> data,
            Pageable pageable) {

        // Si no hay ordenamiento, devolver la lista original
        if (pageable.getSort().isUnsorted()) {
            return data;
        }

        // Obtener el primer orden (por ahora solo soportamos un criterio de ordenación)
        Sort.Order order = pageable.getSort().iterator().next();
        String property = order.getProperty();
        boolean isAscending = order.getDirection().isAscending();

        return data.stream()
                .sorted((m1, m2) -> {
                    // Comparar según el campo seleccionado
                    int result = compareByProperty(m1, m2, property);
                    // Invertir el resultado si es descendente
                    return isAscending ? result : -result;
                })
                .collect(Collectors.toList());
    }

    /**
     * Compara dos miembros por una propiedad específica
     */
    /**
     * Compara dos miembros por una propiedad específica
     */
    private int compareByProperty(MemberSubscriptionViewDTO m1, MemberSubscriptionViewDTO m2, String property) {
        // Tratamos los null como valores menores
        switch (property) {
            case "email":
                return compareStrings(m1.getEmail(), m2.getEmail());
            case "firstName":
                return compareStrings(m1.getFirstName(), m2.getFirstName());
            case "lastName":
                return compareStrings(m1.getLastName(), m2.getLastName());
            case "phone":
                return compareStrings(m1.getPhone(), m2.getPhone());
            case "addressCountry":
                return compareStrings(m1.getAddressCountry(), m2.getAddressCountry());
            case "status":
                // Obtener el status de la primera suscripción (si existe)
                String status1 = m1.getSubscriptions() != null && !m1.getSubscriptions().isEmpty() ?
                        m1.getSubscriptions().get(0).getStatus() : null;
                String status2 = m2.getSubscriptions() != null && !m2.getSubscriptions().isEmpty() ?
                        m2.getSubscriptions().get(0).getStatus() : null;
                return compareStrings(status1, status2);
            case "subscriptions":
                // Obtener el productName de la primera suscripción (si existe)
                String productName1 = m1.getSubscriptions() != null && !m1.getSubscriptions().isEmpty() ?
                        m1.getSubscriptions().get(0).getProductName() : null;
                String productName2 = m2.getSubscriptions() != null && !m2.getSubscriptions().isEmpty() ?
                        m2.getSubscriptions().get(0).getProductName() : null;
                return compareStrings(productName1, productName2);
            case "activeTxnCount":
                // Convertir "Con Acceso"/"Sin Acceso" a valores numéricos para comparación
                boolean hasAccess1 = "Con Acceso".equals(m1.getActiveTxnCount());
                boolean hasAccess2 = "Con Acceso".equals(m2.getActiveTxnCount());

                if (hasAccess1 && !hasAccess2) return -1;  // "Con Acceso" va después
                if (!hasAccess1 && hasAccess2) return 1;   // "Sin Acceso" va antes
                return 0;
            case "expiredTxnCount":
                // Comparar numéricamente, no como strings
                Integer expiredTxnCount1 = m1.getExpiredTxnCount();
                Integer expiredTxnCount2 = m2.getExpiredTxnCount();
                return compareNumbers(expiredTxnCount1, expiredTxnCount2);
            case "latestTxnDate":
                return compareStrings(m1.getLatestTxnDate(), m2.getLatestTxnDate());
            case "category":
                // Comparar directamente los strings de categoría
                String category1 = m1.getCategory() != null ? m1.getCategory().toString() : null;
                String category2 = m2.getCategory() != null ? m2.getCategory().toString() : null;
                return compareStrings(category1, category2);
            case "registered":
                // Comparar fechas en formato "dd/MM/yyyy HH:mm:ss"
                return compareDates(m1.getRegistered(), m2.getRegistered());
            case "lastLoginDate":
                // Comparar fechas en formato "dd/MM/yyyy HH:mm:ss"
                return compareDates(m1.getLastLoginDate(), m2.getLastLoginDate());

            default:
                return 0; // Sin ordenamiento por defecto
        }
    }


    // Método para comparar números (maneja nulos)
    private int compareNumbers(Integer num1, Integer num2) {
        if (num1 == null && num2 == null) return 0;
        if (num1 == null) return -1;
        if (num2 == null) return 1;
        return num1.compareTo(num2);
    }

    // Método para comparar fechas en formato "dd/MM/yyyy HH:mm:ss"
    private int compareDates(String date1, String date2) {
        if (date1 == null && date2 == null) return 0;
        if (date1 == null) return -1;
        if (date2 == null) return 1;

        try {
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
            Date parsedDate1 = sdf.parse(date1);
            Date parsedDate2 = sdf.parse(date2);
            return parsedDate1.compareTo(parsedDate2);
        } catch (ParseException e) {
            // Si hay un error al parsear, caer en comparación de strings
            return date1.compareTo(date2);
        }
    }

    /**
     * Compara dos strings manejando valores null
     */
    private int compareStrings(String s1, String s2) {
        if (s1 == null && s2 == null) return 0;
        if (s1 == null) return -1;
        if (s2 == null) return 1;
        return s1.compareToIgnoreCase(s2);
    }

    /**
     * Obtiene los detalles de un miembro por su número de teléfono asociado a una conversación
     */
    @Transactional
    public ContactInfoDTO getMemberByConversationByPhone(String telefono, Long conversationId) {
        // Buscar la conversación por el número de teléfono y el ID
        Optional<StudentConversationEntity> conversationOpt = studentConversationRepository
                .findByPhoneWithMemberAndSubscriptions(telefono, conversationId);

        ContactInfoDTO contactInfoDTO = new ContactInfoDTO();
        contactInfoDTO.setTelefono(telefono);

        // Si no se encontró la conversación por teléfono, buscar solo por ID
        if (conversationOpt.isEmpty()) {
            conversationOpt = studentConversationRepository.findById(conversationId);
            if (conversationOpt.isEmpty()) {
                return contactInfoDTO;
            }
        }

        StudentConversationEntity conversation = conversationOpt.get();
        contactInfoDTO.setConversationId(conversation.getId());

        // Verificar si la conversación ya tiene un miembro asignado
        if (conversation.getMember() == null) {
            // Buscar un miembro por teléfono
            Optional<MemberEntity> memberOpt = memberRepository.findFirstByTelefonoOrderByLastLoginDateDesc(telefono);
            if (memberOpt.isPresent()) {
                MemberEntity member = memberOpt.get();
                // Verificar si el miembro tiene transacciones activas
                if (member.getActiveTxnCount() != null && member.getActiveTxnCount() > 0 &&
                        conversation.getConversationType() != ConversationType.WAZEND_GROUP && 
                        conversation.getStudentTag() == null) {
                    conversation.setStudentTag(StudentType.ALUMNO);
                } else if (conversation.getConversationType() != ConversationType.WAZEND_GROUP &&
                        conversation.getStudentTag() == null) {
                    conversation.setStudentTag(StudentType.EX_ALUMNO);
                }
                // Asignar y guardar el miembro en la conversación
                conversation.setMember(member);
                studentConversationRepository.save(conversation);
                contactInfoDTO = convertToContactInfoDTO(member, conversation);
                contactInfoDTO.setConversationId(conversation.getId());
            } else if (conversation.getConversationType() != ConversationType.WAZEND_GROUP &&
                    conversation.getStudentTag() == null) {
                // No se encontró un miembro con el teléfono proporcionado
                conversation.setStudentTag(StudentType.LEAD);
                studentConversationRepository.save(conversation);
                contactInfoDTO.setCustomTags(
                        conversation.getCustomTags() != null ? conversation.getCustomTags().stream()
                                .map(tag -> new CustomTagDTO(
                                        tag.getId(),
                                        tag.getName(),
                                        tag.getColor(),
                                        tag.isEnabled(),
                                        tag.getStudentTag(),
                                        tag.isImportant(),
                                        tag.isDark()))
                                .collect(Collectors.toSet()) : Collections.emptySet());
            }
        } else {
            // Ya tenía un miembro asignado
            contactInfoDTO = convertToContactInfoDTO(conversation.getMember(), conversation);
            contactInfoDTO.setConversationId(conversation.getId());
        }

        return contactInfoDTO;
    }

    /**
     * Convierte la entidad a ContactInfoDTO
     */
    @Transactional(readOnly = true)
    private ContactInfoDTO convertToContactInfoDTO(MemberEntity member, StudentConversationEntity conversation) {
        // Obtener el nombre del producto de la primera suscripción activa, si existe
        String productName = "";
        String status = "";
        InterestType interestType = null;
        String note = "";
        String activeTxnCount = member.getActiveTxnCount() > 0 ? "Con Acceso" : "Sin Acceso";
        // Convertir CustomTag entities a DTOs
        Set<CustomTagDTO> customTagDTOs = Collections.emptySet();
        if (conversation != null && conversation.getCustomTags() != null) {
            customTagDTOs = conversation.getCustomTags().stream()
                    .map(tag -> new CustomTagDTO(
                            tag.getId(),
                            tag.getName(),
                            tag.getColor(),
                            tag.isEnabled(),
                            tag.getStudentTag(),
                            tag.isImportant(),
                            tag.isDark()))
                    .collect(Collectors.toSet());
        }

        if (member.getSubscriptions() != null && !member.getSubscriptions().isEmpty()) {
            // Ordenar suscripciones (activas primero)
            List<SubscriptionEntity> sortedSubscriptions = member.getSubscriptions().stream()
                    .sorted((s1, s2) -> {
                        boolean s1Active = "active".equalsIgnoreCase(s1.getStatus());
                        boolean s2Active = "active".equalsIgnoreCase(s2.getStatus());

                        if (s1Active && !s2Active) return -1;
                        if (!s1Active && s2Active) return 1;
                        return 0;
                    })
                    .collect(Collectors.toList());

            if (conversation != null && conversation.getStudentTag() != null) {
                // Obtener etiqueta de interés y nota de la conversación
                interestType = conversation.getInterestTag();
                note = conversation.getNote();
            } 

            // Usar la primera suscripción (que será activa si existe)
            productName = sortedSubscriptions.get(0).getProductName();
            status = sortedSubscriptions.get(0).getStatus();
        }

        return new ContactInfoDTO(
                conversation == null ? null : conversation.getId(),
                member.getEmail(),
                member.getFirstName(),
                member.getLastName(),
                member.getTelefono(),
                status,
                productName,
                member.getCountryName(),
                interestType,
                note,
                activeTxnCount,
                member.getExpiredTxnCount(),
                formatDate(member.getLastLoginDate()),
                formatDate(member.getRegistered()),
                customTagDTOs
        );
    }

    private String formatDate(LocalDateTime date) {
        if (date == null) {
            return "";
        }
        // Retornar fecha en formato "dd MMMM, yyyy"
        return date.format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM, yyyy"));
    }

    @Transactional
    public ContactInfoDTO updateMemberContactInfo(String email, UpdateContactInfoDTO updateDTO) {
        Optional<MemberEntity> memberOpt = memberRepository.findByEmail(email);

        if (memberOpt.isEmpty()) {
            throw new RuntimeException("Member not found with email: " + email);
        }

        MemberEntity member = memberOpt.get();

        // Actualizar campos permitidos
        if (updateDTO.getFirstName() != null) {
            member.setFirstName(updateDTO.getFirstName());
        }
        if (updateDTO.getLastName() != null) {
            member.setLastName(updateDTO.getLastName());
        }
        if (updateDTO.getTelefono() != null) {
            member.setTelefono(updateDTO.getTelefono());
        }

        // Actualizar país con la relación
        if (updateDTO.getAddressCountry() != null) {
            // Buscar entidad Country por código
            Optional<CountriesEntity> countryOpt = countriesRepository.findByCode(updateDTO.getAddressCountry());
            if (countryOpt.isPresent()) {
                // Establecer la relación con el país
                member.setCountry(countryOpt.get());
            } else {
                throw new RuntimeException("Country not found with code: " + updateDTO.getAddressCountry());
            }
        }

        // Guardar los cambios
        MemberEntity updatedMember = memberRepository.save(member);

        // Convertir a DTO para la respuesta
        return convertToContactInfoDTO(updatedMember, null);
    }

    /**
     * Aplica filtros a la lista de miembros con soporte para diferentes operadores
     */
    private List<MemberSubscriptionViewDTO> applyFilters(
            List<MemberSubscriptionViewDTO> data,
            Map<String, String> filters) {

        // Eliminar parámetros de paginación de los filtros
        Map<String, String> actualFilters = filters.entrySet().stream()
                .filter(entry -> !entry.getKey().equals("page") && !entry.getKey().equals("size") &&
                        !entry.getKey().equals("sort") && !entry.getKey().contains("__op"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        if (actualFilters.isEmpty()) {
            return data;
        }

        return data.stream()
                .filter(member -> matchesAllFilters(member, actualFilters, filters))
                .collect(Collectors.toList());
    }

    /**
     * Verifica si un miembro coincide con todos los filtros
     * Ahora incluye soporte para diferentes operadores
     */
    private boolean matchesAllFilters(
            MemberSubscriptionViewDTO member,
            Map<String, String> filters,
            Map<String, String> allParams) {

        return filters.entrySet().stream()
                .allMatch(entry -> {
                    String field = entry.getKey();
                    String value = entry.getValue();
                    // Obtener el operador si existe
                    String operator = allParams.getOrDefault(field + "__op", "contains");

                    return matchesFilter(member, field, value, operator);
                });
    }


    /**
     * Verifica si un miembro coincide con un filtro específico
     * Soporta todos los campos de MemberSubscriptionViewDTO y múltiples operadores de comparación
     */
    private boolean matchesFilter(
            MemberSubscriptionViewDTO member,
            String field,
            String value,
            String operator) {

        // Log para depuración
        System.out.println("Aplicando filtro: " + field + "=" + value + " con operador: " + operator);

        if (value == null || value.isEmpty()) {
            return true;
        }

        String lowercaseValue = value.toLowerCase();
        String memberValue = null;

        // Caso especial para studentTag/category que son enumeraciones
        if (field.equals("studentTag") || field.equals("category")) {
            if (member.getCategory() == null) {
                // Si la categoría es null y estamos buscando SIN_CATEGORIA
                return "sin_categoria".equalsIgnoreCase(lowercaseValue);
            }

            // Comparar el nombre de la enumeración directamente
            String categoryName = member.getCategory().name();

            // Para el operador equals, hacer una comparación exacta ignorando el caso
            if ("equals".equalsIgnoreCase(operator)) {
                return categoryName.equalsIgnoreCase(value);
            }

            // Para otros operadores, usar la lógica normal con el nombre de la enumeración
            memberValue = categoryName;
        } else {
            switch (field) {
                case "id":
                    memberValue = member.getId() != null ? member.getId().toString() : null;
                    break;
                case "email":
                    memberValue = member.getEmail();
                    break;
                case "firstName":
                    memberValue = member.getFirstName();
                    break;
                case "lastName":
                    memberValue = member.getLastName();
                    break;
                case "telefono":
                case "phone":
                    memberValue = member.getPhone();
                    break;
                case "chat":
                    if (member.getChat() != null) {
                        return member.getChat().name().equalsIgnoreCase(value);
                    }
                    return "".equals(value);
                case "addressCountry":
                    memberValue = member.getAddressCountry();
                    break;
                case "registered":
                    memberValue = member.getRegistered();
                    break;
                case "activeTxnCount":
                    memberValue = member.getActiveTxnCount();
                    break;
                case "expiredTxnCount":
                    memberValue = member.getExpiredTxnCount() != null ? member.getExpiredTxnCount().toString() : null;
                    break;
                case "latestTxnDate":
                    memberValue = member.getLatestTxnDate();
                    break;
                case "lastLoginDate":
                    memberValue = member.getLastLoginDate();
                    break;
                // Manejar el caso específico del filtro "status" que viene del frontend
                case "status":
                    // Buscar el status en cualquiera de las suscripciones
                    if (member.getSubscriptions() != null && !member.getSubscriptions().isEmpty()) {
                        // Devuelve true si alguna suscripción coincide con el filtro
                        return member.getSubscriptions().stream()
                                .map(SubscriptionDTO::getStatus)
                                .filter(s -> s != null)
                                .anyMatch(status -> matchValueWithNormalization(status, value, operator));
                    }
                    return false;

                case "subscription":
                case "subscriptions": // Añadir este caso para manejar el parámetro plural
                case "productName":
                    // Buscar el productName en cualquiera de las suscripciones
                    if (member.getSubscriptions() != null && !member.getSubscriptions().isEmpty()) {
                        // Devuelve true si alguna suscripción coincide con el filtro
                        return member.getSubscriptions().stream()
                                .map(SubscriptionDTO::getProductName)
                                .filter(p -> p != null)
                                .anyMatch(product -> matchValueWithNormalization(product, value, operator));
                    }
                    return false;
                default:
                    return true; // Campo desconocido, no filtrar
            }
        }

        if (memberValue == null) {
            return false;
        }

        // Usar el método de comparación con normalización para todos los campos de texto
        return matchValueWithNormalization(memberValue, value, operator);
    }

    /**
     * Compara dos strings teniendo en cuenta la normalización de acentos
     */
    private boolean matchValueWithNormalization(String memberValue, String filterValue, String operator) {
        if (memberValue == null) return false;
        if (filterValue == null) return true;

        // Convertir ambos a minúsculas para comparación insensible a mayúsculas
        String normalizedMemberValue = memberValue.toLowerCase();
        String normalizedFilterValue = filterValue.toLowerCase();

        // Normalizar cadenas (eliminar acentos para comparación)
        normalizedMemberValue = java.text.Normalizer.normalize(normalizedMemberValue, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}", "");
        normalizedFilterValue = java.text.Normalizer.normalize(normalizedFilterValue, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}", "");


        switch (operator.toLowerCase()) {
            case "equals":
                return normalizedMemberValue.equals(normalizedFilterValue);
            case "contains":
                return normalizedMemberValue.contains(normalizedFilterValue);
            case "startswith":
                return normalizedMemberValue.startsWith(normalizedFilterValue);
            case "endswith":
                return normalizedMemberValue.endsWith(normalizedFilterValue);
            default:
                // Por defecto usar contains
                return normalizedMemberValue.contains(normalizedFilterValue);
        }
    }

    

    private boolean matchValue(String memberValue, String filterValue, String operator) {
        switch (operator.toLowerCase()) {
            case "equals":
                return memberValue.equals(filterValue);
            case "contains":
                return memberValue.contains(filterValue);
            case "startswith":
                return memberValue.startsWith(filterValue);
            case "endswith":
                return memberValue.endsWith(filterValue);
            default:
                // Por defecto usar contains
                return memberValue.contains(filterValue);
        }
    }

    /**
     * Parse una fecha en formato dd/MM/yyyy HH:mm:ss
     */
    private LocalDateTime parseDate(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr,
                    java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public ContactInfoDTO updateMemberContactInfoByConversationId(Long conversationId, UpdateContactInfoDTO updateDTO) {
        // Buscar la conversación por ID con el miembro precargado (join fetch)
        Optional<StudentConversationEntity> conversationOpt = studentConversationRepository.findByIdWithMember(conversationId);

        if (conversationOpt.isEmpty()) {
            throw new RuntimeException("Conversation not found with ID: " + conversationId);
        }

        StudentConversationEntity conversation = conversationOpt.get();

        // Verificar que la conversación tenga un miembro asociado
        if (conversation.getMember() == null) {
            throw new RuntimeException("No member associated with conversation ID: " + conversationId);
        }

        MemberEntity member = conversation.getMember();

        // Actualizar campos permitidos
        if (updateDTO.getFirstName() != null) {
            member.setFirstName(updateDTO.getFirstName());
        }
        if (updateDTO.getLastName() != null) {
            member.setLastName(updateDTO.getLastName());
        }
        if (updateDTO.getTelefono() != null) {
            member.setTelefono(updateDTO.getTelefono());
        }
        if (updateDTO.getNote() != null) {
            conversation.setNote(updateDTO.getNote());
        }

        // Actualizar país con la relación
        if (updateDTO.getAddressCountry() != null) {
            // Buscar entidad Country por código
            Optional<CountriesEntity> countryOpt = countriesRepository.findByCode(updateDTO.getAddressCountry());
            if (countryOpt.isPresent()) {
                // Establecer la relación con el país
                member.setCountry(countryOpt.get());
            } else {
                throw new RuntimeException("Country not found with code: " + updateDTO.getAddressCountry());
            }
        }

        // Guardar los cambios
        MemberEntity updatedMember = memberRepository.save(member);

        // Actualizar el nombre en la conversación si se actualizó el nombre del miembro
        if (updateDTO.getFirstName() != null || updateDTO.getLastName() != null) {
            String newFullName = (updateDTO.getFirstName() != null ? updateDTO.getFirstName() : member.getFirstName()) + " " +
                    (updateDTO.getLastName() != null ? updateDTO.getLastName() : member.getLastName());
            conversation.setFullName(newFullName.trim());
        }
        // Guardar la conversación actualizada
        studentConversationRepository.save(conversation);

        // Convertir a DTO para la respuesta
        ContactInfoDTO infoDTO = convertToContactInfoDTO(updatedMember, conversation);
        infoDTO.setConversationId(conversationId);

        return infoDTO;
    }
}