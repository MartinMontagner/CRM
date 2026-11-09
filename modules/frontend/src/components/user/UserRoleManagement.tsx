import { Button } from "@/components/ui/button";
import { User } from "@/model/user/User";
import { useEffect, useState } from "react";
import { roleLabels, UserRole } from "@/types/Roles";
import { RoleSelector } from "./RoleSelector";
import { getAvatarColor, getRoleColor } from "@/utils/getRoleColors";
import {
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  Users,
  Loader2
} from "lucide-react";

import { getUserAll, updateUserRole, toggleUserStatus, sendPasswordReset } from "@/service/user/UserService";

const UserRoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<number, UserRole | undefined>
  >({});
  const [processingUsers, setProcessingUsers] = useState<
    Record<number, boolean>
  >({});
  const [processingStatus, setProcessingStatus] = useState<
    Record<number, boolean>
  >({});
  const [processingPasswordReset, setProcessingPasswordReset] = useState<
    Record<number, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [userToToggle, setUserToToggle] = useState<{id: number, name: string, currentStatus: boolean} | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await getUserAll();
      setUsers(fetchedUsers);

      // Inicializar selección de roles con los roles actuales
      const initialRoles: Record<number, UserRole | undefined> = {};
      fetchedUsers.forEach((user) => {
        initialRoles[user.id] = user.role as UserRole;
      });
      setSelectedRoles(initialRoles);
    } catch (error) {
      console.error("Error al obtener usuarios", error);
      setError("Error al cargar usuarios. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: number, role: UserRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleUpdateUserRole = async (userId: number) => {
    const selectedRole = selectedRoles[userId];
    const user = users.find(u => u.id === userId);

    if (!selectedRole) {
      setError("Por favor, selecciona un rol para este usuario");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Si el rol seleccionado es el mismo que ya tiene, no hacer nada
    if (user?.role === selectedRole) {
      setSuccessMessage("No se realizaron cambios, el rol es el mismo");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    try {
      setProcessingUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));

      await updateUserRole(
        userId,
        selectedRole,
      );

      // Actualizar el usuario en la lista local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: selectedRole } : user
        )
      );

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `Rol actualizado correctamente a ${roleLabels[selectedRole]}`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error al actualizar el rol del usuario", error);
      setError("Error al actualizar el rol. Intenta de nuevo.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingUsers((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  // Función para enviar restablecimiento de contraseña
  const handlePasswordReset = async (userId: number, email: string) => {
    try {
      setProcessingPasswordReset((prev) => ({
        ...prev,
        [userId]: true,
      }));

      await sendPasswordReset(email);

      // Mostrar mensaje de éxito
      setSuccessMessage('Email de restablecimiento enviado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error("Error al enviar email de restablecimiento", error);
      setError("Error al enviar el email. Intenta de nuevo.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingPasswordReset((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  // Función para abrir modal de confirmación
  const openConfirmModal = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUserToToggle({
      id: userId,
      name: user.name,
      currentStatus: true // Siempre será true porque solo mostramos usuarios activos
    });
    setShowConfirmModal(true);
  };

  // Función para cerrar modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setUserToToggle(null);
  };

  // Función para confirmar el cambio de estado
  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      setProcessingStatus((prev) => ({
        ...prev,
        [userToToggle.id]: true,
      }));

      const message = await toggleUserStatus(userToToggle.id);

      // Actualizar el usuario en la lista local - Remover usuario deshabilitado de la lista
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== userToToggle.id)
      );

      // Mostrar mensaje de éxito
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Cerrar modal inmediatamente después del éxito
      closeConfirmModal();

    } catch (error) {
      console.error("Error al cambiar estado del usuario", error);
      setError("Error al cambiar el estado del usuario. Intenta de nuevo.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingStatus((prev) => ({
        ...prev,
        [userToToggle.id]: false,
      }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Filtrado de usuarios según la búsqueda - SOLO mostrar usuarios NO deshabilitados (disabled: false)
  const filteredUsers = users.filter(user => 
    !user.disabled && // Solo usuarios activos (no deshabilitados)
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && users.length === 0) {
    return (
      <div className="p-6 rounded-xl shadow-lg bg-white flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600 font-medium">
            Cargando usuarios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl shadow-md bg-white transition-all">
      {/* Header con título y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Gestión de Roles de Usuarios
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Edita y actualiza los roles de los usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de vista */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Botón de actualizar */}
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="flex items-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Campo de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Alertas y mensajes */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center animate-fadeIn">
          <AlertCircle className="mr-2 flex-shrink-0 h-5 w-5" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md flex items-center animate-fadeIn">
          <CheckCircle className="mr-2 flex-shrink-0 h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Sin usuarios */}
      {filteredUsers.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 rounded-xl border border-gray-100">
          <div className="rounded-full bg-blue-100 p-3 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados"}
          </h3>
          <p className="text-gray-500 max-w-sm">
            {searchQuery 
              ? "No hay resultados para tu búsqueda. Intenta con otros términos."
              : "Aún no hay usuarios en el sistema o ocurrió un error al cargarlos."
            }
          </p>
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="mt-4"
          >
            Actualizar lista
          </Button>
        </div>
      ) : (
        <>
          {/* Vista en cuadrícula */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <div
                        className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${getAvatarColor(
                          user.name
                        )}`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="ml-2 pr-2">
                        <h3 className="text-lg font-medium">{user.name}</h3>
                        <p className="text-gray-500 sm:text-wrap sm:whitespace-normal sm:line-clamp-2 text-ellipsis text-sm">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cambiar rol
                        </label>
                        <RoleSelector
                          userId={user.id}
                          handleRoleChange={handleRoleChange}
                          processingUsers={processingUsers}
                          selectedRoles={selectedRoles}
                          setSelectedRoles={setSelectedRoles}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 text-gray-950 px-5 py-3 space-y-2">
                    <Button
                      onClick={() => handleUpdateUserRole(user.id)}
                      className={`w-full justify-center flex items-center gap-2 text-base font-semibold transition-colors ${!selectedRoles[user.id] ||
                          processingUsers[user.id] ||
                          user.role === selectedRoles[user.id]
                          ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        }`}
                      disabled={
                        !selectedRoles[user.id] ||
                        processingUsers[user.id] ||
                        user.role === selectedRoles[user.id]
                      }
                    >
                      {processingUsers[user.id] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Actualizando...
                        </>
                      ) : user.role === selectedRoles[user.id] ? (
                        "Sin cambios"
                      ) : (
                        "Actualizar rol"
                      )}
                    </Button>
                    
                    {/* Botón de restablecimiento de contraseña */}
                    <Button
                      onClick={() => handlePasswordReset(user.id, user.email)}
                      disabled={processingPasswordReset[user.id]}
                      className={`w-full justify-center flex items-center gap-2 text-base font-semibold transition-colors ${
                        processingPasswordReset[user.id]
                          ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                      }`}
                    >
                      {processingPasswordReset[user.id] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        "Reestablecer contraseña"
                      )}
                    </Button>
                    
                    {/* Botón de deshabilitar usuario */}
                    <Button
                      onClick={() => openConfirmModal(user.id)}
                      disabled={processingStatus[user.id]}
                      className={`w-full justify-center flex items-center gap-2 text-base font-semibold transition-colors ${
                        processingStatus[user.id]
                          ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white border-red-500"
                      }`}
                    >
                      {processingStatus[user.id] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Procesando...
                        </>
                      ) : (
                        "Eliminar usuario"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista en lista */}
          {viewMode === "list" && (
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Usuario
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rol actual
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cambiar rol
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Acción
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reestablecer contraseña
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cambiar Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(
                              user.name
                            )}`}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-xs rounded-full px-2.5 py-1 border font-medium whitespace-nowrap ${getRoleColor(
                            user.role as UserRole
                          )}`}
                        >
                          {roleLabels[user.role as UserRole]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleSelector
                          userId={user.id}
                          handleRoleChange={handleRoleChange}
                          processingUsers={processingUsers}
                          selectedRoles={selectedRoles}
                          setSelectedRoles={setSelectedRoles}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Button
                          onClick={() => handleUpdateUserRole(user.id)}
                          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${!selectedRoles[user.id] ||
                              processingUsers[user.id] ||
                              user.role === selectedRoles[user.id]
                              ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            }`}
                          disabled={
                            !selectedRoles[user.id] ||
                            processingUsers[user.id] ||
                            user.role === selectedRoles[user.id]
                          }
                        >
                          {processingUsers[user.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Actualizando...
                            </>
                          ) : user.role === selectedRoles[user.id] ? (
                            "Sin cambios"
                          ) : (
                            "Actualizar rol"
                          )}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Button
                          onClick={() => handlePasswordReset(user.id, user.email)}
                          disabled={processingPasswordReset[user.id]}
                          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                            processingPasswordReset[user.id]
                              ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                          }`}
                        >
                          {processingPasswordReset[user.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            "Enviar email"
                          )}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Button
                          onClick={() => openConfirmModal(user.id)}
                          disabled={processingStatus[user.id]}
                          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                            processingStatus[user.id]
                              ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white border-red-500"
                          }`}
                        >
                          {processingStatus[user.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Procesando...
                            </>
                          ) : (
                            "Eliminar usuario"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && userToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirmar cambio de estado
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  ¿Estás seguro que deseas{" "}
                  <span className="font-medium">
                    eliminar
                  </span>{" "}
                  al usuario{" "}
                  <span className="font-medium text-gray-900">
                    {userToToggle.name}
                  </span>
                  ?
                  <span className="block mt-2 text-red-600 font-medium">
                    El usuario no podrá acceder al sistema una vez eliminado.
                  </span>
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={closeConfirmModal}
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmToggleStatus}
                  disabled={processingStatus[userToToggle.id]}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {processingStatus[userToToggle.id] ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    "Eliminar usuario"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;