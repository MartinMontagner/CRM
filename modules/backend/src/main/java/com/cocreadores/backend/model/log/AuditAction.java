package com.cocreadores.backend.model.log;

public enum AuditAction {
    LOGIN,
    ENABLE_USER,
    CREATE,
    DELETE,
    UPDATE,
    SEND_MESSAGE,
    SEND_MESSAGE_BULK,
    EXPORT_DATA,
    IMPORT_DATA,
    VIEW_REPORT,
    SYSTEM_ERROR
}
