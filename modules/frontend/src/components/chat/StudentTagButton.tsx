import React from 'react';
import { StudentTagType } from '@/types/StudentTags';

interface StudentTagButtonProps {
  tag: StudentTagType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const getTagColors = (tag: StudentTagType, isActive: boolean) => {
  const baseColors = {
    ALL: isActive 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-200 text-gray-600 border-gray-200 hover:bg-gray-300',
    LEAD: isActive 
      ? 'bg-green-200 text-green-800 border-green-300' 
      : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    ALUMNO: isActive 
      ? 'bg-blue-200 text-blue-800 border-blue-300' 
      : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    EX_ALUMNO: isActive 
      ? 'bg-red-200 text-red-800 border-red-300' 
      : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
  };
  
  return baseColors[tag] || baseColors.ALL;
};

export const StudentTagButton: React.FC<StudentTagButtonProps> = ({ 
  tag, 
  label, 
  isActive, 
  onClick 
}) => {
  const colorClasses = getTagColors(tag, isActive);
  
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
        ${colorClasses}
        ${isActive ? 'shadow-sm' : 'shadow-none'}
      `}
    >
      {label}
    </button>
  );
};