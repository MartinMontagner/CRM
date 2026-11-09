import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { CustomTag } from '@/model/chats/Contact';

interface DeleteTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tag: CustomTag | null;
  isDeleting: boolean;
}

export function DeleteTagModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  tag, 
  isDeleting 
}: DeleteTagModalProps) {
  if (!tag) return null;

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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900">
                      Eliminar Tag
                    </h3>
                    <p className="text-sm text-red-700">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <div className="mb-4">
                  <p className="text-gray-700 mb-3">
                    ¿Estás seguro de que quieres eliminar el tag{' '}
                    <span className="font-semibold text-gray-900">"{tag.name}"</span>?
                  </p>
                  
                  {/* Tag preview */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                      {tag.important && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Importante
                        </span>
                      )}
                    </div>
                    {tag.name && (
                      <p className="text-sm text-gray-600">{tag.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="capitalize">{tag.studentTag?.toLowerCase()}</span>
                      <span>•</span>
                      <span>{tag.enabled ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Importante:</p>
                        <p>
                        Al eliminar este tag, permanecerá en la base de datos y los usuarios que ya lo tengan asignado lo conservarán. Sin embargo, no podrás asignarlo a nuevos usuarios. Esta acción es permanente y no se puede deshacer.
                        </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <motion.button
                  whileHover={!isDeleting ? { scale: 1.02 } : {}}
                  whileTap={!isDeleting ? { scale: 0.98 } : {}}
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar Tag
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}