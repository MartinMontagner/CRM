// components/StudentTagAvatar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useStudentTag } from '@/hooks/useStudentTag';

interface StudentTagAvatarProps {
  studentTag: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHover?: boolean;
  className?: string;
  showInitials?: boolean;
  fallbackName?: string;
  fallbackPhone?: string;
}

const StudentTagAvatar: React.FC<StudentTagAvatarProps> = ({
  studentTag,
  size = 'md',
  showHover = true,
  className = '',
  showInitials = true,
  fallbackName,
  fallbackPhone
}) => {
  const tagConfig = useStudentTag(studentTag, fallbackName, fallbackPhone);

  // Configuración de tamaños
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  const avatarClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    ${tagConfig.color} 
    flex 
    items-center 
    justify-center 
    border-2 
    border-white 
    shadow-sm 
    ${className}
  `;

  const content = (
    <div className={avatarClasses}>
      {showInitials && (
        <span className={`${tagConfig.textColor} font-bold`}>
          {tagConfig.initials}
        </span>
      )}
    </div>
  );

  if (showHover) {
    return (
      <motion.div
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default StudentTagAvatar;