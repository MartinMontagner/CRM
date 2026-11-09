import React from "react";
import { Table } from "@mantine/core";
import { CheckSquare, Square } from "lucide-react";
import { FIELDS, MemberSubscription } from "@/types/types";
import { getTagColor } from "@/utils/tagsColors";
import SubscriptionDropdown from "./dropdown/SubscriptionDropdown";
import { formatCategoryDisplay } from "@/utils/filterUtils";
import { ChatIcon } from "./modalChat/ChatIcon"; // Importa el nuevo componente

interface TableRowProps {
  member: MemberSubscription;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  // Nuevas propiedades para controlar el dropdown
  openDropdownId: number | null;
  onToggleDropdown: (id: number) => void;
  // Nueva propiedad para manejar el click del chat
  onChatClick: (phoneNumber: string) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  member,
  index,
  isSelected,
  onToggleSelect,
  openDropdownId,
  onToggleDropdown,
  onChatClick, // Nueva prop
}) => {
  return (
    <Table.Tr key={`${member.email}-${index}`}>
      {/* Checkbox con posición sticky */}
      <Table.Td
        className="sticky left-0 z-20 bg-white"
        style={{
          padding: 0,
        }}
        onClick={() => onToggleSelect(member.id)}
      >
        <div className="h-full w-full flex items-center justify-center cursor-pointer py-2">
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </Table.Td>

      {/* Renderizar celdas para los demás campos */}
      {FIELDS.map((field) => {
        switch (field) {
          case "category":
            return (
              <Table.Td key={field} className="bg-white">
                <span
                  className={`px-6 inline-flex text-xs leading-5 font-normal rounded-full ${getTagColor(
                    member[field] ? member[field] : undefined
                  )}`}
                >
                  {formatCategoryDisplay(member[field])} 
                </span>
              </Table.Td>
            );
          case "subscriptions": {
            return (
              <Table.Td key={field} className="bg-white">
                <SubscriptionDropdown
                  subscriptions={member.subscriptions}
                  isOpen={openDropdownId === member.id}
                  dropdownId={member.id}
                  onToggle={onToggleDropdown}
                />
              </Table.Td>
            );
          }
          case "chat": {
            // Aquí implementamos la nueva columna de chat
            return (
              <Table.Td key={field} className="bg-white">
                <ChatIcon
                  phoneNumber={member.phone}
                  hasUnread={false} // Puedes calcular esto basado en tus datos
                  unreadCount={0} // Puedes calcular esto basado en tus datos  
                  onClick={onChatClick}
                />
              </Table.Td>
            );
          }
          default:
            return (
              <Table.Td
                key={field}
                className={`bg-white ${field == "email" && "underline"}`}
              >
                {typeof member[field] === "boolean"
                  ? member[field]
                    ? "Sí"
                    : "No"
                  : String(member[field] || "")}
              </Table.Td>
            );
        }
      })}
    </Table.Tr>
  );
};