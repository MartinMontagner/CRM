import { FilterTag } from "@/types/types";
import { X } from "lucide-react";

export const FilterTagComponent = ({
  tag,
  onRemove,
}: {
  tag: FilterTag;
  onRemove: () => void;
}) => (
  <div className="flex items-center bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded px-2 py-1 mr-2 mb-1 text-xs">
    <span className="mr-1">{tag.value}</span>
    <button
      onClick={onRemove}
      className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100"
    >
      <X size={12} />
    </button>
  </div>
);
