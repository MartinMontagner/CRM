import React, { useState } from "react";
import { Table } from "@mantine/core";
import { TableRow } from "./TableRow";
import { MemberSubscription } from "@/types/types";

interface TableBodyProps {
  members: MemberSubscription[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onChatClick: (phoneNumber: string) => void; // Nueva prop
}

export const TableBody: React.FC<TableBodyProps> = ({
  members,
  selectedIds,
  onToggleSelect,
  onChatClick, // Nueva prop
}) => {
  // Estado para controlar qué dropdown está abierto
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Función para manejar la apertura/cierre de los dropdowns
  const handleToggleDropdown = (id: number) => {
    if (openDropdownId === id) {
      // Si el dropdown ya está abierto, cerrarlo
      setOpenDropdownId(null);
    } else {
      // Si no está abierto, cerrar cualquier otro y abrir este
      setOpenDropdownId(id);
    }
  };

  return (
    <Table.Tbody className="font-semibold text-[#202D38] text-sm">
      {members.map((member, index) => (
        <TableRow
          key={`${member.id}-${index}`}
          member={member}
          index={index}
          isSelected={selectedIds.includes(member.id)}
          onToggleSelect={onToggleSelect}
          // Propiedades para controlar el dropdown
          openDropdownId={openDropdownId}
          onToggleDropdown={handleToggleDropdown}
          // Nueva propiedad para el chat
          onChatClick={onChatClick}
        />
      ))}
    </Table.Tbody>
  );
};