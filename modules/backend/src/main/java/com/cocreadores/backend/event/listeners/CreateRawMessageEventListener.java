package com.cocreadores.backend.event.listeners;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.cocreadores.backend.event.RawMessageEvent;
import com.cocreadores.backend.model.RawMessage;
import com.cocreadores.backend.model.student.ConversationType;
import com.cocreadores.backend.repository.RawMessageRepository;

/**
 * @class CreateRawMessageEventListener
 * @description Esta clase escucha eventos de tipo RawMessageEvent y crea un nuevo RawMessage en la base de datos.
 * @author Emiliano González
 */
@Component
public class CreateRawMessageEventListener {

    private final RawMessageRepository rawRepository;
    private static final Logger logger = LoggerFactory.getLogger(CreateRawMessageEventListener.class);
    public CreateRawMessageEventListener(RawMessageRepository rawRepository) {
        this.rawRepository = rawRepository;
    }

    @EventListener(RawMessageEvent.class)
    @Transactional
    public void handleRawMessageEvent(RawMessageEvent event) {
        String rawMessage = event.getRaw();
        ConversationType source = event.getSource();

        RawMessage message = new RawMessage();
        message.setRaw(rawMessage);
        message.setSource(source);
        message.setProcessed(false);
        rawRepository.save(message);
        logger.info("Mensaje guardado: Fuente: {}, ID: {}", source, message.getId());
    }
}