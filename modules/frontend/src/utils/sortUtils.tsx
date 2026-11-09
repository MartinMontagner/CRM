import { MemberSubscription, SortConfig } from "../types/types";

/**
 * Sort an array of MemberSubscription based on the provided sorting configuration
 */
export const sortMemberSubscriptions = (
  members: MemberSubscription[],
  sortConfig: SortConfig
): MemberSubscription[] => {
  if (sortConfig.direction === null || !sortConfig.field) {
    return members;
  }

  return [...members].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    // Manejar casos donde los valores pueden ser nulos
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortConfig.direction === "asc" ? 1 : -1;
    if (bValue === null) return sortConfig.direction === "asc" ? -1 : 1;

    // Ordenar strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue, undefined, {
        sensitivity: "base",
      });
      return sortConfig.direction === "asc" ? comparison : -comparison;
    }

    // Ordenar números
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    // Convertir a string como fallback para comparación
    const strA = String(aValue);
    const strB = String(bValue);
    const comparison = strA.localeCompare(strB, undefined, {
      sensitivity: "base",
    });
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
};

/**
 * Generate a sort icon based on the current sorting configuration
 */
export const getSortIcon = (field: string, sortConfig: SortConfig) => {
  if (sortConfig.field !== field) {
    return (
      <span className="ml-1 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 inline"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      </span>
    );
  }

  if (sortConfig.direction === "asc") {
    return (
      <span className="ml-1 text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 inline"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </span>
    );
  }

  if (sortConfig.direction === "desc") {
    return (
      <span className="ml-1 text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 inline"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="ml-1 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 inline"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    </span>
  );
};