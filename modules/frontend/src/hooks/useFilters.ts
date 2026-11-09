// useFilters.ts

import { create } from "zustand";
import { Filter, FilterTag } from "../types/types";

interface FiltersState {
  appliedFilters: Filter[];
  globalFilter: string;
  selectedField: string;
  filterValue: string;
  setSelectedField: (field: string) => void;
  setFilterValue: (value: string) => void;
  setGlobalFilter: (value: string) => void;
  addFilter: (value: FilterTag) => void;
  addFiltersFromTag: (tags: FilterTag[]) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  appliedFilters: [],
  globalFilter: "",
  selectedField: "email",
  filterValue: "",
  setSelectedField: (field) => set({ selectedField: field }),
  setFilterValue: (value) => set({ filterValue: value }),
  setGlobalFilter: (value) => set({ globalFilter: value }),
  addFilter: (value) => {
    set((state) => {
      return {
        appliedFilters: [
          ...state.appliedFilters,
          {
            field: value.field,
            value: value.value,
          },
        ],
      };
    });
  },
  addFiltersFromTag: (tags) => {
    const newFilters = tags.map((tag) => ({
      field: tag.field,
      value: tag.value,
    }));
    set((state) => {
      return {
        appliedFilters: [...state.appliedFilters, ...newFilters],
      };
    });
  },
  removeFilter: (index) =>
    set((state) => {
      const newFilters = [...state.appliedFilters];
      newFilters.splice(index, 1);
      return { appliedFilters: newFilters };
    }),
  clearFilters: () =>
    set({
      appliedFilters: [],
      globalFilter: "",
    }),
}));
