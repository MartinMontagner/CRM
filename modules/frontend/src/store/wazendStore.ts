import { create } from 'zustand';
import { createInstance, deleteInstance, getAllWazendInstances, getWazendInstance, updateInstance } from '@/service/chat/WazendService';
import { WazendInstanceDTO } from '@/model/wazend/WazendInstanceDTO';

interface WazendStore {
  instances: WazendInstanceDTO[];
  isLoading: boolean;
  error: string | null;
  selectedInstance: WazendInstanceDTO | null;
  
  // Acciones
  fetchInstances: () => Promise<void>;
  fetchInstanceById: (id: number) => Promise<void>;
  createInstance: (instance: Omit<WazendInstanceDTO, 'id'>) => Promise<void>;
  updateInstance: (id: number, updates: Partial<Omit<WazendInstanceDTO, 'id'>>) => Promise<void>;
  deleteInstance: (id: number) => Promise<void>;
  setSelectedInstance: (instance: WazendInstanceDTO | null) => void;
}

export const useWazendStore = create<WazendStore>((set) => ({
  instances: [],
  isLoading: false,
  error: null,
  selectedInstance: null,
  
  fetchInstances: async () => {
    set({ isLoading: true, error: null });
    try {
      const instances = await getAllWazendInstances();
      set({ instances, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cargar instancias', 
        isLoading: false 
      });
    }
  },
  
  fetchInstanceById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const instance = await getWazendInstance(id);
      set({ selectedInstance: instance, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al cargar la instancia ${id}`, 
        isLoading: false 
      });
    }
  },
  
  createInstance: async (instance: Omit<WazendInstanceDTO, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newInstance = await createInstance(instance);
      set(state => ({ 
        instances: [...state.instances, newInstance],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear instancia', 
        isLoading: false 
      });
    }
  },
  
  updateInstance: async (id: number, updates: Partial<Omit<WazendInstanceDTO, 'id'>>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedInstance = await updateInstance(id, updates);
      set(state => ({
        instances: state.instances.map(inst => 
          inst.id === id ? updatedInstance : inst
        ),
        selectedInstance: state.selectedInstance?.id === id ? updatedInstance : state.selectedInstance,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al actualizar la instancia ${id}`, 
        isLoading: false 
      });
    }
  },
  
  deleteInstance: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteInstance(id);
      set(state => ({ 
        instances: state.instances.filter(inst => inst.id !== id),
        selectedInstance: state.selectedInstance?.id === id ? null : state.selectedInstance,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Error al eliminar la instancia ${id}`, 
        isLoading: false 
      });
    }
  },
  
  setSelectedInstance: (instance: WazendInstanceDTO | null) => {
    set({ selectedInstance: instance });
  }
}));