import { useQuery } from "react-query";
import { AxiosError } from "axios";
import { RoleDescription } from "@/model/auth/AuthData";
import { getRoles } from "@/service/user/UserService";

/**
 * Hook para obtener las ciudades con estados de carga y error
 */
export const useRoles = () => {
  return useQuery<RoleDescription[], AxiosError>({
    queryKey: ["roles"],
    queryFn: async () => {
      return await getRoles(); 
    },
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000,
  });
};