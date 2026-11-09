import { AnimatePresence, motion } from "framer-motion";
import { FaUsers, FaUserShield, FaChevronDown, FaCheck } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { Label } from "./ui/Label";
import { RoleChip } from "./ui/RoleChip";
import { WazendCreateInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import { RoleDescription } from "@/model/auth/AuthData";

interface RoleSelectorProps {
  formData: WazendCreateInstanceDTO;
  roleDescriptionMap: Map<string, string>;
  handleRemoveRole: (roleToRemove: string) => void;
  rolesForSelect: RoleDescription[];
  setShowRoleDropdown: (show: boolean) => void;
  showRoleDropdown: boolean;
  isLoading?: boolean;
  handleAddRole: (role: string) => void;
}
export const RoleSelector = ({
  formData,
  roleDescriptionMap,
  handleRemoveRole,
  rolesForSelect,
  setShowRoleDropdown,
  showRoleDropdown,
  isLoading,
  handleAddRole,
}: RoleSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
    >
      <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2 mb-4">
        <FaUsers className="w-5 h-5 text-blue-600" />
        Gestión de Roles
      </h4>

      {/* Roles asignados */}
      <div className="mb-4">
        <Label htmlFor="assigned-roles">Roles Asignados</Label>
        <div className="min-h-[60px] p-4 bg-white rounded-lg border-2 border-dashed border-blue-200">
          {formData.roles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-12"
            >
              <div className="text-center">
                <FaUserShield className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-500">No hay roles asignados</p>
                <p className="text-xs text-gray-400">
                  Añade roles usando el selector inferior
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {formData.roles.map((role) => (
                  <RoleChip
                    key={role}
                    role={role}
                    description={roleDescriptionMap.get(role) || role}
                    onRemove={() => handleRemoveRole(role)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Selector de roles mejorado */}
      {rolesForSelect.length > 0 && (
        <div className="relative">
          <Label htmlFor="role-selector">Añadir Nuevo Rol</Label>
          <button
            type="button"
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              // Scrolleo abajo para mostrar el dropdown
              if (!showRoleDropdown) {
                setTimeout(() => {
                  const dropdown = document.querySelector(".absolute.z-10");
                  if (dropdown) {
                    dropdown.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }
                }, 100);
              }
            }}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={isLoading}
          >
            <span className="text-gray-700 flex items-center gap-2">
              <IoIosAdd className="w-8 h-8 text-blue-600" />
              Seleccionar rol para añadir
            </span>

            <FaChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                showRoleDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown de roles */}
          {showRoleDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {rolesForSelect.map((roleDesc) => (
                <button
                  key={roleDesc.role.toString()}
                  type="button"
                  onClick={() => handleAddRole(roleDesc.role.toString())}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-800 transition-colors duration-150 border-b border-gray-100 last:border-b-0 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-800">
                        {roleDesc.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {rolesForSelect.length === 0 && formData.roles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-3"
        >
          <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <FaCheck className="w-5 h-5" />
            Todos los roles disponibles han sido asignados
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
