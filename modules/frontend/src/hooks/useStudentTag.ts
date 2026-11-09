import { useMemo } from 'react';

export interface StudentTagConfig {
  color: string;
  textColor: string;
  displayText: string;
  initials: string;
  hasTag: boolean; // Nueva propiedad para indicar si tiene etiqueta válida
}

export const useStudentTag = (
  studentTag: string | null | undefined,
  fallbackName?: string,
  fallbackPhone?: string
): StudentTagConfig => {
  return useMemo(() => {
    // Si studentTag es null, undefined o string vacío
    if (!studentTag || studentTag.trim() === '') {
      // Generar fallback basado en nombre o teléfono
      let fallbackText = '';
      let fallbackInitials = '';

      if (fallbackName && fallbackName.trim()) {
        // Usar las primeras letras del nombre
        const words = fallbackName.trim().split(' ');
        if (words.length >= 2) {
          fallbackInitials = (words[0][0] + words[1][0]).toUpperCase();
        } else {
          fallbackInitials = fallbackName.substring(0, 2).toUpperCase();
        }
        fallbackText = fallbackName.toUpperCase();
      } else if (fallbackPhone && fallbackPhone.trim()) {
        // Usar los primeros números del teléfono
        const phoneDigits = fallbackPhone.replace(/\D/g, ''); // Remover caracteres no numéricos
        fallbackInitials = phoneDigits.substring(0, 2);
        fallbackText = `TELÉFONO ${phoneDigits}`;
      } else {
        // Fallback por defecto
        fallbackInitials = 'SN';
        fallbackText = 'SIN NOMBRE';
      }

      return {
        color: "bg-gray-400",
        textColor: "text-white",
        displayText: fallbackText,
        initials: fallbackInitials,
        hasTag: false // Indica que no tiene etiqueta válida
      };
    }

    const tagLower = studentTag.toLowerCase();

    // Mapeo de configuraciones por etiqueta
    const tagConfigs: Record<string, Omit<StudentTagConfig, 'textColor' | 'hasTag'>> = {
      "lead": {
        color: "bg-green-500",
        displayText: "LEAD",
        initials: "LD"
      },
      "alumno": {
        color: "bg-blue-500",
        displayText: "ALUMNO",
        initials: "AL"
      },
      "ex_alumno": {
        color: "bg-red-500",
        displayText: "EX ALUMNO",
        initials: "EX"
      }
      // Agregar más etiquetas según sea necesario
    };

    // Buscar configuración exacta
    const config = tagConfigs[tagLower];
    
    if (config) {
      return {
        ...config,
        textColor: "text-white",
        hasTag: true
      };
    }

    // Para etiquetas personalizadas/desconocidas pero válidas
    const words = studentTag.trim().split(' ');
    let initials: string;
    
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else {
      initials = studentTag.substring(0, 2).toUpperCase();
    }

    return {
      color: "bg-gray-300",
      textColor: "text-white", 
      displayText: studentTag.toUpperCase(),
      initials,
      hasTag: true
    };
  }, [studentTag, fallbackName, fallbackPhone]);
};