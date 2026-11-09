package com.cocreadores.backend.service.wordpress;

import com.cocreadores.backend.model.countries.CountriesEntity;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.model.wordpress.SubscriptionEntity;
import com.cocreadores.backend.repository.CountriesRepository;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.SubscriptionRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CsvDataLoaderService {

    private final MemberRepository memberRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CountriesRepository countriesRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @PersistenceContext
    private EntityManager entityManager;

    // Configuración para controlar el comportamiento de importación
    @Value("${csv.import.overwrite:false}")
    private boolean overwriteExisting;

    public CsvDataLoaderService(MemberRepository memberRepository, SubscriptionRepository subscriptionRepository, CountriesRepository countriesRepository) {
        this.memberRepository = memberRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.countriesRepository = countriesRepository;
    }

    private Map<String, CountriesEntity> loadCountriesMap() {
        List<CountriesEntity> allCountries = countriesRepository.findAll();
        return allCountries.stream().collect(Collectors.toMap(CountriesEntity::getCode, country -> country));
    }

    @Transactional
    public void loadAllData() {
        try {
            // Si overwriteExisting es false, mantener el comportamiento actual
            if (!overwriteExisting) {
                if (memberRepository.count() > 0 || subscriptionRepository.count() > 0) {
                    System.out.println("Las tablas ya contienen datos y overwriteExisting=false. No se realizará la carga desde CSV.");
                    return;
                }
            }

            System.out.println("Iniciando carga de datos con overwriteExisting=" + overwriteExisting);

            loadCountriesFromCsv();

            // Cargar datos de los CSV en este orden
            List<MemberEntity> members = loadMembersFromCsv();

            // Cargar los números de teléfono
            Map<String, String> phonesByEmail = loadPhonesFromCsv();

            // Aplicar los teléfonos a los miembros
            applyPhonesToMembers(members, phonesByEmail);

            // Procesar miembros según la configuración
            if (overwriteExisting) {
                processMembers(members);
            } else {
                // Comportamiento original: guardar todos los miembros
                final int BATCH_SIZE = 50;
                for (int i = 0; i < members.size(); i += BATCH_SIZE) {
                    int endIndex = Math.min(i + BATCH_SIZE, members.size());
                    memberRepository.saveAll(members.subList(i, endIndex));
                    entityManager.flush();
                    entityManager.clear();
                }
            }

            // Recargar los miembros para tener las entidades actualizadas con sus IDs autogenerados
            List<MemberEntity> freshMembers = memberRepository.findAll();

            // Cargar las suscripciones y asociarlas con los miembros por email
            loadAndAssociateSubscriptions(freshMembers);

            System.out.println("Datos cargados exitosamente desde CSV");
        } catch (Exception e) {
            System.err.println("Error al cargar datos: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al cargar datos iniciales", e);
        }
    }

    /**
     * Procesa los miembros según la configuración de sobrescritura
     * Si overwriteExisting es true, busca por csvId y actualiza o crea
     */
    private void processMembers(List<MemberEntity> members) {
        System.out.println("Procesando " + members.size() + " miembros con sobrescritura habilitada");

        // Obtener todos los miembros existentes y crear un mapa por csvId
        List<MemberEntity> existingMembers = memberRepository.findAll();
        Map<Long, MemberEntity> existingMembersByCsvId = existingMembers.stream()
                .filter(member -> member.getCsvId() != null)
                .collect(Collectors.toMap(MemberEntity::getCsvId, member -> member));

        List<MemberEntity> membersToSave = new ArrayList<>();
        int updatedCount = 0;
        int newCount = 0;

        for (MemberEntity newMember : members) {
            if (newMember.getCsvId() != null) {
                MemberEntity existingMember = existingMembersByCsvId.get(newMember.getCsvId());
                if (existingMember != null) {
                    // Actualizar el miembro existente
                    updateMemberFields(existingMember, newMember);
                    membersToSave.add(existingMember);
                    updatedCount++;
                } else {
                    // Crear nuevo miembro
                    membersToSave.add(newMember);
                    newCount++;
                }
            } else {
                // Si no tiene csvId, crear como nuevo
                membersToSave.add(newMember);
                newCount++;
            }
        }

        // Guardar en lotes
        final int BATCH_SIZE = 50;
        for (int i = 0; i < membersToSave.size(); i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, membersToSave.size());
            memberRepository.saveAll(membersToSave.subList(i, endIndex));
            entityManager.flush();
            entityManager.clear();
        }

        System.out.println("Miembros procesados: " + updatedCount + " actualizados, " + newCount + " nuevos");
    }

    /**
     * Actualiza los campos de un miembro existente con los datos del nuevo miembro
     */
    private void updateMemberFields(MemberEntity existing, MemberEntity newMember) {
        existing.setUsername(newMember.getUsername());
        existing.setEmail(newMember.getEmail());
        existing.setName(newMember.getName());
        existing.setFirstName(newMember.getFirstName());
        existing.setLastName(newMember.getLastName());
        existing.setTxnCount(newMember.getTxnCount());
        existing.setActiveTxnCount(newMember.getActiveTxnCount());
        existing.setExpiredTxnCount(newMember.getExpiredTxnCount());
        existing.setTrialTxnCount(newMember.getTrialTxnCount());
        existing.setSubCount(newMember.getSubCount());
        existing.setActiveSubCount(newMember.getActiveSubCount());
        existing.setPendingSubCount(newMember.getPendingSubCount());
        existing.setSuspendedSubCount(newMember.getSuspendedSubCount());
        existing.setCancelledSubCount(newMember.getCancelledSubCount());
        existing.setLatestTxnDate(newMember.getLatestTxnDate());
        existing.setFirstTxnDate(newMember.getFirstTxnDate());
        existing.setStatus(newMember.getStatus());
        existing.setMemberships(newMember.getMemberships());
        existing.setInactiveMemberships(newMember.getInactiveMemberships());
        existing.setLastLoginDate(newMember.getLastLoginDate());
        existing.setLoginCount(newMember.getLoginCount());
        existing.setTotalSpent(newMember.getTotalSpent());
        existing.setRegistered(newMember.getRegistered());
        existing.setAddressOne(newMember.getAddressOne());
        existing.setAddressTwo(newMember.getAddressTwo());
        existing.setAddressCity(newMember.getAddressCity());
        existing.setCountry(newMember.getCountry());
        existing.setAddressState(newMember.getAddressState());
        existing.setAddressZip(newMember.getAddressZip());
        existing.setTelefono(newMember.getTelefono());
        existing.setVatCustomerType(newMember.getVatCustomerType());
        existing.setVatNumber(newMember.getVatNumber());
        existing.setStripeCustomerIdUsd(newMember.getStripeCustomerIdUsd());
    }

    /**
     * Aplica los números de teléfono a los miembros correspondientes
     */
    private void applyPhonesToMembers(List<MemberEntity> members, Map<String, String> phonesByEmail) {
        // Crear un mapa de email a member para acceso rápido
        Map<String, MemberEntity> membersByEmail = members.stream().collect(Collectors.toMap(MemberEntity::getEmail, member -> member, (existing, replacement) -> existing));

        // Aplicar los teléfonos a los miembros
        for (Map.Entry<String, String> entry : phonesByEmail.entrySet()) {
            String email = entry.getKey();
            String phone = entry.getValue();

            MemberEntity member = membersByEmail.get(email);
            if (member != null && (member.getTelefono() == null || member.getTelefono().isEmpty())) {
                member.setTelefono(phone);
            }
        }
    }

    /**
     * Carga los países desde el CSV de countries.csv
     */
    @Transactional
    public void loadCountriesFromCsv() throws Exception {
        InputStream inputStream = new ClassPathResource("countries.csv").getInputStream();
        List<CountriesEntity> countries = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] data = parseCsvLine(line);
                if (data.length < 3) continue;

                CountriesEntity country = new CountriesEntity();
                country.setId(parseLong(data[0]));
                country.setCode(cleanValue(data[1]));
                country.setName(cleanValue(data[2]));

                countries.add(country);
            }

            countriesRepository.saveAll(countries);
            System.out.println("Países cargados exitosamente: " + countries.size());
        }
    }

    @Transactional
    public List<MemberEntity> loadMembersFromCsv() throws Exception {
        InputStream inputStream = new ClassPathResource("members.csv").getInputStream();
        List<MemberEntity> members = new ArrayList<>();

        Map<String, CountriesEntity> countriesMap = loadCountriesMap();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] data = parseCsvLine(line);
                if (data.length < 30) continue;

                MemberEntity member = mapToMember(data, countriesMap);
                members.add(member);
            }

            return members;
        }
    }

    /**
     * Carga las suscripciones desde el CSV y las asocia con los miembros correspondientes
     * Ahora con soporte para sobrescritura según configuración
     */
    @Transactional
    public void loadAndAssociateSubscriptions(List<MemberEntity> members) throws Exception {
        InputStream inputStream = new ClassPathResource("subscriptions.csv").getInputStream();
        List<SubscriptionEntity> subscriptionsToProcess = new ArrayList<>();

        // Crear un mapa de email a member para acceso rápido
        Map<String, MemberEntity> membersByEmail = members.stream().collect(Collectors.toMap(MemberEntity::getEmail, member -> member, (existing, replacement) -> existing));

        // Si overwriteExisting es true, crear mapa de suscripciones existentes por csvId
        Map<Long, SubscriptionEntity> existingSubscriptionsByCsvId = new HashMap<>();
        if (overwriteExisting) {
            List<SubscriptionEntity> existingSubscriptions = subscriptionRepository.findAll();
            existingSubscriptionsByCsvId = existingSubscriptions.stream()
                    .filter(subscription -> subscription.getCsvId() != null)
                    .collect(Collectors.toMap(SubscriptionEntity::getCsvId, subscription -> subscription));
        }

        Set<Long> processedCsvIds = new HashSet<>();
        int updatedCount = 0;
        int newCount = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] data = parseCsvLine(line);
                if (data.length < 40) continue;

                // Extraer ID y email antes de mapear
                Long subscriptionCsvId = parseLong(data[1]);
                String email = cleanValue(data[2]);

                // Verificar duplicados en el CSV
                if (processedCsvIds.contains(subscriptionCsvId)) {
                    System.out.println("Suscripción duplicada con ID CSV: " + subscriptionCsvId + ". Se omitirá.");
                    continue;
                }

                processedCsvIds.add(subscriptionCsvId);

                SubscriptionEntity newSubscription = mapToSubscription(data);

                // Asociar la suscripción con el miembro correspondiente por email
                if (email != null && !email.isEmpty()) {
                    MemberEntity member = membersByEmail.get(email);
                    if (member != null) {
                        SubscriptionEntity subscriptionToSave;

                        if (overwriteExisting && subscriptionCsvId != null) {
                            SubscriptionEntity existingSubscription = existingSubscriptionsByCsvId.get(subscriptionCsvId);
                            if (existingSubscription != null) {
                                // Actualizar suscripción existente
                                updateSubscriptionFields(existingSubscription, newSubscription);
                                subscriptionToSave = existingSubscription;
                                updatedCount++;
                            } else {
                                // Nueva suscripción
                                member.addSubscription(newSubscription);
                                subscriptionToSave = newSubscription;
                                newCount++;
                            }
                        } else {
                            // Comportamiento original o nueva suscripción
                            member.addSubscription(newSubscription);
                            subscriptionToSave = newSubscription;
                            newCount++;
                        }

                        subscriptionsToProcess.add(subscriptionToSave);
                    } else {
                        System.err.println("Miembro no encontrado para email: " + email);
                    }
                }
            }

            // Procesar en lotes para evitar errores de sesión
            final int BATCH_SIZE = 50;
            for (int i = 0; i < subscriptionsToProcess.size(); i += BATCH_SIZE) {
                int endIndex = Math.min(i + BATCH_SIZE, subscriptionsToProcess.size());
                subscriptionRepository.saveAll(subscriptionsToProcess.subList(i, endIndex));
                entityManager.flush();
                entityManager.clear();
            }

            if (overwriteExisting) {
                System.out.println("Suscripciones procesadas: " + updatedCount + " actualizadas, " + newCount + " nuevas");
            }
        }
    }

    /**
     * Actualiza los campos de una suscripción existente con los datos de la nueva suscripción
     */
    private void updateSubscriptionFields(SubscriptionEntity existing, SubscriptionEntity newSubscription) {
        existing.setSubType(newSubscription.getSubType());
        existing.setUserEmail(newSubscription.getUserEmail());
        existing.setGateway(newSubscription.getGateway());
        existing.setMemberName(newSubscription.getMemberName());
        existing.setFirstName(newSubscription.getFirstName());
        existing.setLastName(newSubscription.getLastName());
        existing.setProductName(newSubscription.getProductName());
        existing.setFirstTxnId(newSubscription.getFirstTxnId());
        existing.setLatestTxnId(newSubscription.getLatestTxnId());
        existing.setExpiringTxnId(newSubscription.getExpiringTxnId());
        existing.setTxnCount(newSubscription.getTxnCount());
        existing.setExpiresAt(newSubscription.getExpiresAt());
        existing.setSubscrId(newSubscription.getSubscrId());
        existing.setUserId(newSubscription.getUserId());
        existing.setProductId(newSubscription.getProductId());
        existing.setCouponId(newSubscription.getCouponId());
        existing.setPrice(newSubscription.getPrice());
        existing.setPeriod(newSubscription.getPeriod());
        existing.setPeriodType(newSubscription.getPeriodType());
        existing.setLimitCycles(newSubscription.getLimitCycles());
        existing.setLimitCyclesNum(newSubscription.getLimitCyclesNum());
        existing.setLimitCyclesAction(newSubscription.getLimitCyclesAction());
        existing.setLimitCyclesExpiresAfter(newSubscription.getLimitCyclesExpiresAfter());
        existing.setLimitCyclesExpiresType(newSubscription.getLimitCyclesExpiresType());
        existing.setProratedTrial(newSubscription.getProratedTrial());
        existing.setTrial(newSubscription.getTrial());
        existing.setTrialDays(newSubscription.getTrialDays());
        existing.setTrialAmount(newSubscription.getTrialAmount());
        existing.setTrialTaxAmount(newSubscription.getTrialTaxAmount());
        existing.setTrialTaxReversalAmount(newSubscription.getTrialTaxReversalAmount());
        existing.setTrialTotal(newSubscription.getTrialTotal());
        existing.setStatus(newSubscription.getStatus());
        existing.setCreatedAt(newSubscription.getCreatedAt());
        existing.setTotal(newSubscription.getTotal());
        existing.setTaxRate(newSubscription.getTaxRate());
        existing.setTaxAmount(newSubscription.getTaxAmount());
        existing.setTaxReversalAmount(newSubscription.getTaxReversalAmount());
        existing.setTaxDesc(newSubscription.getTaxDesc());
        existing.setTaxClass(newSubscription.getTaxClass());
        existing.setCcLast4(newSubscription.getCcLast4());
        existing.setCcExpMonth(newSubscription.getCcExpMonth());
        existing.setCcExpYear(newSubscription.getCcExpYear());
        existing.setToken(newSubscription.getToken());
        existing.setOrderId(newSubscription.getOrderId());
        existing.setMeprStripeCustomerIdRzrbd9n7USD(newSubscription.getMeprStripeCustomerIdRzrbd9n7USD());
        existing.setMeprStripeCustomerIdSpzjfm251USD(newSubscription.getMeprStripeCustomerIdSpzjfm251USD());
        existing.setActive(newSubscription.getActive());
    }

    /**
     * Carga los números de teléfono desde el CSV de formato:
     * La primera columna "Suscriptor" es el email
     * La segunda columna "Whatsapp" es el número de teléfono
     */
    private Map<String, String> loadPhonesFromCsv() throws Exception {
        InputStream inputStream = new ClassPathResource("phones.csv").getInputStream();
        Map<String, String> phonesByEmail = new HashMap<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                // Dividir la línea en columnas
                String[] data = parseCsvLine(line);

                if (data.length >= 2) {
                    // Columna 0: email (Suscriptor), Columna 1: teléfono (Whatsapp)
                    String email = cleanValue(data[0]);
                    String phone = cleanValue(data[1]);

                    // Almacenar el teléfono asociado al email
                    if (!email.isEmpty() && !phone.isEmpty()) {
                        phonesByEmail.put(email, phone);
                    }
                }
            }
        }

        return phonesByEmail;
    }

    private MemberEntity mapToMember(String[] data, Map<String, CountriesEntity> countriesMap) {
        MemberEntity member = new MemberEntity();
        member.setCsvId(parseLong(data[0]));
        member.setUsername(cleanValue(data[1]));
        member.setEmail(cleanValue(data[2]));
        member.setName(cleanValue(data[3]));
        member.setFirstName(cleanValue(data[4]));
        member.setLastName(cleanValue(data[5]));
        member.setTxnCount(parseInt(data[6]));
        member.setActiveTxnCount(parseInt(data[7]));
        member.setExpiredTxnCount(parseInt(data[8]));
        member.setTrialTxnCount(parseInt(data[9]));
        member.setSubCount(parseInt(data[10]));
        member.setActiveSubCount(parseInt(data[11]));
        member.setPendingSubCount(parseInt(data[12]));
        member.setSuspendedSubCount(parseInt(data[13]));
        member.setCancelledSubCount(parseInt(data[14]));
        member.setLatestTxnDate(parseDateTime(data[15]));
        member.setFirstTxnDate(parseDateTime(data[16]));
        member.setStatus(cleanValue(data[17]));
        member.setMemberships(cleanValue(data[18]));
        member.setInactiveMemberships(cleanValue(data[19]));
        member.setLastLoginDate(parseDateTime(data[20]));
        member.setLoginCount(parseInt(data[21]));
        member.setTotalSpent(parseBigDecimal(data[22]));
        member.setRegistered(parseDateTime(data[23]));
        member.setAddressOne(cleanValue(data[24]));
        member.setAddressTwo(cleanValue(data[25]));
        member.setAddressCity(cleanValue(data[26]));
        String countryCode = cleanValue(data[27]); // addressCountry
        if (!countryCode.isEmpty()) {
            CountriesEntity country = countriesMap.get(countryCode);
            if (country != null) {
                member.setCountry(country);
            } else {
                System.err.println("País no encontrado para código: " + countryCode);
            }
        }
        member.setAddressState(cleanValue(data[28]));
        member.setAddressZip(cleanValue(data[29]));
        member.setTelefono(data.length > 30 ? cleanPhoneNumberCSV(cleanValue(data[30])) : "");
        member.setVatCustomerType(data.length > 31 ? cleanValue(data[31]) : "");
        member.setVatNumber(data.length > 32 ? cleanValue(data[32]) : "");
        member.setStripeCustomerIdUsd(data.length > 33 ? cleanValue(data[33]) : "");

        return member;
    }

    private String cleanPhoneNumberCSV(String cleanValue) {
        // Limpiar el número de teléfono eliminando caracteres no numéricos
        return cleanValue.replaceAll("[^0-9]", "");
    }

    private SubscriptionEntity mapToSubscription(String[] data) {
        SubscriptionEntity subscription = new SubscriptionEntity();
        subscription.setSubType(cleanValue(data[0]));
        subscription.setCsvId(parseLong(data[1]));
        subscription.setUserEmail(cleanValue(data[2]));
        subscription.setGateway(cleanValue(data[3]));
        subscription.setMemberName(cleanValue(data[4]));
        subscription.setFirstName(cleanValue(data[5]));
        subscription.setLastName(cleanValue(data[6]));
        subscription.setProductName(cleanValue(data[7]));
        subscription.setFirstTxnId(cleanValue(data[8]));
        subscription.setLatestTxnId(cleanValue(data[9]));
        subscription.setExpiringTxnId(cleanValue(data[10]));
        subscription.setTxnCount(parseInt(data[11]));
        subscription.setExpiresAt(parseDateTime(data[12]));
        subscription.setSubscrId(cleanValue(data[13]));
        subscription.setUserId(parseLong(data[14]));
        subscription.setProductId(parseLong(data[15]));
        subscription.setCouponId(parseLong(data[16]));
        subscription.setPrice(parseBigDecimal(data[17]));
        subscription.setPeriod(parseInt(data[18]));
        subscription.setPeriodType(cleanValue(data[19]));
        subscription.setLimitCycles(parseBoolean(data[20]));
        subscription.setLimitCyclesNum(parseInt(data[21]));
        subscription.setLimitCyclesAction(cleanValue(data[22]));
        subscription.setLimitCyclesExpiresAfter(parseInt(data[23]));
        subscription.setLimitCyclesExpiresType(cleanValue(data[24]));
        subscription.setProratedTrial(parseBoolean(data[25]));
        subscription.setTrial(parseBoolean(data[26]));
        subscription.setTrialDays(parseInt(data[27]));
        subscription.setTrialAmount(parseBigDecimal(data[28]));
        subscription.setTrialTaxAmount(parseBigDecimal(data[29]));
        subscription.setTrialTaxReversalAmount(parseBigDecimal(data[30]));
        subscription.setTrialTotal(parseBigDecimal(data[31]));
        subscription.setStatus(cleanValue(data[32]));
        subscription.setCreatedAt(parseDateTime(data[33]));
        subscription.setTotal(parseBigDecimal(data[34]));
        subscription.setTaxRate(parseBigDecimal(data[35]));
        subscription.setTaxAmount(parseBigDecimal(data[36]));
        subscription.setTaxReversalAmount(parseBigDecimal(data[37]));
        subscription.setTaxDesc(cleanValue(data[38]));
        subscription.setTaxClass(cleanValue(data[39]));
        subscription.setCcLast4(data.length > 40 ? cleanValue(data[40]) : "");
        subscription.setCcExpMonth(data.length > 41 ? cleanValue(data[41]) : "");
        subscription.setCcExpYear(data.length > 42 ? cleanValue(data[42]) : "");
        subscription.setToken(data.length > 43 ? cleanValue(data[43]) : "");
        subscription.setOrderId(data.length > 44 ? cleanValue(data[44]) : "");
        subscription.setMeprStripeCustomerIdRzrbd9n7USD(data.length > 45 ? cleanValue(data[45]) : "");
        subscription.setMeprStripeCustomerIdSpzjfm251USD(data.length > 46 ? cleanValue(data[46]) : "");
        subscription.setActive(data.length > 47 ? cleanValue(data[47]) : "");

        return subscription;
    }

    // Métodos auxiliares
    private String[] parseCsvLine(String line) {
        return line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
    }

    private String cleanValue(String value) {
        if (value == null) return "";
        return value.trim().replaceAll("^\"|\"$", "");
    }

    private Long parseLong(String value) {
        try {
            return Long.parseLong(cleanValue(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseInt(String value) {
        try {
            return Integer.parseInt(cleanValue(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        try {
            String cleaned = cleanValue(value);
            return cleaned.isEmpty() ? null : new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        String cleaned = cleanValue(value).toLowerCase();
        return cleaned.equals("true") || cleaned.equals("1") || cleaned.equals("yes");
    }

    private LocalDateTime parseDateTime(String value) {
        try {
            String cleaned = cleanValue(value);
            return cleaned.isEmpty() ? null : LocalDateTime.parse(cleaned, dateFormatter);
        } catch (Exception e) {
            return null;
        }
    }
}