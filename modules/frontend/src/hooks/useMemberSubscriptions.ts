import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  getFilteredMemberSubscriptions,
  getMemberSubscriptions,
} from "@/service/wordpress/MemberService";
import { Filter, MemberSubscription, SortConfig } from "../types/types";
import { convertDTOToMemberSubscription } from "../utils/filterUtils";

interface UseMemberSubscriptionsProps {
  appliedFilters: Filter[];
  sortConfig: SortConfig;
  pageSize?: number;
  page?: number;
}

export const useMemberSubscriptions = ({
  appliedFilters,
  sortConfig,
  pageSize = 20,
  page = 0,
}: UseMemberSubscriptionsProps) => {
  const [members, setMembers] = useState<MemberSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [totalFilteredItems, setTotalFilteredItems] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  
  // Usar ref para evitar recalcular el callback en cada cambio
  const appliedFiltersRef = useRef(appliedFilters);
  const sortConfigRef = useRef(sortConfig);
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);
  
  // Actualizar refs cuando los valores cambian
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);
  
  useEffect(() => {
    sortConfigRef.current = sortConfig;
  }, [sortConfig]);
  
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  
  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  // Fetch member subscriptions
  const fetchMemberSubscriptions = useCallback(
    async (pageNum: number, size: number, isInitialLoad = false) => {
      if (isFetching) return;

      setIsFetching(true);
      if (isInitialLoad) setLoading(true);

      try {
        // Solo pasamos la configuración de ordenamiento si hay field y direction no nulos
        const currentSortConfig = sortConfigRef.current;
        
        // Verificación estricta para evitar enviar ordenamiento predeterminado
        const sortConfigToSend = 
          currentSortConfig && 
          currentSortConfig.field !== null && 
          currentSortConfig.direction !== null
            ? { 
                field: currentSortConfig.field, 
                direction: currentSortConfig.direction 
              }
            : undefined;
        
        const currentFilters = appliedFiltersRef.current;

        if (currentFilters.length > 0) {
          // IMPORTANTE: Siempre usar página 0 cuando hay filtros aplicados
          // para garantizar que se muestren los resultados desde el principio
          const data = await getFilteredMemberSubscriptions(
            currentFilters,
            0, // Forzar siempre página 0 para filtros
            size,
            sortConfigToSend
          );

          // Convertir DTOs a subscripciones de miembros
          const convertedContent: MemberSubscription[] = data.content.map(
            convertDTOToMemberSubscription
          );

          setMembers(convertedContent);
          setTotalFilteredItems(data.totalElements);
        } else {
          // Cargar datos normales usando la página solicitada
          const data = await getMemberSubscriptions(
            pageNum, 
            size, 
            sortConfigToSend
          );

          // Convertir DTOs a subscripciones de miembros
          const convertedContent: MemberSubscription[] = data.content.map(
            convertDTOToMemberSubscription
          );

          setMembers(convertedContent);
          setTotalElements(data.totalElements);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar los datos";
        toast.error(errorMessage);
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    },
    [isFetching] // Simplifiquemos las dependencias
  );

  // Cargar datos iniciales al montar y cuando cambian parámetros clave
  useEffect(() => {
    const loadData = () => {
      // Si hay filtros aplicados, siempre cargar desde la página 0
      const pageToUse = appliedFilters.length > 0 ? 0 : page;
      fetchMemberSubscriptions(pageToUse, pageSize, true);
    };
    
    loadData();
    
    // No incluimos fetchMemberSubscriptions como dependencia para evitar bucles
  }, [page, pageSize, appliedFilters.length, 
      sortConfig.field, sortConfig.direction]);

  // Refrescar datos manualmente
  const refreshData = useCallback(() => {
    fetchMemberSubscriptions(pageRef.current, pageSizeRef.current, true);
  }, [fetchMemberSubscriptions]);

  return {
    members,
    loading,
    isFetching,
    totalFilteredItems,
    totalElements,
    fetchMemberSubscriptions,
    refreshData,
  };
};