import { WazendInstanceDTO } from "@/model/chats/Chat";
import { WazendCreateInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import {
  createInstance,
  deleteInstance,
  getAllWazendInstances,
  getWazendInstance,
  updateInstance,
} from "@/service/chat/WazendService";
import { useMutation, useQuery, useQueryClient } from "react-query";

// Claves de consulta
export const wazendKeys = {
  all: ["wazend"] as const,
  instances: () => [...wazendKeys.all, "instances"] as const,
  instance: (id: number) => [...wazendKeys.instances(), id] as const,
};

export const useWazendQuery = () => {
  const queryClient = useQueryClient();

  // Obtener todas las instancias
  const getInstancesQuery = useQuery({
    queryKey: wazendKeys.instances(),
    queryFn: getAllWazendInstances,
    refetchOnWindowFocus: false,
  });

  // Obtener una instancia específica
  const getInstanceById = (id: number) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery({
      queryKey: wazendKeys.instance(id),
      queryFn: () => getWazendInstance(id),
      enabled: !!id, // Solo ejecutar si hay un ID
    });
  };

  // Crear una instancia
  const createInstanceMutation = useMutation({
    mutationFn: (newInstance: WazendCreateInstanceDTO) =>
      createInstance(newInstance),
    onSuccess: () => {
      // Invalidar consultas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: wazendKeys.instances() });
    },
  });

  // Actualizar una instancia
  const updateInstanceMutation = useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: number } & Partial<Omit<WazendInstanceDTO, "id">>) =>
      updateInstance(id, updates),
    onSuccess: (data) => {
      // Actualizar caché
      queryClient.invalidateQueries({ queryKey: wazendKeys.instances() });
      queryClient.invalidateQueries({ queryKey: wazendKeys.instance(data.id) });
    },
  });

  // Eliminar una instancia
  const deleteInstanceMutation = useMutation({
    mutationFn: (id: number) => deleteInstance(id),
    onSuccess: () => {
      // Actualizar caché
      queryClient.invalidateQueries({ queryKey: wazendKeys.instances() });
    },
  });

  return {
    // Queries
    getInstancesQuery,
    getInstanceById,

    // Mutations
    createInstanceMutation,
    updateInstanceMutation,
    deleteInstanceMutation,
  };
};
