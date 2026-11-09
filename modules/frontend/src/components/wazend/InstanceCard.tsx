import { FC } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import { LuServer } from "react-icons/lu";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { WazendInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import { Role, RoleDescription } from "@/model/auth/AuthData";
import { SpanRole } from "./ui/SpanRole";

interface InstanceCardProps {
  instance: WazendInstanceDTO;
  rolesDescription: RoleDescription[];
  onEdit: (instance: WazendInstanceDTO) => void;
  onDelete: (id: number) => void;
}

export const InstanceCard: FC<InstanceCardProps> = ({
  instance,
  onEdit,
  onDelete,
  rolesDescription,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {instance.name || "Sin nombre"}
              </h3>
              <Badge variant="default" className="mt-1">
                {instance.instance}
              </Badge>
            </div>
            <div className="flex space-x-3">
              <button
                className="text-green-500 hover:text-green-700 rounded transition-colors active:scale-95"
                onClick={() => onEdit(instance)}
                aria-label="Editar instancia"
              >
                <FiEdit2 />
              </button>
              <button
                className="text-red-500 hover:text-red-700 rounded transition-colors active:scale-95"
                onClick={() => onDelete(instance.id)}
                aria-label="Eliminar instancia"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-500">
            <LuServer className="mr-2" />
            <span>Servidor: {instance.server}</span>
          </div>

          {/* Roles asignados */}
          {instance.roles && instance.roles.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-start mb-2">
                <FiUsers className="mr-2 text-gray-400 mt-0.5" size={16} />
                <span className="text-sm font-medium text-gray-700">
                  {instance.roles.filter(role => role != Role.SUPER_ADMIN).length > 0 ? "Roles permitidos" : "No se han asignado roles para esta instancia"}:
                </span>
              </div>

              <div className="flex flex-wrap gap-2 ml-6">
                {instance.roles.filter(role => role != Role.SUPER_ADMIN).map((role) => (
                  <SpanRole key={role} role={role} rolesDescription={rolesDescription} />
                ))}
              </div>
            </div>
          )}

          {/* Información adicional si no hay roles */}
          {(!instance.roles || instance.roles.length === 0) && (
            <div className="border-t pt-4">
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <FiUsers className="mr-2" size={16} />
                <span>No hay roles asignados a esta instancia</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
