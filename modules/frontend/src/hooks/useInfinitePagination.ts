/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useInfinitePagination.ts
import { useInfiniteQuery, useQueryClient } from "react-query";
import { useCallback, useRef } from "react";

interface PaginatedResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  size: number;
  totalElements: number;
  totalPages: number;
}

interface UseInfinitePaginationProps<T, P> {
  queryKey: (string | number | Record<string, any>)[];
  queryFn: (params: P & { page: number }) => Promise<PaginatedResponse<T>>;
  queryParams: P;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export function useInfinitePagination<T, P extends Record<string, any>>({
  queryKey,
  queryFn,
  queryParams,
  enabled = true,
  refetchOnWindowFocus = false,
}: UseInfinitePaginationProps<T, P>) {
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        return await queryFn({ ...queryParams, page: pageParam });
      } catch (error) {
        console.error("Error en queryFn:", error);
        // Devolver respuesta vacía válida en caso de error
        return {
          content: [],
          empty: true,
          first: true,
          last: true,
          number: 0,
          numberOfElements: 0,
          pageable: {
            pageNumber: 0,
            pageSize: 10,
          },
          size: 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      if (
        !lastPage ||
        lastPage.last ||
        !lastPage.content ||
        lastPage.content.length === 0
      ) {
        return undefined;
      }

      if (
        lastPage.pageable &&
        typeof lastPage.pageable.pageNumber === "number"
      ) {
        return lastPage.pageable.pageNumber + 1;
      }

      return undefined;
    },
    enabled,
    refetchOnWindowFocus,
  });

  // Aplanar los resultados de las páginas
  const items = (data?.pages?.flatMap((page) =>
    Array.isArray(page?.content) ? page.content : []
  ) || []) as T[];

  // Hook para el observer de scroll infinito
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          console.log("Intersection observed, loading next page");
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  // Función para invalidar las consultas
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries(queryKey);
  }, [queryClient, queryKey]);

  return {
    data,
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    error,
    lastItemRef,
    invalidateQueries,
  };
}