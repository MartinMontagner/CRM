import NavbarLayout from "@/components/layout/NavbarLayout";
import { DeleteConfirmModal } from "@/components/wazend/DeleteConfirmModal";
import { InstanceFormModal } from "@/components/wazend/InstanceFormModal";
import { InstancesList } from "@/components/wazend/InstancesList";
import { Alert } from "@/components/wazend/ui/Alert";
import { Button } from "@/components/wazend/ui/Button";
import { useRoles } from "@/hooks/roles/useRoles";
import { useWazendQuery } from "@/hooks/useWazendQuery";
import { WazendInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiAlertCircle, FiPlus, FiRefreshCw } from "react-icons/fi";

export const WazendInstancesPage = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] =
    useState<WazendInstanceDTO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Consultas y mutaciones de React Query
  const {
    getInstancesQuery,
    createInstanceMutation,
    updateInstanceMutation,
    deleteInstanceMutation,
  } = useWazendQuery();

  // Extraer datos y estados
  const { data: instances = [], isLoading, error, refetch } = getInstancesQuery;
  const isCreating = createInstanceMutation.isLoading;
  const isUpdating = updateInstanceMutation.isLoading;
  const isDeleting = deleteInstanceMutation.isLoading;

  const { data } = useRoles();

  console.log("Roles:", data);

  // Manejadores de eventos
  const handleAddInstance = () => {
    setSelectedInstance(null);
    setIsFormModalOpen(true);
  };

  const handleEditInstance = (instance: WazendInstanceDTO) => {
    setSelectedInstance(instance);
    setIsFormModalOpen(true);
  };

  const handleDeleteInstance = (instance: WazendInstanceDTO) => {
    setSelectedInstance(instance);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (
    data:
      | Omit<WazendInstanceDTO, "id">
      | ({ id: number } & Partial<Omit<WazendInstanceDTO, "id">>)
  ) => {
    try {
      setErrorMessage(null);
      if ("id" in data) {
        // Actualizar instancia
        console.log("Data to submit:", data);
        await updateInstanceMutation.mutateAsync(data);
      } else {
        // Crear instancia
        await createInstanceMutation.mutateAsync(data);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Ha ocurrido un error"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstance) return;

    try {
      setErrorMessage(null);
      await deleteInstanceMutation.mutateAsync(selectedInstance.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error al eliminar la instancia"
      );
    }
  };

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <NavbarLayout>
      <div className="h-screen w-full overflow-y-auto scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thin bg-grey-200">
        <motion.div
          className="container mx-auto py-8 px-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900">
              Instancias de Wazend
            </h1>
            <div className="flex-col sm:flex-row md:flex-row flex sm:space-x-3 md:space-x-3 space-x-0 space-y-3 sm:space-y-0 md:space-y-0">
              <Button
                variant="outline"
                icon={<FiRefreshCw />}
                onClick={() => refetch()}
                isLoading={isLoading}
                aria-label="Recargar instancias"
              >
                Actualizar
              </Button>
              <Button
                variant="primary"
                icon={<FiPlus />}
                onClick={handleAddInstance}
                aria-label="Añadir instancia"
              >
                Añadir Instancia
              </Button>
            </div>
          </motion.div>

          {/* Mensajes de error */}
          {(error || errorMessage) && (
            <motion.div variants={itemVariants}>
              <Alert variant="error" onClose={() => setErrorMessage(null)}>
                <div className="flex items-center">
                  <FiAlertCircle className="mr-2" />
                  <span>
                    {errorMessage ||
                      (error instanceof Error
                        ? error.message
                        : "Error al cargar las instancias")}
                  </span>
                </div>
              </Alert>
            </motion.div>
          )}

          {/* Lista de instancias */}
          <motion.div variants={itemVariants} className="pb-20 sm:pb-0 md:pb-0">
            <InstancesList
              rolesDescription={data}
              instances={instances}
              isLoading={isLoading}
              onEditInstance={handleEditInstance}
              onDeleteInstance={(id) => {
                const instance = instances.find((inst) => inst.id === id);
                if (instance) handleDeleteInstance(instance);
              }}
              onAddInstance={handleAddInstance}
            />
          </motion.div>

          {/* Modal de formulario */}
          <InstanceFormModal
            availableRoles={data}
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            instance={selectedInstance}
            isLoading={isCreating || isUpdating}
          />

          {/* Modal de confirmación de eliminación */}
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
            instanceName={selectedInstance?.name || ""}
          />
        </motion.div>
      </div>
    </NavbarLayout>
  );
};
