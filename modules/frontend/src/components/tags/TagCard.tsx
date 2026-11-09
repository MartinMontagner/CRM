import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Star } from 'lucide-react';
import { CustomTag } from '@/model/chats/Contact';

interface TagCardProps {
  tag: CustomTag;
  onEdit: (tag: CustomTag) => void;
  onDelete: (tag: CustomTag) => void;
  isDeleting: boolean;
}

export const TagCard: React.FC<TagCardProps> = ({ tag, onEdit, onDelete, isDeleting }) => {
  const getStudentTagLabel = (studentTag: string) => {
    const labels = {
      'LEAD': 'Lead',
      'ALUMNO': 'Alumno',
      'EX_ALUMNO': 'Ex Alumno'
    };
    return labels[studentTag as keyof typeof labels] || studentTag;
  };

  const getTextColor = (backgroundColor: string) => {
    // Simple check for light/dark color
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
            style={{
              backgroundColor: tag.color,
              color: getTextColor(tag.color)
            }}
          >
            {tag.important && <Star className="w-3 h-3" />}
            {tag.name}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(tag)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tag)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Tipo:</span>
          <span className="font-medium">{getStudentTagLabel(tag.studentTag)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Estado:</span>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
            tag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {tag.enabled ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {tag.important && (
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="w-3 h-3" />
            <span className="text-xs">Importante</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
