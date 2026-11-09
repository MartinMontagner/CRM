import { create } from "zustand";
import { SortConfig, SortDirection } from "../types/types";

// Define el store de Zustand para ordenamiento
interface SortingState {
  sortConfig: SortConfig;
  lastSortConfig: SortConfig;
  initialLoadDone: boolean;
  setSortConfig: (config: SortConfig) => void;
  handleSort: (field: string, direction?: SortDirection) => void; // Añadir parámetro opcional
  hasSortChanged: () => boolean;
  resetSort: () => void;
}

export const useSortingStore = create<SortingState>((set, get) => ({
  // IMPORTANTE: Inicializar sin ordenamiento predeterminado
  sortConfig: {
    field: "",
    direction: null,
  },
  lastSortConfig: {
    field: "",
    direction: null,
  },
  initialLoadDone: false,

  setSortConfig: (config) => set({ sortConfig: config }),

  // Modificado para aceptar dirección específica
  handleSort: (field, direction) => {
    const { sortConfig } = get();

    // Si se proporciona una dirección específica, usarla directamente
    if (direction !== undefined) {
      if (direction === null) {
        // Limpiar el sorting
        set({ sortConfig: { field: "", direction: null } });
      } else {
        // Aplicar la dirección específica
        set({ sortConfig: { field, direction } });
      }
      return;
    }

    // Si no se proporciona dirección, usar la lógica cíclica original
    // (para mantener compatibilidad con otros usos del hook)
    if (sortConfig.field === field) {
      // Ciclo: asc -> desc -> sin orden
      if (sortConfig.direction === 'asc') {
        set({ sortConfig: { field, direction: 'desc' } });
      } else if (sortConfig.direction === 'desc') {
        set({ sortConfig: { field: "", direction: null } });
      } else {
        set({ sortConfig: { field, direction: 'asc' } });
      }
    } else {
      // Si es un campo diferente, comenzamos con asc
      set({ sortConfig: { field, direction: 'asc' } });
    }
  },

  hasSortChanged: () => {
    const { sortConfig, lastSortConfig, initialLoadDone } = get();

    if (!initialLoadDone) {
      set({ initialLoadDone: true, lastSortConfig: { ...sortConfig } });
      return false;
    }

    const sortChanged =
      lastSortConfig.field !== sortConfig.field ||
      lastSortConfig.direction !== sortConfig.direction;

    // Importante: crear copia para evitar referencias
    set({ lastSortConfig: { ...sortConfig } });
    return sortChanged;
  },

  resetSort: () => {
    set({
      sortConfig: { field: "", direction: null },
      lastSortConfig: { field: "", direction: null }
    });
  }
}));

// Hook para usar el store
export const useSorting = () => {
  const {
    sortConfig,
    handleSort,
    hasSortChanged,
    initialLoadDone,
    resetSort,
  } = useSortingStore();

  return {
    sortConfig,
    handleSort,
    hasSortChanged,
    initialLoadDone,
    resetSort,
  };
};