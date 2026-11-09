import { useFiltersStore } from "@/hooks/useFilters";
import { FilterTag, SelectFilterFields } from "@/types/types";
import { useState, useEffect, useRef, useMemo } from "react";

interface SelectTipesProps {
  field: string;
  setFilterTagSelected: (tag: FilterTag) => void;
}

export const SelectTipes = ({
  field,
  setFilterTagSelected,
}: SelectTipesProps) => {
  const options = useMemo(
    () => SelectFilterFields[field].content || [],
    [field]
  );
  const original = SelectFilterFields[field].original || [];
  const [selected, setSelected] = useState<number>(-1);
  const { appliedFilters } = useFiltersStore();

  // Estados adicionales para la búsqueda
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Manejar clic fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //Normalizar texto removiendo tildes y caracteres especiales
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres con tildes
      .replace(/[\u0300-\u036f]/g, '') // Remueve los diacríticos (tildes)
      .replace(/[^a-z0-9\s]/g, ''); // Remueve caracteres especiales excepto espacios
  };

  // Filtrar opciones cuando cambia el valor de búsqueda
  useEffect(() => {
    if (searchValue.trim() === "") {
      //Cuando no hay búsqueda, mostrar todas las opciones sin duplicados
      const uniqueOptions = options.filter((option, index, array) => 
        array.indexOf(option) === index
      );
      setFilteredOptions(uniqueOptions);
    } else {
      //Filtrar con normalización de texto (sin tildes)
      const normalizedSearch = normalizeText(searchValue);
      const filtered = options.filter((option, index, array) => {
        const normalizedOption = normalizeText(option);
        return normalizedOption.includes(normalizedSearch) &&
               array.indexOf(option) === index; //Elimina duplicados
      });
      setFilteredOptions(filtered);
    }
  }, [searchValue, options]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number(event.target.value);
    if (index >= 0) {
      setSelected(index);
    } else {
      setSelected(-1);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setIsDropdownOpen(true);
    //Resetear la selección cuando el usuario empieza a escribir
    setSelected(-1);
  };

  const handleOptionClick = (index: number) => {
    //Obtener el valor de la opción filtrada
    const selectedOption = filteredOptions[index];
    
    //Buscar en el array original usando el nombre de la opción
    const originalIndex = options.indexOf(selectedOption);

    if (originalIndex !== -1) {
      setSelected(originalIndex);
      setSearchValue(selectedOption);
      setIsDropdownOpen(false);
    }
  };

  //Limpiar búsqueda y selección
  const handleClearSearch = () => {
    setSearchValue("");
    setSelected(-1);
    setIsDropdownOpen(false);
  };

  const createFilterTag = (value: string) => {
    if (selected === -1) return;
    if (
      appliedFilters.find(
        (filter) => filter.field === field && filter.value === value
      )
    )
      return;

    const newTag: FilterTag = {
      id: `${field}-${value}`,
      field,
      value: value,
    };

    setFilterTagSelected(newTag);
  };

  // Efecto para observar cambios en originalSelected
  useEffect(() => {
    if (selected === -1) return;
    createFilterTag(original[selected]);
  }, [selected]);

  // Renderizado condicional para el dropdown de búsqueda de países
  if (field === "addressCountry") {
    return (
      <div className="relative mt-2" ref={dropdownRef}>
        {/* Input de búsqueda */}
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 text-black dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Buscar país..."
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {/*Botón para limpiar búsqueda */}
          {searchValue && (
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown de opciones filtradas */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 max-h-44 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded shadow-lg">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => { // ✅ Usar index de filteredOptions
                return (
                  <div
                    key={option}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 text-black text-sm"
                    onClick={() => handleOptionClick(index)} // ✅ Pasar el índice correcto
                  >
                    {option}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-black dark:text-gray-400">
                No se encontraron resultados
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Para otros campos, que no sean addressCountry
  return (
    <div className="max-h-40 overflow-y-auto mt-2">
      <select
        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded"
        onChange={handleChange}
        defaultValue="-1"
      >
        <option value="-1" disabled>
          Selecciona una opción
        </option>
        {options.map((option, index) => (
          <option
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded text-black"
            key={option}
            value={index}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};