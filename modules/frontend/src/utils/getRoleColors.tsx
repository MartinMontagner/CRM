import { UserRole } from "@/types/Roles";

  // Función para obtener color basado en el rol
export const getRoleColor = (role: UserRole) => {
  const colors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "bg-purple-100 text-purple-800 border-purple-200",
    [UserRole.ADMIN]: "bg-blue-100 text-blue-800 border-blue-200",
    [UserRole.RESP_MARKETING]: "bg-green-100 text-green-800 border-green-200",
    [UserRole.MARKETING]: "bg-emerald-100 text-emerald-800 border-emerald-200",
    [UserRole.RESP_ATT_ALUMNO]: "bg-amber-100 text-amber-800 border-amber-200",
    [UserRole.ATT_ALUMNO]: "bg-orange-100 text-orange-800 border-orange-200",
    [UserRole.COACH_HEBREO]: "bg-indigo-100 text-indigo-800 border-indigo-200",
    [UserRole.COACH_MENTORIA]: "bg-teal-100 text-teal-800 border-teal-200",
    [UserRole.VENTAS]: "bg-red-100 text-red-800 border-red-200",
    [UserRole.USER]: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200"; // Fallback color
};

    // Función para obtener color de fondo para avatar basado en nombre
  export const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-amber-100 text-amber-800",
      "bg-rose-100 text-rose-800",
      "bg-cyan-100 text-cyan-800",
    ];

    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };