import { Button } from "@/components/ui/button";
import { FilterCondition } from "@/service/wordpress/MemberService";
import { Modal } from "@mantine/core";
import { useState } from "react";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    fields: string[];
    fieldDisplayNames: Record<string, string>;
    appliedFilters: FilterCondition[];
    onAddFilter: (field: string, value: string) => void;
    onRemoveFilter: (index: number) => void;
    onClearFilters: () => void;
    onApplyFilters: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
    onClose,
    fields,
    fieldDisplayNames,
    appliedFilters,
    onAddFilter,
    onRemoveFilter,
    onClearFilters,
    onApplyFilters
}) => {
    const [selectedField, setSelectedField] = useState<string>("");
    const [filterValue, setFilterValue] = useState<string>("");
    const [open, setOpen] = useState(false);

    const handleOpenFilterModal = () => {
        setOpen(true);
    };

    const handleCloseFilterModal = () => {
        setOpen(false);
        onClose();
    };

    const handleAddFilter = () => {
        if (selectedField && filterValue) {
            onAddFilter(selectedField, filterValue);
            setSelectedField("");
            setFilterValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && selectedField && filterValue) {
            handleAddFilter();
        }
    };

    return (
        <>
            <Button
                onClick={handleOpenFilterModal}
                className="bg-blue-500 hover:bg-blue-600 font-semibold mt-6"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Filtrar
            </Button>

            <Modal
                opened={open}
                onClose={handleCloseFilterModal}
                title="Filtrar Subscripciones"
                size="lg"
            >
                <div className="p-4 flex flex-col space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fieldSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                Campo
                            </label>
                            <select
                                id="fieldSelect"
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Seleccionar campo</option>
                                {fields.map((field) => (
                                    <option key={field} value={field}>
                                        {fieldDisplayNames[field] || field}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="valueInput" className="block text-sm font-medium text-gray-700 mb-1">
                                Valor
                            </label>
                            <input
                                type="text"
                                id="valueInput"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Introduce el valor"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleAddFilter}
                            disabled={!selectedField || !filterValue}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Añadir Filtro
                        </Button>
                    </div>

                    {/* Lista de filtros aplicados */}
                    {appliedFilters.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Filtros aplicados:</h3>
                            <div className="flex flex-wrap gap-2">
                                {appliedFilters.map((filter, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                                    >
                                        <span className="text-sm">
                                            {fieldDisplayNames[filter.field] || filter.field}: {filter.value}
                                        </span>
                                        <button
                                            onClick={() => onRemoveFilter(index)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={onClearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Limpiar todos
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={handleCloseFilterModal}
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={() => {
                                onApplyFilters();
                                handleCloseFilterModal();
                            }}
                            className="bg-primary-600 hover:bg-primary-700"
                        >
                            Aplicar Filtros
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};