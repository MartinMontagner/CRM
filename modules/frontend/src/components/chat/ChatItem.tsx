// components/ChatItem.tsx - Modificado para usar CustomTagBadge
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { ConversationDTO } from "@/model/chats/Chat";

import { LuMessageCircleReply } from "react-icons/lu";
import { HiUserGroup } from "react-icons/hi2";
import {
  PlatformTypeBackend,
  platformTypeToBackend,
} from "@/model/chats/PlatformType";
import { useDateFormatting } from "@/hooks/useDateFormatting";
import StudentTagAvatar from "@/components/chat/StudentTagAvatar";
import CustomTagBadge from "@/components/chat/CustomTagBadge"; // ✅ Asegurar import correcto

interface ChatItemProps {
  conversation: ConversationDTO;
  isSelected: boolean;
  formatPhoneNumber: (phone: string) => string;
  onClick: () => void;
  lastItemRef?: (node: HTMLDivElement) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  conversation,
  isSelected,
  formatPhoneNumber,
  onClick,
  lastItemRef,
}) => {
  // Hook para formateo de fechas
  const { formatMessageTime } = useDateFormatting();

  // Platform-specific styling and icons
  const getPlatformStyles = (
    platform: PlatformTypeBackend | undefined,
    unreadCount: number
  ) => {
    const hasUnread = unreadCount > 0;

    switch (platform) {
      case PlatformTypeBackend.WHATSAPP:
        return {
          gradientBg: hasUnread
            ? "bg-gradient-to-r from-green-300 to-gren-100"
            : "bg-transparent",
          hoverBg: "hover:bg-green-100",
          selectedBg: "bg-gradient-to-r from-green-100 to-green-300",
          borderColor: "border-green-300",
          icon: <FaWhatsapp className="text-green-600" size={16} />,
          indicatorColor: "bg-green-500",
        };
      case PlatformTypeBackend.WAZEND:
        return {
          gradientBg: hasUnread
            ? "bg-gradient-to-r from-blue-300 to-blue-200"
            : "bg-transparent",
          hoverBg: "hover:bg-blue-100",
          selectedBg: "bg-gradient-to-r from-blue-100 to-blue-300",
          borderColor: "border-blue-300",
          icon: <LuMessageCircleReply className="text-blue-600" size={18} />,
          indicatorColor: "bg-blue-500",
        };
      case PlatformTypeBackend.WAZEND_GROUP:
        return {
          gradientBg: hasUnread
            ? "bg-gradient-to-r from-purple-300 to-purple-200"
            : "bg-transparent",
          hoverBg: "hover:bg-purple-100",
          selectedBg: "bg-gradient-to-r from-purple-100 to-purple-300",
          borderColor: "border-purple-300",
          icon: <HiUserGroup className="text-purple-600" size={18} />,
          indicatorColor: "bg-purple-500",
        };
      default:
        return {
          gradientBg: hasUnread
            ? "bg-gradient-to-r from-gray-200 to-gray-100"
            : "bg-transparent",
          hoverBg: "hover:bg-gray-100",
          selectedBg: "bg-gray-200",
          borderColor: "border-gray-300",
          icon: null,
          indicatorColor: "bg-gray-500",
        };
    }
  };

  const platformStyles = getPlatformStyles(
    platformTypeToBackend(conversation.conversationType),
    conversation.unreadCount // Pasar el conteo de mensajes no leídos
  );

  // Función para obtener el nombre de la instancia
  const getInstanceName = (): string | null => {
    if (
      conversation.conversationType === "WAZEND" &&
      conversation.wazend?.name
    ) {
      return conversation.wazend.name;
    }
    if (
      conversation.conversationType === "WAZEND_GROUP" &&
      conversation.wazend?.name &&
      conversation.wazendGroup
    ) {
      return conversation.wazend.name || `Grupo ${conversation.wazendGroup.id}`;
    }
    return null;
  };

  // Variables con valores seguros
  const safePhoneNumber = conversation?.phoneNumber || "";
  const safeStudentName = conversation?.studentName || "";
  const safeLastMessage = conversation?.lastMessage || "";
  const safeLastMessageTime = conversation?.lastMessageTime || "";
  const studentTag = conversation?.studentTag; // Puede ser null
  const safeUnreadCount = conversation?.unreadCount || 0;
  const instanceName = getInstanceName();

  // ✅ ACCESO CORRECTO: Las customTags vienen directamente en conversation
  const customTag = conversation?.customTags?.[0]; // Tomar la primera etiqueta personalizada

  // Crear un fallback para el nombre a mostrar
  const displayName =
    safeStudentName ||
    (safePhoneNumber
      ? formatPhoneNumber(safePhoneNumber)
      : "Usuario desconocido");

  // Verificar si se debe mostrar el indicador de mensajes no leídos
  const showUnreadIndicator = safeUnreadCount > 0;

  return (
    <motion.div
      title={`Mensajes de ${displayName}`}
      aria-label={`Mensajes de ${displayName}`}
      ref={lastItemRef}
      onClick={onClick}
      className={`px-4 py-5 cursor-pointer rounded-xl mb-2 transition-all duration-200 ${
        platformStyles.gradientBg
      } ${isSelected ? platformStyles.selectedBg : platformStyles.hoverBg} 
      border-l-4 ${platformStyles.borderColor} relative`}
      data-unread-count={safeUnreadCount}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut", delay: 0.1 }}
    >
      {/* Badge minimalista de instancia */}
      {instanceName ? (
        <motion.div
          className={`absolute -top-0.5 -right-0.5 ${
            conversation.conversationType === "WAZEND"
              ? "bg-blue-500/90"
              : "bg-purple-500/90"
          } text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm border border-white/50 backdrop-blur-sm z-10`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          title={`Instancia: ${instanceName}`}
        >
          <span className="font-medium text-[10px] leading-none">
            {instanceName.length > 6
              ? `${instanceName.slice(0, 6)}...`
              : instanceName}
          </span>
        </motion.div>
      ) : (
        <motion.div
          className={`absolute -top-0.5 -right-0.5 bg-green-500/90 text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm border border-white/50 backdrop-blur-sm z-10`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          title={"Api de whatsapp"}
        >
          <span className="font-medium text-[10px] leading-none">API</span>
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        {/* ✅ Avatar basado en studentTag usando componente reutilizable con fallbacks */}
        <div className="mr-2 flex-shrink-0 relative">
          <StudentTagAvatar
            studentTag={studentTag}
            size="md"
            showHover={true}
            fallbackName={safeStudentName}
            fallbackPhone={safePhoneNumber}
          />

          {/* Icono identificador de plataforma */}
          <motion.div
            className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md"
            whileHover={{ scale: 1.2 }}
            title={(() => {
              switch (conversation.conversationType) {
                case "WHATSAPP":
                  return "WhatsApp";
                case "WAZEND":
                  return "Wazend";
                case "WAZEND_GROUP":
                  return "Grupo de Wazend";
                default:
                  return "Otra plataforma";
              }
            })()}
          >
            {platformStyles.icon}
          </motion.div>

          {/* Indicador de mensajes no leídos */}
          {showUnreadIndicator && (
            <motion.div
              className={`absolute -top-1 -left-1 flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-medium rounded-full border border-white`}
              title={`${safeUnreadCount} mensaje(s) sin leer`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
            >
              {safeUnreadCount > 99 ? "99+" : safeUnreadCount}
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Fila superior: Nombre y CustomTag */}
          <div className="flex items-center justify-between">
            {/* Nombre del contacto */}
            <div className="flex-1 max-w-[60%]">
              <h3 className="font-semibold truncate text-gray-800">
                {displayName}
              </h3>
            </div>

            {/* ✅ CUSTOM TAG BADGE - Aquí está la implementación */}
            <div className="ml-2">
              <CustomTagBadge
                customTag={customTag}
                size="md"
                showHover={true}
                fixedWidth={true}
              />
            </div>
          </div>

          {/* Último mensaje */}
          <p className="text-sm text-gray-600 truncate mt-1">
            {safeLastMessage}
          </p>
        </div>
      </div>

      {/* Hora del mensaje */}
      <div className="w-full flex justify-end mt-2">
        <span className="text-xs text-gray-500 whitespace-nowrap px-2 py-1 rounded-full bg-gray-200 shadow-sm">
          {safeLastMessageTime ? formatMessageTime(safeLastMessageTime) : ""}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatItem;
