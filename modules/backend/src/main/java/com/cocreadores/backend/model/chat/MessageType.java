package com.cocreadores.backend.model.chat;

public enum MessageType {
    TEXT,
    IMAGE,
    AUDIO,
    VIDEO,
    DOCUMENT,
    LIST_REPLY,
    BUTTON_REPLY,
    BUTTON,
    LIST,
    TEMPLATE,
    INTERACTIVE,
    REACTION,
    STICKER;

    public static String fromString(MessageType type) {
        if (type == null) {
            throw new IllegalArgumentException("El tipo de mensaje no puede ser null");
        }

        switch (type) {
            case TEXT:
                return "Texto";
            case IMAGE:
                return "Imagen";
            case AUDIO:
                return "Audio";
            case VIDEO:
                return "Video";
            case DOCUMENT:
                return "Documento";
            case LIST_REPLY:
                return "Respuesta en lista";
            case BUTTON_REPLY:
                return "Respuesta de botón";
            case BUTTON:
                return "Botón";
            case LIST:
                return "Lista";
            case TEMPLATE:
                return "Plantilla";
            case INTERACTIVE:
                return "Interactivo";
            case STICKER:
                return "Sticker";
            case REACTION:
                return "Reacción";
            default:
                throw new IllegalArgumentException("Unknown message type: " + type);
        }
    }
}
