import { useEffect, useRef, useState } from "react";

interface NameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

const NameEditModal: React.FC<NameEditModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onSave
}) => {
  const [name, setName] = useState(currentName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Resetear el nombre cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setName(currentName || "");
      // Enfocar el input cuando se abre el modal
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar nombre</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              ref={inputRef}
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tertiary-500 focus:border-tertiary-500"
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${name.trim() ? 'bg-tertiary-600 hover:bg-tertiary-700' : 'bg-tertiary-400 cursor-not-allowed'
                }`}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameEditModal;