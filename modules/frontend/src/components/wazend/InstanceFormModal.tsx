import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Modal } from "./ui/Modal";
import { TextField } from "./ui/TextField";
import { Button } from "./ui/Button";
import { WazendInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import { Role, RoleDescription } from "@/model/auth/AuthData";
import { FaServer, FaInfo, FaEye, FaEyeSlash } from "react-icons/fa";
import { RoleSelector } from "./RoleSelector";

interface InstanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data:
      | Omit<WazendInstanceDTO, "id">
      | ({ id: number } & Partial<Omit<WazendInstanceDTO, "id">>)
  ) => void;
  instance?: WazendInstanceDTO | null;
  isLoading: boolean;
  availableRoles?: RoleDescription[];
}

export const InstanceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  instance,
  isLoading,
  availableRoles = [],
}: InstanceFormModalProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    apiKey: string;
    instance: string;
    server: string;
    roles: string[];
  }>({
    name: "",
    instance: "",
    apiKey: "",
    server: "",
    roles: [],
  });

  const [errors, setErrors] = useState<{
    instance?: string;
    apiKey?: string;
    server?: string;
  }>({});

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Creamos un mapa para buscar descripciones fácilmente
  const roleDescriptionMap = useMemo(() => {
    return new Map(
      availableRoles.map((r) => [r.role.toString(), r.description])
    );
  }, [availableRoles]);

  // Filtramos los roles disponibles (sin SUPER_ADMIN y los ya añadidos)
  const rolesForSelect = useMemo(() => {
    return availableRoles
      .filter((r) => r.role !== Role.SUPER_ADMIN)
      .filter((r) => !formData.roles.includes(r.role.toString()));
  }, [availableRoles, formData.roles]);

  useEffect(() => {
    if (instance) {
      setFormData({
        name: instance.name || "",
        instance: instance.instance,
        apiKey: instance.apiKey,
        server: instance.server,
        roles:
          instance.roles.filter(
            (role) => role != Role.SUPER_ADMIN.toString()
          ) || [],
      });
    } else {
      setFormData({
        name: "",
        instance: "",
        apiKey: "",
        server: "",
        roles: [],
      });
    }
    setShowRoleDropdown(false);
    setShowApiKey(false);
    setErrors({});
  }, [instance, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "instance" && !value.trim()) {
      setErrors((prev) => ({ ...prev, instance: "La instancia es requerida" }));
    } else if (name === "instance") {
      setErrors((prev) => ({ ...prev, instance: undefined }));
    }

    if (name === "apiKey" && !value.trim()) {
      setErrors((prev) => ({ ...prev, apiKey: "La API Key es requerida" }));
    } else if (name === "apiKey") {
      setErrors((prev) => ({ ...prev, apiKey: undefined }));
    }

    if (name === "server" && !value.trim()) {
      setErrors((prev) => ({ ...prev, server: "El servidor es requerido" }));
    } else if (name === "server") {
      setErrors((prev) => ({ ...prev, server: undefined }));
    }
  };

  const handleAddRole = (roleToAdd: string) => {
    if (roleToAdd && !formData.roles.includes(roleToAdd)) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, roleToAdd],
      }));
    }
    setShowRoleDropdown(false);
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((role) => role !== roleToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { instance?: string; apiKey?: string; server?: string } =
      {};

    if (!formData.instance.trim()) {
      newErrors.instance = "La instancia es requerida";
    }
    if (!formData.apiKey.trim()) {
      newErrors.apiKey = "La API Key es requerida";
    }
    if (!formData.server.trim()) {
      newErrors.server = "El servidor es requerido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      ...formData,
      roles: formData.roles,
    };

    if (instance) {
      onSubmit({ id: instance.id, ...dataToSubmit });
    } else {
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
          >
            <FaServer className="w-5 h-5 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {instance ? "Editar Instancia" : "Nueva Instancia"}
            </h3>
            <p className="text-sm text-gray-500">
              {instance
                ? "Modifica los datos de la instancia"
                : "Configura una nueva instancia de Wazend"}
            </p>
          </motion.div>
        </div>
      }
      className="max-w-2xl"
    >
      {/* Contenedor con scroll fijo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-h-[calc(90vh-200px)] overflow-y-auto pr-2 -mr-2"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-4 space-y-4"
          >
            <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <FaInfo className="w-5 h-5 text-blue-600" />
              Información Básica
            </h4>

            <TextField
              id="name"
              name="name"
              label="Nombre"
              placeholder="Nombre descriptivo para la instancia"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="instance"
                name="instance"
                label="Instancia"
                placeholder="Ej: T265, P2331"
                value={formData.instance}
                onChange={handleChange}
                error={errors.instance}
                required
                fullWidth
              />
              <TextField
                id="server"
                name="server"
                label="Servidor"
                placeholder="https://api.wazend.com"
                value={formData.server}
                onChange={handleChange}
                error={errors.server}
                required
                fullWidth
              />
            </div>

            <div className="relative">
              <TextField
                id="apiKey"
                name="apiKey"
                label="API Key"
                placeholder="Ingresa tu clave de API"
                value={formData.apiKey}
                onChange={handleChange}
                error={errors.apiKey}
                required
                fullWidth
                type={showApiKey ? "text" : "password"}
              />
              <motion.button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showApiKey ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Gestión de Roles */}
          <RoleSelector
            formData={formData}
            handleAddRole={handleAddRole}
            handleRemoveRole={handleRemoveRole}
            roleDescriptionMap={roleDescriptionMap}
            rolesForSelect={rolesForSelect}
            setShowRoleDropdown={setShowRoleDropdown}
            showRoleDropdown={showRoleDropdown}
            isLoading={isLoading}
          />
        </form>
      </motion.div>

      {/* Botones de acción fijos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3 bg-white"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="px-6"
          >
            Cancelar
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            onClick={handleSubmit}
            className="px-6"
          >
            {instance ? "Actualizar Instancia" : "Crear Instancia"}
          </Button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};
