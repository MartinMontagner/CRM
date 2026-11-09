import { FIELD_DISPLAY_NAMES } from "@/types/types";
import { ChevronDown, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HeaderDropdown } from "./HeaderDropdown";
import { useSorting } from "@/hooks/useSorting";

interface HeaderCellProps {
    field: string
}

export const HeaderCell = ({ field } : HeaderCellProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasFilter = false;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { sortConfig} = useSorting();
  
    // Cerrar el menú al hacer clic fuera
    useEffect(() => {
      const handleClickOutside = (event : MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    

    
    // Manejar clic en dropdown para filtros
    const toggleDropdown = (e: React.MouseEvent) => {
      e.stopPropagation(); // Evitar que se active el ordenamiento
      setIsOpen(!isOpen);
    };
    
    // Determinar qué icono de ordenamiento mostrar
    const getSortIcon = () => {
      if (sortConfig.field === field) {
        if (sortConfig.direction === 'asc') {
          return <ArrowUp size={14} className="text-indigo-600" />;
        } else if (sortConfig.direction === 'desc') {
          return <ArrowDown size={14} className="text-indigo-600" />;
        }
      }
      return null;
    };
  
    return (
      <div className="relative w-full h-full" ref={dropdownRef}>
        <div 
          className="flex items-center justify-between px-2 py-1 w-full h-full cursor-pointer"
           onClick={toggleDropdown}
        >
          <div className="flex items-center">
            <span>{FIELD_DISPLAY_NAMES[field] || field}</span>
            {getSortIcon()}
          </div>
          <div 
            className="flex items-center"
          >
            {hasFilter && (
              <Filter size={14} className="text-indigo-600 mr-1" />
            )}
            <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
        </div>
        
        {isOpen && (
          <HeaderDropdown 
            field={field} 
            onClose={() => setIsOpen(false)} 
          />
        )}
      </div>
    );
  };