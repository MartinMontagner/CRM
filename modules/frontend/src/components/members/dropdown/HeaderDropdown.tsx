import { useState } from "react";
import { useSorting } from "@/hooks/useSorting";
import { FilterTag, SortDirection } from "@/types/types";
import { SortFilter } from "./SortFilter";
import {
  excludeBoth,
  excludeFieldsForSorting,
  includeSelect,
} from "@/utils/excludeFilters";
import { FilterTagComponent } from "./FilterTagDopdown";
import { InputFilter } from "./InputFilter";
import { useFiltersStore } from "@/hooks/useFilters";
import { SelectTipes } from "./SelectTipes";

interface HeaderDropdownProps {
  field: string;
  onClose: () => void;
}

export const HeaderDropdown = ({ field, onClose }: HeaderDropdownProps) => {
  const { handleSort, sortConfig } = useSorting(); // Quitar resetSort
  const { addFiltersFromTag, addFilter } = useFiltersStore();
  const [tempSortDirection, setTempSortDirection] =
    useState<SortDirection | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [filterTags, setFilterTags] = useState<FilterTag[]>([]);
  const [filterTagSelected, setFilterTagSelected] = useState<FilterTag | null>(
    null
  );

  // Eliminar un filtro de la lista de etiquetas
  const removeFilterTag = (tagId: string) => {
    setFilterTags(filterTags.filter((tag) => tag.id !== tagId));
  };

  // Aplicar los filtros y actualizar las etiquetas
  const applyFilters = () => {
    // Manejo mejorado del sorting - ahora pasamos la dirección específica
    if (tempSortDirection !== null) {
      // Si hay una dirección temporal válida, aplicar sort con esa dirección específica
      handleSort(field, tempSortDirection);
    } else {
      // Si tempSortDirection es null, verificar si necesitamos limpiar el sort actual
      if (sortConfig.field === field && sortConfig.direction !== null) {
        // El usuario quiere quitar el sorting del field actual
        handleSort(field, null); // Usar handleSort con null para limpiar
      }
    }

    if (filterTagSelected) {
      addFilter(filterTagSelected);
    }

    // Agregar los filtros ya cargados
    if (filterTags.length > 0) {
      addFiltersFromTag(filterTags);
    }

    // Agregar el valor actual del input como filtro si existe
    if (filterValue.trim() !== "" && !includeSelect.includes(field)) {
      // Crear un nuevo FilterTag con el valor actual del input
      const newFilterTag: FilterTag = {
        id: Date.now().toString(), // Generar un ID único
        value: filterValue,
        field: field,
      };
      
      // Agregarlo directamente como filtro
      addFilter(newFilterTag);
    }

    onClose();
  };

  return (
    <div
      className="absolute top-full z-50 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 min-w-56"
      style={{ left: field === "category" ? "-8rem" : "0" }}
    >
      {/* Etiquetas de filtros aplicados */}
      {filterTags.length > 0 && (
        <div className="p-2 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap flex-row w-full ">
            {filterTags.map((tag) => (
              <FilterTagComponent
                key={tag.id}
                tag={tag}
                onRemove={() => removeFilterTag(tag.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="p-2">
        {/* Opciones de ordenamiento */}
        {!excludeFieldsForSorting.includes(field) && (
          <SortFilter
            field={field}
            setTempSortDirection={setTempSortDirection}
            tempSortDirection={tempSortDirection}
          />
        )}

        {/* Opciones de filtrado */}
        {!excludeBoth.includes(field) && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Filtrar
            </h4>
            <div className="px-2 py-1">
              {includeSelect.includes(field) ? (
                <SelectTipes field={field} setFilterTagSelected={setFilterTagSelected} />
              ) : (
                <InputFilter
                  field={field}
                  setFilterTags={setFilterTags}
                  filterTags={filterTags}
                  setFilterValue={setFilterValue}
                  filterValue={filterValue}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-slate-700 flex justify-between">
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={applyFilters}
          className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};