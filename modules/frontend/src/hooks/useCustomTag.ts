// hooks/useCustomTag.ts
import { useMemo } from 'react';
import { CustomTag } from '@/model/chats/Contact';
import { getTextColor } from '@/utils/getTextColor';

export interface CustomTagConfig {
  color: string;
  textColor: string;
  displayText: string;
  initials: string;
  hasTag: boolean;
  isImportant: boolean;
}

export const useCustomTag = (
  customTag: CustomTag | null | undefined,
  fallbackName?: string,
  fallbackPhone?: string
): CustomTagConfig => {
  return useMemo(() => {
    // Si no hay customTag o está deshabilitado
    if (!customTag || !customTag.enabled) {
      // Generar fallback similar al useStudentTag
      let fallbackText = '';
      let fallbackInitials = '';

      if (fallbackName && fallbackName.trim()) {
        const words = fallbackName.trim().split(' ');
        if (words.length >= 2) {
          fallbackInitials = (words[0][0] + words[1][0]).toUpperCase();
        } else {
          fallbackInitials = fallbackName.substring(0, 2).toUpperCase();
        }
        fallbackText = fallbackName.toUpperCase();
      } else if (fallbackPhone && fallbackPhone.trim()) {
        const phoneDigits = fallbackPhone.replace(/\D/g, '');
        fallbackInitials = phoneDigits.substring(0, 2);
        fallbackText = `TELÉFONO ${phoneDigits}`;
      } else {
        fallbackInitials = 'CT';
        fallbackText = 'SIN ETIQUETA';
      }

      return {
        color: "#6B7280", // gray-500
        textColor: "#FFFFFF",
        displayText: fallbackText,
        initials: fallbackInitials,
        hasTag: false,
        isImportant: false
      };
    }

    // Generar iniciales del nombre de la etiqueta
    const words = customTag.name.trim().split(' ');
    let initials: string;
    
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else {
      initials = customTag.name.substring(0, 2).toUpperCase();
    }

    return {
      color: customTag.color,
      textColor: getTextColor(customTag.dark),
      displayText: customTag.name.toUpperCase(),
      initials,
      hasTag: true,
      isImportant: customTag.important
    };
  }, [customTag, fallbackName, fallbackPhone]);
};