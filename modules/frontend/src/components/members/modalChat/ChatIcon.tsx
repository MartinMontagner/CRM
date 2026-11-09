import React from "react";
import { MessageCircle, MessageSquare, CheckCheck } from "lucide-react";
import { Tooltip } from "@mantine/core";

interface ChatIconProps {
  phoneNumber: string;
  hasUnread?: boolean;
  unreadCount?: number;
  lastActivity?: string;
  onClick: (phoneNumber: string) => void;
  className?: string;
}

export const ChatIcon: React.FC<ChatIconProps> = ({
  phoneNumber,
  hasUnread = false,
  unreadCount = 0,
  lastActivity,
  onClick,
  className = "",
}) => {
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague el click al row
    onClick(phoneNumber);
  };

  const getIconAndColor = () => {
    if (hasUnread && unreadCount > 0) {
      return {
        icon: <MessageCircle className="w-5 h-5" />,
        color: "text-red-500 hover:text-red-600",
        bgColor: "hover:bg-red-50",
        tooltip: `${unreadCount} mensajes sin leer`
      };
    } else if (lastActivity) {
      return {
        icon: <CheckCheck className="w-5 h-5" />,
        color: "text-green-500 hover:text-green-600", 
        bgColor: "hover:bg-green-50",
        tooltip: "Conversación leída"
      };
    } else {
      return {
        icon: <MessageSquare className="w-5 h-5" />,
        color: "text-gray-400 hover:text-gray-600",
        bgColor: "hover:bg-gray-50", 
        tooltip: "Ver conversaciones"
      };
    }
  };

  const { icon, color, bgColor, tooltip } = getIconAndColor();

  return (
    <div className="w-full flex justify-center">
      <Tooltip label={tooltip} position="top" withArrow>
        <button
          onClick={handleClick}
          className={`
            relative p-2 rounded-full transition-all duration-200 cursor-pointer
            ${color} ${bgColor} ${className}
          `}
        >
          {icon}
          
          {/* Badge para mostrar cantidad de mensajes sin leer */}
          {hasUnread && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold min-w-[20px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>
    </div>
  );
};