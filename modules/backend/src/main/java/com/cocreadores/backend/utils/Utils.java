package com.cocreadores.backend.utils;

import com.cocreadores.backend.model.student.StudentType;
import com.cocreadores.backend.model.user.Role;

public class Utils {
    public static String normalizePhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            throw new IllegalArgumentException("El número de teléfono no puede estar vacío");
        }

        // Eliminar cualquier carácter que no sea un número
        String digitsOnly = phone.replaceAll("[^0-9]", "");

        // Eliminar prefijo 00 si existe
        if (digitsOnly.startsWith("00")) {
            digitsOnly = digitsOnly.substring(2);
        }

        // Eliminar el + si existe
        if (phone.startsWith("+")) {
            digitsOnly = phone.substring(1).replaceAll("[^0-9]", "");
        }

        // Si comienza con 54 y el siguiente dígito es 9, eliminar el 9
        if (digitsOnly.startsWith("54") && digitsOnly.length() > 4 && digitsOnly.charAt(2) == '9') {
            digitsOnly = "54" + digitsOnly.substring(3);
        }

        // Añadir el código de país si sólo tiene 9 dígitos (asumiendo que es un número español)
        // Ajusta esta lógica según los países con los que trabajes
        if (!digitsOnly.startsWith("34") && digitsOnly.length() == 9) {
            digitsOnly = "34" + digitsOnly;
        }

        return digitsOnly;
    }

    /**
     * @description Obtiene los chats que corresponde segun el rol del usuario y las etiquetas que tienen autorizadas.
     * @param roleUser El rol del usuario.
     * @return El tipo de estudiante correspondiente al rol, o null si no es un rol de estudiante.
     */
    public static String getStudentTypeByRoleUser(Role roleUser) {
        switch (roleUser) {
            case COACH_HEBREO:
                return StudentType.ALUMNO.name();
            case COACH_MENTORIA:
                return StudentType.ALUMNO.name();
            default:
                return null;
        }
    }

}
