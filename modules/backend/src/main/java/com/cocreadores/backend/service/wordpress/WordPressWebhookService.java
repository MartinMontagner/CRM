package com.cocreadores.backend.service.wordpress;

import com.cocreadores.backend.dto.wordpress.webhook.*;
import com.cocreadores.backend.model.countries.CountriesEntity;
import com.cocreadores.backend.model.wordpress.MemberEntity;
import com.cocreadores.backend.model.wordpress.SubscriptionEntity;
import com.cocreadores.backend.repository.CountriesRepository;
import com.cocreadores.backend.repository.MemberRepository;
import com.cocreadores.backend.repository.SubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Service to handle webhook events from WordPress MemberPress
 */
@Service
@Slf4j
public class WordPressWebhookService {

    private final MemberRepository memberRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CountriesRepository countriesRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    public WordPressWebhookService(MemberRepository memberRepository, SubscriptionRepository subscriptionRepository, CountriesRepository countriesRepository) {
        this.memberRepository = memberRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.countriesRepository = countriesRepository;
    }

    /**
     * Process a new member added event
     */
    @Transactional
    public void processNewMember(MemberAddedDTO memberAddedDTO) {
        log.info("Processing new member: {}", memberAddedDTO.getEmail());

        // Check if member already exists
        Optional<MemberEntity> existingMember = memberRepository.findByEmail(memberAddedDTO.getEmail());

        if (existingMember.isPresent()) {
            log.info("Member already exists, updating information: {}", memberAddedDTO.getEmail());
            updateExistingMember(existingMember.get(), memberAddedDTO);
        } else {
            log.info("Creating new member: {}", memberAddedDTO.getEmail());
            createNewMember(memberAddedDTO);
        }
    }

    /**
     * Update an existing member with new information
     */
    private void updateExistingMember(MemberEntity member, MemberAddedDTO memberAddedDTO) {
        // Update basic information
        member.setFirstName(memberAddedDTO.getFirstName());
        member.setLastName(memberAddedDTO.getLastName());
        member.setName(memberAddedDTO.getDisplayName());
        member.setUsername(memberAddedDTO.getUsername());

        // Update address information if available
        if (memberAddedDTO.getAddress() != null) {
            member.setAddressOne(memberAddedDTO.getAddress().getMeprAddressOne());
            member.setAddressTwo(memberAddedDTO.getAddress().getMeprAddressTwo());
            member.setAddressCity(memberAddedDTO.getAddress().getMeprAddressCity());
            member.setAddressState(memberAddedDTO.getAddress().getMeprAddressState());
            member.setAddressZip(memberAddedDTO.getAddress().getMeprAddressZip());

            // Handle country
            if (memberAddedDTO.getAddress().getMeprAddressCountry() != null && !memberAddedDTO.getAddress().getMeprAddressCountry().isEmpty()) {
                updateCountry(member, memberAddedDTO.getAddress().getMeprAddressCountry());
            }
        }

        // Update phone number if available
        if (memberAddedDTO.getProfile() != null && memberAddedDTO.getProfile().getMeprTelefono() != null) {
            member.setTelefono(memberAddedDTO.getProfile().getMeprTelefono());
        }

        // Update registration date if available and member's registration is null
        if (memberAddedDTO.getRegisteredAt() != null && member.getRegistered() == null) {
            try {
                member.setRegistered(LocalDateTime.parse(memberAddedDTO.getRegisteredAt(), DATE_FORMATTER));
            } catch (Exception e) {
                log.warn("Could not parse registration date: {}", memberAddedDTO.getRegisteredAt());
            }
        }

        memberRepository.save(member);
    }

    /**
     * Create a new member from webhook data
     */
    private void createNewMember(MemberAddedDTO memberAddedDTO) {
        MemberEntity newMember = new MemberEntity();

        // Set basic information
        newMember.setEmail(memberAddedDTO.getEmail());
        newMember.setUsername(memberAddedDTO.getUsername());
        newMember.setFirstName(memberAddedDTO.getFirstName());
        newMember.setLastName(memberAddedDTO.getLastName());
        newMember.setName(memberAddedDTO.getDisplayName());

        // Set address information if available
        if (memberAddedDTO.getAddress() != null) {
            newMember.setAddressOne(memberAddedDTO.getAddress().getMeprAddressOne());
            newMember.setAddressTwo(memberAddedDTO.getAddress().getMeprAddressTwo());
            newMember.setAddressCity(memberAddedDTO.getAddress().getMeprAddressCity());
            newMember.setAddressState(memberAddedDTO.getAddress().getMeprAddressState());
            newMember.setAddressZip(memberAddedDTO.getAddress().getMeprAddressZip());

            // Handle country
            if (memberAddedDTO.getAddress().getMeprAddressCountry() != null && !memberAddedDTO.getAddress().getMeprAddressCountry().isEmpty()) {
                updateCountry(newMember, memberAddedDTO.getAddress().getMeprAddressCountry());
            }
        }

        // Set phone number if available
        if (memberAddedDTO.getProfile() != null && memberAddedDTO.getProfile().getMeprTelefono() != null) {
            newMember.setTelefono(memberAddedDTO.getProfile().getMeprTelefono());
        }

        // Set registration date
        if (memberAddedDTO.getRegisteredAt() != null) {
            try {
                newMember.setRegistered(LocalDateTime.parse(memberAddedDTO.getRegisteredAt(), DATE_FORMATTER));
            } catch (Exception e) {
                log.warn("Could not parse registration date: {}", memberAddedDTO.getRegisteredAt());
                // Default to current time
                newMember.setRegistered(LocalDateTime.now());
            }
        } else {
            newMember.setRegistered(LocalDateTime.now());
        }

        // Initialize counters
        newMember.setTxnCount(0);
        newMember.setActiveTxnCount(0);
        newMember.setExpiredTxnCount(0);
        newMember.setTrialTxnCount(0);
        newMember.setSubCount(0);
        newMember.setActiveSubCount(0);
        newMember.setPendingSubCount(0);
        newMember.setSuspendedSubCount(0);
        newMember.setCancelledSubCount(0);
        newMember.setLoginCount(0);
        newMember.setTotalSpent(BigDecimal.ZERO);

        memberRepository.save(newMember);
    }

    /**
     * Process a subscription creation event
     */
    @Transactional
    public void processSubscriptionCreation(SubscriptionUpdateDTO subscriptionDTO) {
        log.info("Processing subscription creation: {}", subscriptionDTO.getId());

        // Get or create the member
        MemberEntity member = getOrCreateMemberFromDTO(subscriptionDTO.getMember());

        // Create the subscription
        SubscriptionEntity subscription = createOrUpdateSubscription(subscriptionDTO, member);

        // Update member counts
        updateMemberSubscriptionCounts(member);
    }

    /**
     * Process a subscription upgrade event
     */
    @Transactional
    public void processSubscriptionUpgrade(SubscriptionUpdateDTO subscriptionDTO) {
        log.info("Processing subscription upgrade: {}", subscriptionDTO.getId());

        // Get or create the member
        MemberEntity member = getOrCreateMemberFromDTO(subscriptionDTO.getMember());

        // Update the subscription
        createOrUpdateSubscription(subscriptionDTO, member);

        // Update member counts
        updateMemberSubscriptionCounts(member);
    }

    /**
     * Process a subscription stopped event
     */
    @Transactional
    public void processSubscriptionStopped(SubscriptionUpdateDTO subscriptionDTO) {
        log.info("Processing subscription stopped: {}", subscriptionDTO.getId());

        // Find the subscription
        Optional<SubscriptionEntity> existingSubscription = findSubscriptionByDTO(subscriptionDTO);

        if (existingSubscription.isPresent()) {
            SubscriptionEntity subscription = existingSubscription.get();

            // Update status
            subscription.setStatus("cancelled");
            subscriptionRepository.save(subscription);

            // Update member counts
            if (subscription.getMemberEntity() != null) {
                updateMemberSubscriptionCounts(subscription.getMemberEntity());
            }
        } else {
            log.warn("Subscription not found for stopped event: {}", subscriptionDTO.getId());
        }
    }

    /**
     * Process a subscription expired event
     */
    @Transactional
    public void processSubscriptionExpired(SubscriptionUpdateDTO subscriptionDTO) {
        log.info("Processing subscription expired: {}", subscriptionDTO.getId());

        // Find the subscription
        Optional<SubscriptionEntity> existingSubscription = findSubscriptionByDTO(subscriptionDTO);

        if (existingSubscription.isPresent()) {
            SubscriptionEntity subscription = existingSubscription.get();

            // Update status
            subscription.setStatus("expired");
            subscriptionRepository.save(subscription);

            // Update member counts
            if (subscription.getMemberEntity() != null) {
                updateMemberSubscriptionCounts(subscription.getMemberEntity());
            }
        } else {
            log.warn("Subscription not found for expired event: {}", subscriptionDTO.getId());
        }
    }

    /**
     * Process a transaction completed event
     */
    @Transactional
    public void processTransaction(TransactionDTO transactionDTO) {
        log.info("Processing transaction: {}", transactionDTO.getId());

        // Get or create the member
        MemberEntity member = getOrCreateMemberFromDTO(transactionDTO.getMember());

        // Update transaction counts
        if ("complete".equalsIgnoreCase(transactionDTO.getStatus())) {
            // Increment transaction count
            member.setTxnCount(member.getTxnCount() + 1);

            // Update latest transaction date
            try {
                LocalDateTime txnDate = LocalDateTime.parse(transactionDTO.getCreatedAt(), DATE_FORMATTER);

                // Set first transaction date if it's null
                if (member.getFirstTxnDate() == null) {
                    member.setFirstTxnDate(txnDate);
                }

                // Update latest transaction date if newer
                if (member.getLatestTxnDate() == null || txnDate.isAfter(member.getLatestTxnDate())) {
                    member.setLatestTxnDate(txnDate);
                }
            } catch (Exception e) {
                log.warn("Could not parse transaction date: {}", transactionDTO.getCreatedAt());
            }

            // Update total spent
            try {
                BigDecimal amount = new BigDecimal(transactionDTO.getAmount());
                if (member.getTotalSpent() == null) {
                    member.setTotalSpent(amount);
                } else {
                    member.setTotalSpent(member.getTotalSpent().add(amount));
                }
            } catch (Exception e) {
                log.warn("Could not parse transaction amount: {}", transactionDTO.getAmount());
            }

            // Check if this transaction is for an active subscription
            if (transactionDTO.getExpiresAt() != null) {
                try {
                    LocalDateTime expiresAt = LocalDateTime.parse(transactionDTO.getExpiresAt(), DATE_FORMATTER);
                    if (expiresAt.isAfter(LocalDateTime.now())) {
                        // Active transaction
                        member.setActiveTxnCount(member.getActiveTxnCount() + 1);
                    } else {
                        // Expired transaction
                        member.setExpiredTxnCount(member.getExpiredTxnCount() + 1);
                    }
                } catch (Exception e) {
                    log.warn("Could not parse expiration date: {}", transactionDTO.getExpiresAt());
                }
            }

            // Save member updates
            memberRepository.save(member);
        }
    }

    /**
     * Process a member account update event
     */
    @Transactional
    public void processMemberAccountUpdate(MemberAccountUpdatedDTO accountUpdatedDTO) {
        log.info("Processing member account update: {}", accountUpdatedDTO.getEmail());

        // Find the member
        Optional<MemberEntity> existingMember = memberRepository.findByCsvId(Long.valueOf(accountUpdatedDTO.getId()));

        if (existingMember.isPresent()) {
            MemberEntity member = existingMember.get();

            // Update display name
            if (accountUpdatedDTO.getDisplayName() != null) {
                member.setUsername(accountUpdatedDTO.getUsername());
                member.setEmail(accountUpdatedDTO.getEmail());
                member.setName(accountUpdatedDTO.getDisplayName());
                member.setFirstName(accountUpdatedDTO.getFirstName());
                member.setLastName(accountUpdatedDTO.getLastName());

//                member.setActiveTxnCount(Integer.parseInt(accountUpdatedDTO.getActiveTxnCount()));
//                member.setExpiredTxnCount(Integer.parseInt(accountUpdatedDTO.getExpiredTxnCount()));
//                member.setTrialTxnCount(Integer.parseInt(accountUpdatedDTO.getTrialTxnCount()));
//                member.setSubCount(accountUpdatedDTO.getSubCount() != null ? Integer.parseInt(accountUpdatedDTO.getSubCount()) : null);
//                member.setLoginCount(Integer.parseInt(accountUpdatedDTO.getLoginCount()));
            }

            // Update active memberships string
            if (accountUpdatedDTO.getActiveMemberships() != null && !accountUpdatedDTO.getActiveMemberships().isEmpty()) {
                StringBuilder membershipNames = new StringBuilder();
                for (MembershipDTO membership : accountUpdatedDTO.getActiveMemberships()) {
                    if (!membershipNames.isEmpty()) {
                        membershipNames.append(", ");
                    }
                    membershipNames.append(membership.getTitle());
                }
                member.setMemberships(membershipNames.toString());
            }

            memberRepository.save(member);
        } else {
            log.warn("Member not found for account update: {}", accountUpdatedDTO.getEmail());
        }
    }

    /**
     * Find a subscription entity based on the webhook DTO
     */
    private Optional<SubscriptionEntity> findSubscriptionByDTO(SubscriptionUpdateDTO subscriptionDTO) {
        // Try to find by subscription ID first
        if (subscriptionDTO.getSubscrId() != null && !subscriptionDTO.getSubscrId().isEmpty()) {
            Optional<SubscriptionEntity> bySubscrId = subscriptionRepository.findBySubscrId(subscriptionDTO.getSubscrId());
            if (bySubscrId.isPresent()) {
                return bySubscrId;
            }
        }

        // Then try by the ID
        try {
            Long id = Long.parseLong(subscriptionDTO.getId());
            return subscriptionRepository.findByCsvId(id);
        } catch (NumberFormatException e) {
            log.warn("Invalid subscription ID format: {}", subscriptionDTO.getId());
            return Optional.empty();
        }
    }

    /**
     * Get or create a member entity from a MemberDTO in the webhook payload
     */
    private MemberEntity getOrCreateMemberFromDTO(MemberDTO memberDTO) {
        if (memberDTO == null || memberDTO.getEmail() == null) {
            throw new IllegalArgumentException("Member data is missing or invalid");
        }

        Optional<MemberEntity> existingMember = memberRepository.findByCsvId(Long.valueOf(memberDTO.getId()));

        if (existingMember.isPresent()) {
            return existingMember.get();
        } else {
            // Create a new member with basic information
            MemberEntity newMember = new MemberEntity();
            newMember.setEmail(memberDTO.getEmail());
            newMember.setUsername(memberDTO.getUsername());
            newMember.setFirstName(memberDTO.getFirstName());
            newMember.setLastName(memberDTO.getLastName());
            newMember.setName(memberDTO.getDisplayName());
            newMember.setRegistered(LocalDateTime.now());
            newMember.setCsvId(Long.valueOf(memberDTO.getId()));

            // Initialize counters
            newMember.setTxnCount(0);
            newMember.setActiveTxnCount(0);
            newMember.setExpiredTxnCount(0);
            newMember.setTrialTxnCount(0);
            newMember.setSubCount(0);
            newMember.setActiveSubCount(0);
            newMember.setPendingSubCount(0);
            newMember.setSuspendedSubCount(0);
            newMember.setCancelledSubCount(0);
            newMember.setLoginCount(0);
            newMember.setTotalSpent(BigDecimal.ZERO);

            return memberRepository.save(newMember);
        }
    }

    /**
     * Create or update a subscription from webhook data
     */
    private SubscriptionEntity createOrUpdateSubscription(SubscriptionUpdateDTO subscriptionDTO, MemberEntity member) {
        // Try to find existing subscription
        Optional<SubscriptionEntity> existingSubscription = findSubscriptionByDTO(subscriptionDTO);

        SubscriptionEntity subscription;

        if (existingSubscription.isPresent()) {
            subscription = existingSubscription.get();
        } else {
            subscription = new SubscriptionEntity();

            // Try to set ID from webhook data
            try {
                subscription.setCsvId(Long.parseLong(subscriptionDTO.getId()));
            } catch (NumberFormatException e) {
                log.warn("Invalid subscription ID format: {}", subscriptionDTO.getId());
            }
        }

        // Update subscription fields
        subscription.setUserEmail(member.getEmail());
        subscription.setMemberName(member.getName());
        subscription.setFirstName(member.getFirstName());
        subscription.setLastName(member.getLastName());
        subscription.setSubscrId(subscriptionDTO.getSubscrId());
        subscription.setStatus(subscriptionDTO.getStatus());

        // Set price
        try {
            subscription.setPrice(new BigDecimal(subscriptionDTO.getPrice()));
        } catch (Exception e) {
            log.warn("Could not parse subscription price: {}", subscriptionDTO.getPrice());
        }

        // Set period
        try {
            subscription.setPeriod(Integer.parseInt(subscriptionDTO.getPeriod()));
        } catch (Exception e) {
            log.warn("Could not parse subscription period: {}", subscriptionDTO.getPeriod());
        }

        subscription.setPeriodType(subscriptionDTO.getPeriodType());
        boolean isTrial = "1".equals(subscriptionDTO.getTrial());
        subscription.setTrial(isTrial);
        // Set trial days

        try {
            subscription.setTrialDays(Integer.parseInt(subscriptionDTO.getTrialDays()));
        } catch (Exception e) {
            log.warn("Could not parse trial days: {}", subscriptionDTO.getTrialDays());
        }

        // Set product name from membership
        if (subscriptionDTO.getMembership() != null) {
            subscription.setProductName(subscriptionDTO.getMembership().getTitle());

            try {
                subscription.setProductId(Long.parseLong(subscriptionDTO.getMembership().getId()));
            } catch (Exception e) {
                log.warn("Could not parse product ID: {}", subscriptionDTO.getMembership().getId());
            }
        }

        // Set creation date if it's a new subscription
        if (subscription.getCreatedAt() == null) {
            subscription.setCreatedAt(LocalDateTime.now());
        }

        // Link to member
        subscription.setMemberEntity(member);
        member.addSubscription(subscription);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Update membership and transaction counts for a member
     */
    private void updateMemberSubscriptionCounts(MemberEntity member) {
        // Reset counters
        member.setSubCount(0);
        member.setActiveSubCount(0);
        member.setPendingSubCount(0);
        member.setCancelledSubCount(0);
        member.setSuspendedSubCount(0);

        // String builders for active and inactive memberships
        StringBuilder activeMemberships = new StringBuilder();
        StringBuilder inactiveMemberships = new StringBuilder();

        // Count by status
        for (SubscriptionEntity subscription : member.getSubscriptions()) {
            member.setSubCount(member.getSubCount() + 1);

            if (subscription.getStatus() != null) {
                switch (subscription.getStatus().toLowerCase()) {
                    case "active":
                        member.setActiveSubCount(member.getActiveSubCount() + 1);
                        // Add to active memberships string
                        if (subscription.getProductName() != null) {
                            if (activeMemberships.length() > 0) activeMemberships.append(", ");
                            activeMemberships.append(subscription.getProductName());
                        }
                        break;
                    case "pending":
                        member.setPendingSubCount(member.getPendingSubCount() + 1);
                        break;
                    case "suspended":
                        member.setSuspendedSubCount(member.getSuspendedSubCount() + 1);
                        // Add to inactive memberships string
                        if (subscription.getProductName() != null) {
                            if (inactiveMemberships.length() > 0) inactiveMemberships.append(", ");
                            inactiveMemberships.append(subscription.getProductName() + " (Suspended)");
                        }
                        break;
                    case "cancelled":
                        member.setCancelledSubCount(member.getCancelledSubCount() + 1);
                        // Add to inactive memberships string
                        if (subscription.getProductName() != null) {
                            if (inactiveMemberships.length() > 0) inactiveMemberships.append(", ");
                            inactiveMemberships.append(subscription.getProductName() + " (Cancelled)");
                        }
                        break;
                    case "expired":
                        // Add to inactive memberships string
                        if (subscription.getProductName() != null) {
                            if (inactiveMemberships.length() > 0) inactiveMemberships.append(", ");
                            inactiveMemberships.append(subscription.getProductName() + " (Expired)");
                        }
                        break;
                }
            }
        }

        // Update memberships strings
        member.setMemberships(activeMemberships.toString());
        member.setInactiveMemberships(inactiveMemberships.toString());

        memberRepository.save(member);
    }

    /**
     * Update the country of a member
     */
    private void updateCountry(MemberEntity member, String countryCode) {
        if (countryCode != null && !countryCode.isEmpty()) {
            Optional<CountriesEntity> country = countriesRepository.findByCode(countryCode);
            country.ifPresent(member::setCountry);
        }
    }
}
