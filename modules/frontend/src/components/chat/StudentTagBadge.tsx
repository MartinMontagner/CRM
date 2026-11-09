// components/StudentTagBadge.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useStudentTag } from '@/hooks/useStudentTag';

interface StudentTagBadgeProps {
  studentTag: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showHover?: boolean;
  className?: string;
  fixedWidth?: boolean;
  fallbackName?: string;
  fallbackPhone?: string;
}

const StudentTagBadge: React.FC<StudentTagBadgeProps> = ({
  studentTag,
  size = 'md',
  showHover = true,
  className = '',
  fixedWidth = false,
  fallbackName,
  fallbackPhone
}) => {
  const tagConfig = useStudentTag(studentTag, fallbackName, fallbackPhone);

  // Si no tiene etiqueta válida, no renderizar el badge
  if (!tagConfig.hasTag) {
    return null;
  }

  // Configuración de tamaños
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const badgeClasses = `
    ${sizeClasses[size]}
    font-medium
    ${tagConfig.textColor}
    rounded-full
    ${tagConfig.color}
    truncate
    text-center
    shadow-sm
    ${fixedWidth ? 'w-28' : ''}
    ${className}
  `;

  const content = (
    <div className={badgeClasses}>
      {tagConfig.displayText}
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

export default StudentTagBadge;