// FilterBar.tsx
import React from "react";
import { Button } from "@mantine/core";
import { FIELD_DISPLAY_NAMES } from "@/types/types";

interface FilterBarProps {
  selectedField: string;
  filterValue: string;
  onFieldChange: (field: string) => void;
  onValueChange: (value: string) => void;
  onAddFilter: () => void;
  hasAppliedFilters: boolean;
  onRefresh: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedField,
  filterValue,
  onFieldChange,
  onValueChange,
  onAddFilter,
  hasAppliedFilters,
  onRefresh,
}) => {
  return (
    <div className="mb-4 bg-white rounded-md">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selectedField}
          onChange={(e) => onFieldChange(e.target.value)}
          className="w-[150px] border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:border-blue-400 focus:ring-0"
        >
          <option value="" disabled>
            Campo
          </option>
          {Object.entries(FIELD_DISPLAY_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          value={filterValue}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Valor del filtro"
          className="w-[200px] border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:border-blue-400 focus:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddFilter();
            }
          }}
        />
        
        <Button
          onClick={onAddFilter}
          className="bg-primary-600 font-semibold"
        >
          Añadir Filtro
        </Button>

        {hasAppliedFilters && (
          <Button
            onClick={onRefresh}
            className="bg-blue-500 hover:bg-blue-600 font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Actualizar
          </Button>
        )}
      </div>
    </div>
  );
};