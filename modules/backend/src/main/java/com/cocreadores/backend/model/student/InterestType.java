package com.cocreadores.backend.model.student;

public enum InterestType {
    INTERESADO,
    PRIMERA_REGESTION,
    SEGUNDA_REGESTION,
    NO_INTERESADO,
    COMPROMISO;

    public static InterestType fromValue(String s) {
        if (s == null || s.equalsIgnoreCase("null")) {
            return null;
        }
        for (InterestType type : InterestType.values()) {
            if (type.name().equalsIgnoreCase(s)) {
                return type;
            }
        }
        throw new IllegalArgumentException("No enum constant " + InterestType.class.getCanonicalName() + "." + s);
    }
}
