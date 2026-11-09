import { useEffect, useState } from "react";
import StudentTagAvatar from "@/components/chat/StudentTagAvatar";
import StudentTagBadge from "@/components/chat/StudentTagBadge";

interface TagEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentTag: string | null | undefined;
  conversationId: number;
  onSave: (conversationId: number, tag: string) => Promise<void>;
  studentName?: string;
  phoneNumber?: string;
}

// Definir las opciones de etiquetas disponibles
const TAG_OPTIONS = [
  { value: "Lead", label: "Lead" },
  { value: "Alumno", label: "Alumno" },
  { value: "Ex_Alumno", label: "Ex Alumno" }
];

const TagEditModal: React.FC<TagEditModalProps> = ({
  isOpen,
  onClose,
  studentTag,
  conversationId,
  onSave,
  studentName,
  phoneNumber
}) => {
  const [selectedTag, setSelectedTag] = useState<string>(studentTag || "");
  // ✅ CAMBIO: No mostrar estado de "guardando" porque es inmediato
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Resetear la selección cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTag(studentTag || "");
      setHasUnsavedChanges(false);
    }
  }, [isOpen, studentTag]);

  // Detectar cambios no guardados
  useEffect(() => {
    setHasUnsavedChanges((studentTag || "") !== selectedTag);
  }, [selectedTag, studentTag]);

  if (!isOpen) return null;

  // ✅ CAMBIO: Función de guardado optimizada
  const handleSave = async () => {
    try {
      // ✅ Llamar la función de guardado que ahora es optimista
      await onSave(conversationId, selectedTag);
      // El modal se cierra inmediatamente desde el handler padre
    } catch (error) {
      console.error('Error al procesar el guardado:', error);
      // El error se maneja en el handler padre
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar etiqueta</h3>

        {/* Mostrar estado actual antes de las opciones */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estado actual:</h4>
          <div className="flex items-center gap-3">
            <StudentTagAvatar 
              studentTag={studentTag}
              size="md"
              showHover={false}
              fallbackName={studentName}
              fallbackPhone={phoneNumber}
            />
            <div className="flex flex-col gap-1">
              <StudentTagBadge 
                studentTag={studentTag}
                size="md"
                showHover={false}
                fallbackName={studentName}
                fallbackPhone={phoneNumber}
              />
              {(!studentTag || studentTag.trim() === '') && (
                <span className="text-xs text-gray-500">Sin etiqueta asignada</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {TAG_OPTIONS.map((option) => {
            return (
              <div key={option.value} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center flex-1">
                  <input
                    type="radio"
                    id={`tag-${option.value}`}
                    name="tag"
                    value={option.value}
                    checked={selectedTag === option.value}
                    onChange={() => setSelectedTag(option.value)}
                    className="h-4 w-4 text-tertiary-600 focus:ring-tertiary-500 border-gray-300"
                  />
                  <label 
                    htmlFor={`tag-${option.value}`} 
                    className="ml-3 flex items-center gap-3 cursor-pointer flex-1"
                  >
                    {/* Avatar pequeño de la etiqueta */}
                    <StudentTagAvatar 
                      studentTag={option.value}
                      size="sm"
                      showHover={false}
                      fallbackName={studentName}
                      fallbackPhone={phoneNumber}
                    />
                    
                    {/* Texto de la etiqueta */}
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </label>
                </div>
                
                {/* Badge de la etiqueta */}
                <StudentTagBadge 
                  studentTag={option.value}
                  size="sm"
                  showHover={false}
                  fallbackName={studentName}
                  fallbackPhone={phoneNumber}
                />
              </div>
            );
          })}
          
          {/* Opción para "Sin etiqueta" */}
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <input
                type="radio"
                id="tag-none"
                name="tag"
                value=""
                checked={selectedTag === ""}
                onChange={() => setSelectedTag("")}
                className="h-4 w-4 text-tertiary-600 focus:ring-tertiary-500 border-gray-300"
              />
              <label 
                htmlFor="tag-none" 
                className="ml-3 flex items-center gap-3 cursor-pointer flex-1"
              >
                {/* Avatar para sin etiqueta */}
                <StudentTagAvatar 
                  studentTag={null}
                  size="sm"
                  showHover={false}
                  fallbackName={studentName}
                  fallbackPhone={phoneNumber}
                />
                
                {/* Texto para sin etiqueta */}
                <span className="text-sm font-medium text-gray-700">
                  Sin etiqueta
                </span>
              </label>
            </div>
            
            {/* No hay badge para "sin etiqueta" */}
            <span className="text-xs text-gray-400">Sin clasificar</span>
          </div>
        </div>

        {/* Vista previa de la etiqueta seleccionada */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
          <div className="flex items-center gap-3">
            <StudentTagAvatar 
              studentTag={selectedTag || null}
              size="md"
              showHover={false}
              fallbackName={studentName}
              fallbackPhone={phoneNumber}
            />
            <div className="flex flex-col gap-1">
              <StudentTagBadge 
                studentTag={selectedTag || null}
                size="md"
                showHover={false}
                fallbackName={studentName}
                fallbackPhone={phoneNumber}
              />
              {(!selectedTag || selectedTag.trim() === '') && (
                <span className="text-xs text-gray-500">Sin etiqueta</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
              hasUnsavedChanges 
                ? 'bg-tertiary-600 hover:bg-tertiary-700' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {hasUnsavedChanges ? 'Guardar cambios' : 'Sin cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagEditModal;