import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { FiAlertTriangle } from 'react-icons/fi';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  instanceName: string | null;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  instanceName,
} : DeleteConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar eliminación"
    >
      <div className="text-center">
        <FiAlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          ¿Estás seguro de eliminar esta instancia?
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {instanceName ? `"${instanceName}"` : 'Esta instancia'} será eliminada permanentemente.
          Esta acción no se puede deshacer.
        </p>
      </div>
      
      <div className="mt-6 flex justify-center space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          Eliminar
        </Button>
      </div>
    </Modal>
  );
};