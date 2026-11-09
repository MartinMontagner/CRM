import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { RoleDescription } from "@/model/auth/AuthData";
import { CountApproved, User } from "@/model/user/User";
import { UserRole } from "@/types/Roles";
import axios from "axios";
import { useMutation, useQuery } from "react-query";

const client = createRefreshTokenHttpClient("/user");
const publicClient = axios.create({
  baseURL: BACKEND_URL + "/user",
});
publicClient.interceptors.request.use(
  (config) => config,
  (error) => error
);
publicClient.interceptors.response.use(
  (response) => response,
  (error) => error
);

export const getUser = async (authData: {
  userId: number;
  accessToken: string;
}) => {
  return (
    await client.get<User>("", {
      headers: {
        userId: authData.userId,
      },
    })
  ).data;
};
export const getUserAll = async ()=>{return (await client.get<User[]>("/all", {})).data;
};
export const updateUserRole = async (userId: number, role: UserRole) => {
  return await client.put<User>(`/${userId}`, {
    role
  });
};

export const setPassword = async (
  authData: { userId: number; accessToken: string },
  currentPassword: string,
  newPassword: string
) => {
  return await client.put<string>(
    "/password",
    {
      currentPassword,
      newPassword,
    },
    {
      headers: {
        userId: authData.userId,
        Authorization: `Bearer ${authData.accessToken}`,
      },
    }
  );
};

export const recoverPassword = async (email: string) => {
  return await publicClient.post("/recover-password", {
    email,
  });
};

export const resetPassword = async (
  newPassword: string,
  passwordResetCode: string
) => {
  return await publicClient.put("/reset-password", {
    newPassword,
    passwordResetCode,
  });
};

export const getPendingUsers = async () => {
  const response = await client.get<User[]>("/pending");
  return response.data;
};

export const useApprovedUsersToday = () => {
  return useQuery({
    queryKey: ["approvedUsersToday"],
    queryFn: async () => {
      const response = await client.get<CountApproved>("/approved/today");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useEnableUser = () => {
  return useMutation({
    mutationFn: async ({
      userIdToEnable,
      role,
    }: {
      userIdToEnable: number;
      role: UserRole;
    }) => {
      const queryParams = new URLSearchParams();
      queryParams.append("role", role);
      const response = await client.put<User>(
        `/${userIdToEnable}/enable`,
        {},
        { params: queryParams }
      );
      return response.data;
    },
  });
};

/**
 * Obtiene ciudades
 * @returns Datos paginados de ciudades
 */
export const getRoles = async (): Promise<RoleDescription[]> => {
  const response = await client.get<RoleDescription[]>("/roles");
  
  const allowedRoles = ['ADMIN', 'COACH_HEBREO', 'COACH_MENTORIA', 'USER', 'VENTAS'];
  
  const filteredRoles = response.data.filter(roleDescription => 
    allowedRoles.includes(roleDescription.role.toString())
  );
  
  return filteredRoles;
};
export const toggleUserStatus = async (userId: number): Promise<string> => {
  try {
    const response = await client.put<string>(`/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw error;
  }
};


export const sendPasswordReset = async (email: string): Promise<string> => {
  try {
    const response = await client.post('/recover-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error al enviar email de restablecimiento:', error);
    throw error;
  }
};