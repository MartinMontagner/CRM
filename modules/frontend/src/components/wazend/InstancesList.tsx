import { motion, AnimatePresence } from 'framer-motion';
import { InstanceCard } from './InstanceCard';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';
import { SkeletonLoader } from '../skeletons/wazend/SkeletonLoader';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { WazendInstanceDTO } from '@/model/wazend/WazendInstanceDTO';
import { RoleDescription } from '@/model/auth/AuthData';

interface InstancesListProps {
  instances: WazendInstanceDTO[];
  isLoading: boolean;
  onEditInstance: (instance: WazendInstanceDTO) => void;
  onDeleteInstance: (id: number) => void;
  onAddInstance: () => void;
  rolesDescription?: RoleDescription[];
}

export const InstancesList = ({
  instances,
  isLoading,
  onEditInstance,
  onDeleteInstance,
  onAddInstance,
  rolesDescription = [],
} : InstancesListProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return <SkeletonLoader count={3} height="h-32" />;
  }

  if (instances.length === 0) {
    return (
      <EmptyState
        title="No hay instancias de Wazend"
        description="Añade tu primera instancia para comenzar a enviar mensajes desde tu CRM."
        icon={<FiMessageSquare className="h-8 w-8" />}
        action={
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={onAddInstance}
          >
            Añadir instancia
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence>
        {instances.map((instance) => (
          <InstanceCard
          rolesDescription={rolesDescription}
            key={instance.id}
            instance={instance}
            onEdit={onEditInstance}
            onDelete={onDeleteInstance}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};