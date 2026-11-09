import { Filter } from "@/components/constants/Filter";
import { ConversationDTO } from "@/model/chats/Chat";
import { PlatformType } from "@/model/chats/PlatformType";
import { ReadStatusType } from "@/model/chats/ReadStatusType";
import { create } from "zustand";
import { StudentTagType } from "@/types/StudentTags";

interface FilterSelectedState {
  selectedFilters: string[];
  searchText: string;
  advancedFilters: Record<string, string>; // Store additional filters (e.g. country, name)
  isAdvancedFilterActive: boolean; // Control if advanced filter is active
  readStatus: ReadStatusType; // estado para el estado de lectura
  selectedPlatform: PlatformType; // propiedad para almacenar la plataforma seleccionada
  selectedStudentTags: StudentTagType; // propiedad para almacenar el tag de estudiante seleccionado
  previousFilters: {
    selectedFilters: string[];
    searchText: string;
    advancedFilters: Record<string, string>;
    selectedPlatform: PlatformType;
  } | null; // Store previous filter state for restoration
  wazendInstanceId: number | null; // propiedad para almacenar el ID de la instancia de Wazend

  // Filter management methods
  setSelected: (filter: string) => void;
  setSearchText: (text: string) => void;
  setReadStatus: (readStatus: ReadStatusType) => void; // Método para establecer el estado de lectura
  setPlatform: (platform: PlatformType) => void; // método para cambiar la plataforma
  setStudentTags: (tag: StudentTagType) => void; // método para cambiar el tag de estudiante
  addAdvancedFilter: (key: string, value: string) => void;
  removeAdvancedFilter: (key: string) => void;
  toggleAdvancedFilterActive: (isActive: boolean) => void;
  resetFilters: () => void;
  savePreviousFilters: () => void;
  restorePreviousFilters: () => void;
  applyFilters: (conversations: ConversationDTO[]) => ConversationDTO[];
  setWazendInstanceId: (id: number | null) => void; // método para actualizar wazendInstanceId
}

const DEFAULT_STATE = {
  selectedFilters: [Filter.ALL],
  searchText: "",
  advancedFilters: {},
  isAdvancedFilterActive: false,
  readStatus: "ALL" as ReadStatusType, // Valor inicial de readStatus
  selectedPlatform: 'ALL' as PlatformType,
  selectedStudentTags: 'ALL' as StudentTagType,
  previousFilters: null,
  wazendInstanceId: null, // Valor inicial de wazendInstanceId
};

export const useFilterSelectedStore = create<FilterSelectedState>((set, get) => ({
  ...DEFAULT_STATE,
  
  // Set main filter (tag)
  setSelected: (filter) => 
    set((state) => {
      return { 
        ...state,
        selectedFilters: filter ? [filter] : [Filter.ALL],
      };
    }),
  
  // Set read status filter
  setReadStatus: (readStatus) => 
    set((state) => {
      return { 
        ...state,
        readStatus: readStatus,
      };
    }),
  
  // Set platform filter
  setPlatform: (platform) => 
    set((state) => ({
      ...state,
      selectedPlatform: platform
    })),
  
  // Set student tags filter
  setStudentTags: (tag) =>
    set((state) => ({
      ...state,
      selectedStudentTags: tag
    })),
    
  // Set search text
  setSearchText: (text) => 
    set((state) => {
      // If clearing search text and we had previous text, save it
      const shouldSavePrevious = state.searchText && !text && !state.previousFilters;
      
      return { 
        ...state,
        searchText: text,
        ...(shouldSavePrevious ? {
          previousFilters: {
            selectedFilters: [...state.selectedFilters],
            searchText: state.searchText,
            advancedFilters: {...state.advancedFilters},
            selectedPlatform: state.selectedPlatform
          }
        } : {})
      };
    }),
  
  // Add advanced filter
  addAdvancedFilter: (key, value) =>
    set((state) => {
      // Save current filters before adding advanced filter
      const currentFilters = {
        selectedFilters: [...state.selectedFilters],
        searchText: state.searchText,
        advancedFilters: {...state.advancedFilters},
        selectedPlatform: state.selectedPlatform
      };
      
      return {
        ...state,
        advancedFilters: {
          ...state.advancedFilters,
          [key]: value
        },
        isAdvancedFilterActive: true,
        previousFilters: !state.isAdvancedFilterActive ? currentFilters : state.previousFilters
      };
    }),
  
  // Remove advanced filter
  removeAdvancedFilter: (key) =>
    set((state) => {
      const newFilters = { ...state.advancedFilters };
      delete newFilters[key];
      
      // If no advanced filters remain, deactivate advanced mode
      const hasFilters = Object.keys(newFilters).length > 0;
      
      return {
        ...state,
        advancedFilters: newFilters,
        isAdvancedFilterActive: hasFilters
      };
    }),
  
  // Toggle advanced filter active state
  toggleAdvancedFilterActive: (isActive) =>
    set((state) => ({
      ...state,
      isAdvancedFilterActive: isActive
    })),
  
  // Save current filter state
  savePreviousFilters: () => 
    set((state) => ({
      ...state,
      previousFilters: {
        selectedFilters: [...state.selectedFilters],
        searchText: state.searchText,
        advancedFilters: {...state.advancedFilters},
        selectedPlatform: state.selectedPlatform
      }
    })),
  
  // Restore previous filter state
  restorePreviousFilters: () => 
    set((state) => {
      if (!state.previousFilters) return state;
      
      return {
        ...state,
        selectedFilters: [...state.previousFilters.selectedFilters],
        searchText: state.previousFilters.searchText,
        advancedFilters: {...state.previousFilters.advancedFilters},
        selectedPlatform: state.previousFilters.selectedPlatform,
        previousFilters: null
      };
    }),
  
  // Reset all filters to initial state
  resetFilters: () => 
    set((state) => ({ 
      ...DEFAULT_STATE,
      // Optionally save current filters if they're not empty
      ...(
        (state.selectedFilters.length > 0 && state.selectedFilters[0] !== Filter.ALL) || 
        state.searchText || 
        Object.keys(state.advancedFilters).length > 0 ||
        state.selectedPlatform !== 'ALL'
          ? {
              previousFilters: {
                selectedFilters: [...state.selectedFilters],
                searchText: state.searchText,
                advancedFilters: {...state.advancedFilters},
                selectedPlatform: state.selectedPlatform
              }
            }
          : {}
      )
    })),
    
  // Apply filters to conversation list
  applyFilters: (conversations) => {
    const state = get();
    let filtered = [...conversations];
    
    // Aplicar filtro de plataforma (siempre)
    if (state.selectedPlatform !== 'ALL') {
      filtered = filtered.filter(convo => {
        // Filtrar por la propiedad 'platform' del objeto ConversationDTO
        // Si la conversación no tiene platform definido, se asume que es de WhatsApp (para compatibilidad)
        const convoPlatform = convo.conversationType || 'WHATSAPP';
        return convoPlatform === state.selectedPlatform;
      });
    }
    
    // Apply text search (always applies, regardless of active filter)
    if (state.searchText) {
      const searchLower = state.searchText.toLowerCase();
      filtered = filtered.filter(convo => {
        return (
          (convo.studentName && convo.studentName.toLowerCase().includes(searchLower)) ||
          (convo.phoneNumber && convo.phoneNumber.toLowerCase().includes(searchLower)) ||
          (convo.lastMessage && convo.lastMessage.toLowerCase().includes(searchLower))
        );
      });
    }
    
    
    return filtered;
  },

  // Nuevo método para actualizar wazendInstanceId
  setWazendInstanceId: (id) =>
    set((state) => ({
      ...state,
      wazendInstanceId: id,
    })),
}));