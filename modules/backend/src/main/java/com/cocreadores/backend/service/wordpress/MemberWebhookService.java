package com.cocreadores.backend.service.wordpress;

import com.cocreadores.backend.dto.wordpress.webhook.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to handle webhook events from WordPress MemberPress
 * This service delegates to wordPressWebhookService for actual processing
 */
@Service
@Slf4j
public class MemberWebhookService {

    private final WordPressWebhookService wordPressWebhookService;

    @Autowired
    public MemberWebhookService(WordPressWebhookService wordPressWebhookService) {
        this.wordPressWebhookService = wordPressWebhookService;
    }

    /**
     * Process a new member added event
     */
    @Transactional
    public void processNewMember(MemberAddedDTO memberAddedDTO) {
        log.debug("Delegating member-added event to wordPressWebhookService");
        wordPressWebhookService.processNewMember(memberAddedDTO);
    }

    /**
     * Process a subscription creation event
     */
    @Transactional
    public void processSubscriptionCreation(SubscriptionUpdateDTO subscriptionDTO) {
        log.debug("Delegating subscription-created event to wordPressWebhookService");
        wordPressWebhookService.processSubscriptionCreation(subscriptionDTO);
    }

    /**
     * Process a subscription upgrade event
     */
    @Transactional
    public void processSubscriptionUpgrade(SubscriptionUpdateDTO subscriptionDTO) {
        log.debug("Delegating subscription-upgraded event to wordPressWebhookService");
        wordPressWebhookService.processSubscriptionUpgrade(subscriptionDTO);
    }

    /**
     * Process a subscription stopped event
     */
    @Transactional
    public void processSubscriptionStopped(SubscriptionUpdateDTO subscriptionDTO) {
        log.debug("Delegating subscription-stopped event to wordPressWebhookService");
        wordPressWebhookService.processSubscriptionStopped(subscriptionDTO);
    }

    /**
     * Process a subscription expired event
     */
    @Transactional
    public void processSubscriptionExpired(SubscriptionUpdateDTO subscriptionDTO) {
        log.debug("Delegating subscription-expired event to wordPressWebhookService");
        wordPressWebhookService.processSubscriptionExpired(subscriptionDTO);
    }

    /**
     * Process a transaction completed event
     */
    @Transactional
    public void processTransaction(TransactionDTO transactionDTO) {
        log.debug("Delegating transaction-completed event to wordPressWebhookService");
        wordPressWebhookService.processTransaction(transactionDTO);
    }

    /**
     * Process a member account update event
     */
    @Transactional
    public void processMemberAccountUpdate(MemberAccountUpdatedDTO accountUpdatedDTO) {
        log.debug("Delegating member-account-updated event to wordPressWebhookService");
        wordPressWebhookService.processMemberAccountUpdate(accountUpdatedDTO);
    }
}