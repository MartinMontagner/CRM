import { FilterTag } from "@/types/types";
import { Send } from "lucide-react"; // Importar el ícono de Send

interface InputFilterProps {
  field: string;
  setFilterTags: (tags: FilterTag[]) => void;
  setFilterValue: (value: string) => void;
  filterValue: string;
  filterTags: FilterTag[];
}

export const InputFilter = ({
  field,
  setFilterTags,
  filterTags,
  setFilterValue,
  filterValue,
}: InputFilterProps) => {
  // Añadir un nuevo filtro a la lista de etiquetas
  const addFilterTag = (value: string) => {
    const newTag: FilterTag = {
      id: `${field}-${value}`,
      field,
      value,
    };
    setFilterTags([...filterTags, newTag]);
  };

  const handleSendClick = () => {
    if (filterValue.trim() && !filterTags.find((tag) => tag.value === filterValue)) {
      addFilterTag(filterValue);
      setFilterValue("");
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full px-2 py-1 pr-8 text-sm border border-gray-300 dark:border-slate-600 rounded text-black"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            filterValue.trim() &&
            !filterTags.find((tag) => tag.value === filterValue)
          ) {
            addFilterTag(filterValue);
            setFilterValue("");
          }
        }}
      />
      <button
        type="button"
        onClick={handleSendClick}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Send size={16} />
      </button>
    </div>
  );
};
