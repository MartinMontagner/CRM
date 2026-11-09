import { FiTag, FiX, FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";

export const SyncConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmar Sincronización
          </h3>
          {!isLoading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-4">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-600 text-center">
                Sincronizando etiquetas...
              </p>
              <p className="text-sm text-gray-500 text-center mt-1">
                Por favor espera, este proceso puede tomar unos momentos.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              ¿Estás seguro de que deseas sincronizar las etiquetas de estudiantes? 
              Este proceso puede tomar unos momentos.
            </p>
          )}
        </div>

        {/* Actions */}
        {!isLoading && (
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FiTag className="w-4 h-4" />
              Sincronizar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};