// AppliedFilters.tsx
import React from "react";
import { X } from "lucide-react";
import { ChatStatusTag, FIELD_DISPLAY_NAMES, Filter } from "@/types/types";

interface AppliedFiltersProps {
  filters: Filter[];
  onRemoveFilter: (index: number) => void;
  onClearFilters: () => void;
}

export const AppliedFilters: React.FC<AppliedFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearFilters,
}) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <div
            key={index}
            className="flex items-center hover:scale-[1.02] transition-transform cursor-pointer bg-white border border-gray-300 shadow-md px-3 py-1 rounded-full"
          >
            {filter.field != "chat" ? (
              <span className="text-sm font-medium">
                {FIELD_DISPLAY_NAMES[filter.field] || filter.field}:{" "}
                {filter.value}
              </span>
            ) : (
              <span className="text-sm font-medium">
                {FIELD_DISPLAY_NAMES[filter.field] || filter.field}:{" "}
                {ChatStatusTag[filter.value as keyof typeof ChatStatusTag]}
              </span>
            )}
            <X
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => onRemoveFilter(index)}
            />
          </div>
        ))}
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-500 hover:text-blue-700 ml-2"
        >
          Limpiar todos
        </button>
      </div>
    </div>
  );
};
