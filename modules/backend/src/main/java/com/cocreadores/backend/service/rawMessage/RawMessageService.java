package com.cocreadores.backend.service.rawMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cocreadores.backend.model.RawMessage;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.repository.RawMessageRepository;

import jakarta.transaction.Transactional;

@Service
public class RawMessageService {

    private final RawMessageRepository rawMessageRepository;
    private static final Logger logger = LoggerFactory.getLogger(RawMessageService.class);

    @Autowired
    public RawMessageService(RawMessageRepository rawMessageRepository) {
        this.rawMessageRepository = rawMessageRepository;
    }

    @Transactional
    public void saveRawMessage(ConversationType source, String json) {
        RawMessage rawMessage = new RawMessage();
        rawMessage.setSource(source);
        rawMessage.setRaw(json);
        rawMessage.setProcessed(false);
        rawMessageRepository.save(rawMessage);
        logger.info("Raw message saved: source={}, id={}", source, rawMessage.getId());
    }
}