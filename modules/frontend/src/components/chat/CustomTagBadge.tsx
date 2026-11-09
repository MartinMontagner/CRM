// components/CustomTagBadge.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CustomTag } from '@/model/chats/Contact';
import { getTextColor } from '@/utils/getTextColor';
// Ajusta la ruta según tu estructura

interface CustomTagBadgeProps {
  customTag: CustomTag | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showHover?: boolean;
  className?: string;
  fixedWidth?: boolean;
}

const CustomTagBadge: React.FC<CustomTagBadgeProps> = ({
  customTag,
  size = 'md',
  showHover = true,
  className = '',
  fixedWidth = false
}) => {
  // Si no hay customTag, no renderizar nada
  if (!customTag || !customTag.enabled) {
    return null;
  }

  // Configuración de tamaños
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  // Obtener el color del texto basado en si el fondo es oscuro
  const textColor = getTextColor(customTag.dark);

  const badgeClasses = `
    ${sizeClasses[size]}
    font-medium
    rounded-full
    truncate
    text-center
    shadow-sm
    ${fixedWidth ? 'w-28' : ''}
    ${className}
  `;

  const badgeStyle = {
    backgroundColor: customTag.color,
    color: textColor
  };

  const content = (
    <div 
      className={badgeClasses}
      style={badgeStyle}
      title={`Etiqueta: ${customTag.name}`}
    >
      {customTag.name}
    </div>
  );

  if (showHover) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default CustomTagBadge;