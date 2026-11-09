import { useSorting } from "@/hooks/useSorting";
import { SortDirection } from "@/types/types";
import { SortAsc, SortDesc } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderDropdownProps {
  field: string;
  setTempSortDirection: (sort: SortDirection) => void;
  tempSortDirection: SortDirection;
}

export const SortFilter = ({
  field,
  setTempSortDirection,
  tempSortDirection,
}: HeaderDropdownProps) => {
  const { sortConfig } = useSorting();
  // Estado adicional para forzar re-renders cuando sea necesario
  const [removeFlag, setRemoveFlag] = useState(false);

  // Reset removeFlag cuando cambia tempSortDirection
  useEffect(() => {
    if (tempSortDirection !== null) {
      setRemoveFlag(false);
    }
  }, [tempSortDirection]);

  const handleSortAsc = () => {
    const isCurrentFieldSorted = sortConfig.field === field;
    const isCurrentlyAppliedAsc = isCurrentFieldSorted && sortConfig.direction === "asc";
    
    // Si ya está aplicado en "asc" y no hay cambio temporal, entonces deseleccionar
    if (isCurrentlyAppliedAsc && tempSortDirection === null) {
      setRemoveFlag(true); // Activar flag de remoción
      setTempSortDirection(null);
    }
    // Si ya tenemos tempSortDirection === "asc", entonces deseleccionar
    else if (tempSortDirection === "asc") {
      setTempSortDirection(null);
    }
    // En cualquier otro caso, seleccionar "asc"
    else {
      setTempSortDirection("asc");
    }
  };

  const handleSortDesc = () => {
    const isCurrentFieldSorted = sortConfig.field === field;
    const isCurrentlyAppliedDesc = isCurrentFieldSorted && sortConfig.direction === "desc";
    
    // Si ya está aplicado en "desc" y no hay cambio temporal, entonces deseleccionar
    if (isCurrentlyAppliedDesc && tempSortDirection === null) {
      setRemoveFlag(true); // Activar flag de remoción
      setTempSortDirection(null);
    }
    // Si ya tenemos tempSortDirection === "desc", entonces deseleccionar
    else if (tempSortDirection === "desc") {
      setTempSortDirection(null);
    }
    // En cualquier otro caso, seleccionar "desc"
    else {
      setTempSortDirection("desc");
    }
  };

  const styleSort = (direction: SortDirection) => {
    const isCurrentFieldSorted = sortConfig.field === field;
    const isAppliedDirection = isCurrentFieldSorted && sortConfig.direction === direction;
    const isTemporalDirection = tempSortDirection === direction;
    const isDeselecting = removeFlag && tempSortDirection === null && isAppliedDirection;
    
    // Prioridad de estados:
    // 1. Deseleccionando (gris) - cuando el usuario está quitando un filtro aplicado
    if (isDeselecting) {
      return "font-semibold text-gray-500"; // Gris para mostrar que se está deseleccionando
    }
    
    // 2. Temporal (azul) - cuando el usuario seleccionó pero aún no aplicó
    if (isTemporalDirection && tempSortDirection !== null) {
      return "font-semibold text-blue-600"; // Azul para selección temporal
    }
    
    // 3. Aplicado (verde) - cuando el filtro está activo y no hay cambio temporal
    if (isAppliedDirection && tempSortDirection === null && !removeFlag) {
      return "font-semibold text-green-600"; // Verde para filtro aplicado
    }
    
    // 4. Inactivo (gris) - estado por defecto
    return "text-gray-700";
  };

  return (
    <div className="mb-3">
      <h4 className="text-xs font-normal text-gray-500 dark:text-gray-400 mb-1">
        Ordenar
      </h4>
      <button
        onClick={handleSortAsc}
        className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-sm flex items-center gap-2"
      >
        <SortAsc size={16} className="text-gray-600 dark:text-gray-300" />
        <span className={styleSort("asc")}>Ascendente</span>
      </button>
      <button
        onClick={handleSortDesc}
        className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-sm flex items-center gap-2"
      >
        <SortDesc size={16} className="text-gray-600 dark:text-gray-300" />
        <span className={styleSort("desc")}>Descendente</span>
      </button>
    </div>
  );
};