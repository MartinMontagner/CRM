import { CustomTag } from "./Contact";
import { PlatformType } from "./PlatformType";

export interface WazendInstanceDTO {
  id: number;
  name: string;
  instanceIdServer: string;
  isActive?: boolean;
}

/**
 * @description DTO para representar un miembro de un grupo.
 */
export interface GroupMemberDTO {
  id: number;
  participant: string;
  fullname: string;
  joinedAt: string; // Fecha de ingreso al grupo
}

/**
 * @description DTO para representar un mensaje especifico de un chat.
 */
export interface ChatMessageDTO {
  id: number;
  whatsappMessageId?: string;
  conversationId: number;
  phoneNumber: string;
  userId?: number;
  userName?: string;
  studentName?: string;
  sender: "USER" | "BOT" | "ADMIN" | "STUDENT" | "DEVICE";
  content: string;
  messageType:
    | "TEXT"
    | "IMAGE"
    | "VIDEO"
    | "STICKER"
    | "DOCUMENT"
    | "AUDIO"
    | "LOCATION"
    | "TEMPLATE";
  mediaUrl?: string;
  read: boolean;
  sentAt: string;
  fromMe?: boolean;
  platform?: PlatformType; // Campo opcional para indicar la plataforma
  groupId?: string; // ID del grupo, si aplica
  groupName?: string; // Nombre del grupo, si aplica
  groupMember?: GroupMemberDTO; // Información de los miembros del grupo
  fileName?: string; // Nombre del archivo si es un mensaje de tipo archivo
  fileType?: string; // Tipo del archivo si es un mensaje de tipo archivo
  reactions?: ReactionDTO[]; // Reacciones al mensaje
}

export interface ReactionDTO {
  reaction: string; // Emoji de la reacción
  count: number; // Número de veces que se ha reaccionado con este emoji
}

/**
 * @description DTO para representar un chat para la lista de chat list.
 */
export interface ConversationDTO {
  conversationId: number;
  phoneNumber: string;
  studentName?: string;
  studentImageUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  hasUnread: boolean;
  unreadCount: number;
  analisis?: string;
  studentTag?: string;
  customTags?: CustomTag[]; // Lista de etiquetas personalizadas
  interestTag?: string;
  conversationType: PlatformType; // Campo para la plataforma (WhatsApp, Wazend o ALL)
  country?: string; // Añadido para filtrado por país
  wazend?: WazendInstanceDTO; // Añadido para almacenar la instancia de Wazend
  group?: string; // Añadido para almacenar chats de el grupo
  wazendGroup?: WazendGroupDto;
}

export interface WazendGroupDto {
  groupId: string;
  groupName: string | null;
  instanceIdServer: string | null;
  id: number;
}

export interface SendMessageRequestDTO {
  phoneNumber: string;
  content: string;
  mediaUrl?: string;
  sender: "USER" | "BOT" | "ADMIN" | "STUDENT";
  messageType: "TEXT" | "TEMPLATE";
  templateParams?: string[];
  platform?: PlatformType; // Campo opcional para indicar la plataforma
}

export interface AssistantDTO {
  id: number;
  label: string;
  value: string;
}
