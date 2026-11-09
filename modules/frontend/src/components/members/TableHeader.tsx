import { Table } from "@mantine/core";
import { CheckSquare, MinusSquare, Square, Eraser } from "lucide-react";
import { FIELDS, MemberSubscription } from "@/types/types";
import { HeaderCell } from "./dropdown/HeaderCell";

interface TableHeaderProps {
  hasAppliedFilters: boolean;
  isLoading: boolean;
  isAutoLoading: boolean;
  members: MemberSubscription[];
  selectedIds: number[];
  onSelectAll: (members: MemberSubscription[]) => void;
  clearSelection: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  hasAppliedFilters,
  isLoading,
  isAutoLoading,
  members,
  selectedIds,
  onSelectAll,
  clearSelection
}) => {
  return (
    <Table.Thead className="sticky top-0 z-30">
      <Table.Tr>
        {/* Checkbox column - con posición sticky dentro de un thead sticky */}
        <Table.Th 
          className="sticky left-0 top-0 z-40 w-12 min-w-12 bg-white"
          style={{ 
            padding: 0, 
            textAlign: 'center',
          }}
        >
          <div className="w-full h-full flex items-center justify-center py-2">
            {hasAppliedFilters && !isLoading && !isAutoLoading && members.length > 0 ? (
              <div
                className="cursor-pointer"
                onClick={() => onSelectAll(members)}
              >
                {members.length > 0 && members.every((member) => selectedIds.includes(member.id)) ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : members.some((member) => selectedIds.includes(member.id)) ? (
                  <MinusSquare className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ) : (
              <button
                className="flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600 p-1 rounded transition-colors active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                title="Borrar selección"
                aria-label="Borrar selección"
              >
                <Eraser className="w-5 h-5" />
              </button>
            )}
          </div>
        </Table.Th> 

        {/* Renderizar el resto de columnas */}
        {FIELDS.map((field) => (
          <Table.Th
            key={field}
            className="sticky top-0 bg-white"
            style={{
              zIndex: 30,
              boxShadow: "0 .5px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <HeaderCell field={field} />
          </Table.Th>
        ))}
      </Table.Tr>
    </Table.Thead>
  );
};