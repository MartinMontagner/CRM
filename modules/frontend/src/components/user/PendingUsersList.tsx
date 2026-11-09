// src/components/user/PendingUsersList.tsx
import { Button } from "@/components/ui/button";
import { User } from "@/model/user/User";
import { getPendingUsers, useEnableUser } from "@/service/user/UserService";
import { roleLabels, UserRole } from "@/types/Roles";
import { useEffect, useState } from "react";
import { RoleSelector } from "./RoleSelector";
import { getAvatarColor, getRoleColor } from "@/utils/getRoleColors";
import { useSummaryStore } from "@/store/useSummaryStore";
import { UserCardSkeleton } from "../skeletons/user/UserCardSkeleton";

const PendingUsersList = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<number, UserRole | undefined>
  >({});
  const [processingUsers, setProcessingUsers] = useState<
    Record<number, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { isLoading, mutateAsync } = useEnableUser();

  const setTotal = useSummaryStore((state) => state.setTotalPendientes);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getPendingUsers();
      setPendingUsers(users);

      // Inicializar selección de roles
      const initialRoles: Record<number, UserRole | undefined> = {};
      users.forEach((user) => {
        initialRoles[user.id] = undefined;
      });
      setSelectedRoles(initialRoles);

      //recorro todos los users y cuento cuantos en disabled hay
      setTotal(users.filter((user) => user.enabled === false).length);
    } catch (error) {
      console.error("Error al obtener usuarios pendientes", error);
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

  const handleEnableUser = async (userId: number) => {
    const selectedRole = selectedRoles[userId];

    if (!selectedRole) {
      setError("Por favor, selecciona un rol para este usuario");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setProcessingUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));

      await mutateAsync({
        userIdToEnable: userId,
        role: selectedRole,
      });

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `Usuario aprobado correctamente con rol de ${roleLabels[selectedRole]}`
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Actualizar lista (quitar usuario aprobado)
      setPendingUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId)
      );
    } catch (error) {
      console.error("Error al habilitar el usuario", error);
      setError("Error al habilitar el usuario. Intenta de nuevo.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingUsers((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  useEffect(() => {
    fetchPendingUsers();
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

  // Componente del selector de rol con estilo mejorado

  if (loading && pendingUsers.length === 0) {
    return (
      <div className="p-6 rounded-xl shadow-lg bg-white flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600 font-medium">
            Cargando usuarios pendientes...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <UserCardSkeleton />;
  }

  return (
    <div className="p-6 rounded-xl shadow-md bg-white transition-all">
      {/* Header con título y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Usuarios Pendientes de Aprobación
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Asigna roles y aprueba nuevos registros en el sistema
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setViewMode("list")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Botón de actualizar */}
          <Button
            onClick={fetchPendingUsers}
            variant="outline"
            className="flex items-center gap-2 text-sm"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alertas y mensajes */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center animate-fadeIn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md flex items-center animate-fadeIn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 flex-shrink-0"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Sin usuarios pendientes */}
      {pendingUsers.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 rounded-xl border border-gray-100">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">
            No hay usuarios pendientes
          </h3>
          <p className="text-gray-500 max-w-sm">
            Todos los usuarios han sido aprobados. Revisa más tarde o actualiza
            para ver si hay nuevos registros.
          </p>
          <Button
            onClick={fetchPendingUsers}
            variant="outline"
            className="mt-4"
          >
            Verificar nuevamente
          </Button>
        </div>
      ) : pendingUsers.length > 0 ? (
        <>
          {/* Vista en cuadrícula */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUsers.map((user) => (
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
                          Asignar rol
                        </label>
                        <RoleSelector
                          userId={user.id}
                          handleRoleChange={handleRoleChange}
                          processingUsers={processingUsers}
                          selectedRoles={selectedRoles}
                          setSelectedRoles={setSelectedRoles}
                        />
                      </div>

                      {selectedRoles[user.id] && (
                        <div
                          className={`text-xs rounded-full px-3 py-1 inline-block font-medium ${getRoleColor(
                            selectedRoles[user.id]!
                          )}`}
                        >
                          {roleLabels[selectedRoles[user.id]!]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 text-gray-950 px-5 py-3">
                    <Button
                      onClick={() => handleEnableUser(user.id)}
                      className={`w-full justify-center flex items-center gap-2 text-base font-semibold transition-colors ${
                        !selectedRoles[user.id] || processingUsers[user.id]
                          ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white border-green-500"
                      }`}
                      disabled={
                        !selectedRoles[user.id] || processingUsers[user.id]
                      }
                      style={{
                        opacity:
                          !selectedRoles[user.id] || processingUsers[user.id]
                            ? 1
                            : undefined,
                      }}
                    >
                      {processingUsers[user.id] ? (
                        <>
                          <span className="loader mr-2"></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <span className="inline-block bg-white rounded-full w-2.5 h-2.5 mr-2"></span>
                          Aprobar usuario
                        </>
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
                      Rol asignado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
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
                        <div className="flex items-center gap-3">
                          <RoleSelector
                            handleRoleChange={handleRoleChange}
                            processingUsers={processingUsers}
                            selectedRoles={selectedRoles}
                            setSelectedRoles={setSelectedRoles}
                            userId={user.id}
                            className="w-56"
                          />

                          {selectedRoles[user.id] && (
                            <div
                              className={`text-xs rounded-full px-2.5 py-1 border font-medium whitespace-nowrap ${getRoleColor(
                                selectedRoles[user.id]!
                              )}`}
                            >
                              {roleLabels[selectedRoles[user.id]!]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleEnableUser(user.id)}
                          className={`inline-flex items-center gap-2 text-base font-semibold transition-colors ${
                            !selectedRoles[user.id] || processingUsers[user.id]
                              ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 text-white border-green-500"
                          }`}
                          disabled={
                            !selectedRoles[user.id] || processingUsers[user.id]
                          }
                          style={{
                            opacity:
                              !selectedRoles[user.id] ||
                              processingUsers[user.id]
                                ? 1
                                : undefined,
                          }}
                        >
                          {processingUsers[user.id] ? (
                            <>
                              <span className="loader mr-2"></span>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <span className="inline-block bg-white rounded-full w-2.5 h-2.5 mr-2"></span>
                              Aprobar
                            </>
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
      ) : null}
    </div>
  );
};
export default PendingUsersList;
