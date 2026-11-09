import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Tag, 
  Palette, 
  Users, 
  Star, 
  StarOff, 
  Eye,
  Save,
  Loader2
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { CreateCustomTagDTO } from '@/model/tags/TagsDTO';
import { CustomTag } from '@/model/chats/Contact';
import { getTextColorString } from '@/utils/getTextColor';

const tagSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Formato de color inválido'),
  studentTag: z.enum(['LEAD', 'ALUMNO', 'EX_ALUMNO'], {
    errorMap: () => ({ message: 'Selecciona un tipo válido' })
  }),
  important: z.boolean()
});

type TagFormData = z.infer<typeof tagSchema>;

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomTagDTO) => void;
  isLoading: boolean;
  tag?: CustomTag | null;
  title: string;
}

export const TagFormModal: React.FC<TagFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  tag,
  title
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      color: '#3b82f6',
      studentTag: 'LEAD',
      important: false
    }
  });

  const watchColor = watch('color');
  const watchName = watch('name');
  const watchImportant = watch('important');

  React.useEffect(() => {
    if (tag) {
      reset({
        name: tag.name,
        color: tag.color,
        studentTag: tag.studentTag as 'LEAD' | 'ALUMNO' | 'EX_ALUMNO',
        important: Boolean(tag.important) // Asegurar que sea boolean
      });
    } else {
      reset({
        name: '',
        color: '#3b82f6',
        studentTag: 'LEAD',
        important: false
      });
    }
  }, [tag, reset, isOpen]); // Agregar isOpen para resetear cuando se abre/cierra

  const handleFormSubmit = (data: TagFormData) => {
    // Asegurar que important sea boolean
    const formattedData = {
      ...data,
      important: Boolean(data.important)
    };
    onSubmit(formattedData as CreateCustomTagDTO);
    if (!tag) {
      reset();
    }
  };

  const handleImportantToggle = () => {
    const currentValue = watchImportant;
    setValue('important', !currentValue, { shouldValidate: true });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full overflow-hidden border border-gray-100 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-80 rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              </div>

              {/* Form */}
              <form 
              onSubmit={handleSubmit(handleFormSubmit)} 
              className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
              >
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                Nombre del Tag
                </label>
                <input
                {...register('name')}
                type="text"
                placeholder="Ingresa el nombre del tag"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                />
                {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.name.message}
                </motion.p>
                )}
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Palette className="w-4 h-4" />
                Color del Tag
                </label>
                <ColorPicker
                color={watchColor}
                onChange={(color) => setValue('color', color)}
                error={errors.color?.message}
                />
              </div>

              {/* Student Tag */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4" />
                Tipo de Estudiante
                </label>
                <select
                {...register('studentTag')}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                  errors.studentTag ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                >
                <option value="LEAD">Lead</option>
                <option value="ALUMNO">Alumno Activo</option>
                <option value="EX_ALUMNO">Ex Alumno</option>
                </select>
                {errors.studentTag && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.studentTag.message}
                </motion.p>
                )}
              </div>

              {/* Important Checkbox - Custom */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {watchImportant ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                Importancia
                </label>
                <div 
                onClick={handleImportantToggle}
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  watchImportant 
                  ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                  watchImportant ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}>
                  {watchImportant ? (
                    <Star className="w-4 h-4 text-yellow-600 fill-current" />
                  ) : (
                    <StarOff className="w-4 h-4 text-gray-500" />
                  )}
                  </div>
                  <div>
                  <p className="text-sm font-medium text-gray-900">
                    {watchImportant ? 'Tag Importante' : 'Tag Normal'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {watchImportant 
                    ? 'Este tag será destacado con prioridad' 
                    : 'Haz clic para marcar como importante'
                    }
                  </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  watchImportant ? 'bg-yellow-400' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 transform ${
                  watchImportant ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
                </div>
                {/* Hidden input for form */}
                <input
                type="hidden"
                {...register('important')}
                value={watchImportant ? 'true' : 'false'}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Eye className="w-4 h-4" />
                Vista Previa
                </label>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <div
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-sm border transition-all duration-200"
                  style={{
                    backgroundColor: watchColor,
                    color: getTextColorString(watchColor),
                  }}
                  >
                  <span>{watchName || 'Nombre del tag'}</span>
                  {watchImportant && (
                    <Star className="w-3 h-3 fill-current" />
                  )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Así se verá tu tag en la aplicación
                </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {isLoading ? (
                  <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                  </>
                ) : (
                  <>
                  <Save className="w-4 h-4" />
                  {tag ? 'Actualizar' : 'Crear Tag'}
                  </>
                )}
                </button>
              </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};