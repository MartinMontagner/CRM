import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { Filter } from "@/components/constants/Filter";

import axios from "axios";
import { PaginatedResponse } from "../student/StudentService";
import {
  AssistantDTO,
  ChatMessageDTO,
  ConversationDTO,
  SendMessageRequestDTO,
} from "@/model/chats/Chat";
import moment from "moment";
import { Platform, PlatformType } from "@/model/chats/PlatformType";
import { ReadStatusType } from "@/model/chats/ReadStatusType";
import { StudentTagType } from "@/types/StudentTags";

const client = createRefreshTokenHttpClient("/chats");
const publicClient = axios.create({
  baseURL: BACKEND_URL + "/chats",
});

publicClient.interceptors.request.use(
  (config) => config,
  (error) => error
);

publicClient.interceptors.response.use(
  (response) => response,
  (error) => error
);

export const getConversations = async (): Promise<ConversationDTO[]> => {
  return (await client.get<ConversationDTO[]>("/conversations", {})).data;
};

export const getMessages = async (
  idChat: number,
  wazendInstanceId?: number
): Promise<ChatMessageDTO[]> => {
  if (wazendInstanceId) {
    return (await client.get<ChatMessageDTO[]>(`/messages/${idChat}`, {})).data;
  }
  return (await client.get<ChatMessageDTO[]>(`/messages/${idChat}`, {})).data;
};

export const getMessagesGroup = async (
  groupId?: string,
  wazendInstanceId?: number
) => {
  return (
    await client.get(
      `/group/${groupId}/wazend/${wazendInstanceId}/messages`,
      {}
    )
  ).data;
};

export const getConversationById = async (
  conversationId: number
): Promise<ConversationDTO> => {
  const response = await client.get<ConversationDTO>(
      `/get/${conversationId}`
    );
    return response.data;
};

// Función mejorada para manejar filtros principales, adicionales y plataforma
export const getFilteredChats = async (
  types: string[],
  page: number,
  content: string[],
  advancedFilters: Record<string, string>,
  wazendInstanceId: number | null, 
  readStatus: ReadStatusType = "ALL",
  platform: PlatformType = Platform.ALL,
  selectedStudentTags: StudentTagType = "ALL"
): Promise<PaginatedResponse<ConversationDTO>> => {
  try {
    const params = new URLSearchParams();

    // Añadir filtro de estado de lectura
    if (readStatus && readStatus !== "ALL") {
      if (readStatus === "READ") {
        params.append("readStatus", "0");
      } else { 
        params.append("readStatus", "1");
      }
    }

    // Añadir filtro de tag de estudiante si no es ALL
    if (selectedStudentTags && selectedStudentTags !== "ALL") { 
      params.append("studentTag", selectedStudentTags);
    }

    // Añadir filtro de plataforma si no es ALL
    if (platform && platform !== Platform.ALL) {
      params.append("platform", platform);
    }

    // Manejar texto de búsqueda global si existe
    if (content && content.length > 0 && content[0].trim()) {
      const searchText = content[0].trim();
      params.append("globalSearch", searchText);
    }

    // Procesar filtros avanzados
    if (advancedFilters) {
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (value && value.trim()) {
          // Los filtros de país y nombre de estudiante ya no necesitan % aquí
          // ya que se maneja en el backend
          params.append(key, value.trim());
        }
      });
    }

    // Procesar filtros por tags (solo si no es ALL)
    if (
      types &&
      types.length > 0 &&
      !(types.length === 1 && types[0] === Filter.ALL)
    ) {
      types.forEach((type) => {
        // Enviar como InterestTag para que coincida con el enum del backend
        params.append("customTag", type);
      });
    }

    // Añadir parámetros de paginación
    params.append("page", page.toString());
    params.append("size", "10");



    if (wazendInstanceId && wazendInstanceId !== null && wazendInstanceId !== undefined ) {
      params.append("wazendInstanceId", wazendInstanceId.toString());
    }

        console.log("🔍 Parámetros de búsqueda enviados:", Object.fromEntries(params));

    const response = await client.get<PaginatedResponse<ConversationDTO>>(
      "/conversations/paged",
      { params }
    );

    // Asegurarnos de que todas las conversaciones tengan la propiedad 'platform'
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map((conversation) => ({
        ...conversation,
        platform: conversation.conversationType || "WHATSAPP",
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error en getFilteredChats:", error);
    throw new Error("Error fetching filtered chat: " + error);
  }
};
export const updateStudentTag = async (conversationId: number, studentTag: string): Promise<void> => {
  try {
    const response = await fetch(`
      /conversations/${conversationId}/tag`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Agregar headers de autorización si es necesario
      },
      body: JSON.stringify({ studentTag })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating student tag:', error);
    throw error;
  }
};
export const sendMessage = async (
  messageRequest: SendMessageRequestDTO
): Promise<void> => {
  try {
    await client.post("/send", messageRequest, {});
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para enviar mensajes");
      }
      if (error.response?.status === 401) {
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
    }
    throw error;
  }
};

export const sendBulkMessages = async (
  phoneNumbers: string[],
  content: string
): Promise<void> => {
  await client.post<string>("/send-bulk", {
    phoneNumbers,
    content,
    sender: "USER",
    messageType: "TEXT",
  });
};

export const deleteConversation = async (
  conversationId: number
): Promise<void> => {
  await client.delete<void>(`/conversation/${conversationId}`);
};

export const updateConversationTag = async (
  conversationId: number,
  tag: string
): Promise<ConversationDTO> => {
  try {
    const response = await client.patch<ConversationDTO>(
      `/conversation/${conversationId}/tag`,
      { tag }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para actualizar esta conversación");
      }
      if (error.response?.status === 401) {
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
      if (error.response?.status === 404) {
        throw new Error("Conversación no encontrada.");
      }
    }
    throw error;
  }
};

export const updateConversationName = async (
  conversationId: number,
  name: string
): Promise<ConversationDTO> => {
  try {
    const response = await client.patch<ConversationDTO>(
      `/conversation/${conversationId}/name`,
      { workerName: name }
    );
    return response.data;
  } catch (error) {
    console.error("Error completo al actualizar nombre:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para actualizar esta conversación");
      }
      if (error.response?.status === 401) {
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
      if (error.response?.status === 404) {
        throw new Error("Conversación no encontrada.");
      }
    }
    throw error;
  }
};

export const getAiSuggestion = async (
  phoneNumber: number | string,
  assistantName: number | string,
  content?: string
): Promise<string> => {
  try {
    if (content) {
      const response = await client.post<{ suggestion: string }>(
        `/messages/${phoneNumber}/suggestion/${assistantName}`,
        { content }
      );
      return response.data.suggestion;
    } else {
      // Mantener el comportamiento GET original para asistentes que no necesitan contenido
      const response = await client.get<{ suggestion: string }>(
        `/messages/${phoneNumber}/suggestion/${assistantName}`
      );
      return response.data.suggestion;
    }
  } catch (error) {
    console.error("Error al obtener sugerencia de IA:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para solicitar sugerencias de IA");
      }
      if (error.response?.status === 401) {
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
      if (error.response?.status === 404) {
        throw new Error("Mensaje no encontrado");
      }
    }
    throw error;
  }
};

export const sendAssistantFeedback = async (
  phoneNumber: number | string,
  assistantName: string,
  feedbackText: string,
  feedBackLike: string,
  suggestionText: string
): Promise<void> => {
  try {
    await client.post(`/messages/${phoneNumber}/feedback/${assistantName}`, {
      feedback: feedbackText,
      suggestion: suggestionText,
      like: feedBackLike,
    });
  } catch (error) {
    console.error("Error al enviar feedback:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para enviar feedback");
      }
      if (error.response?.status === 401) {
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
      if (error.response?.status === 404) {
        throw new Error("Asistente o conversación no encontrada");
      }
    }
    throw error;
  }
};

export const getAllAssistants = async (): Promise<AssistantDTO[]> => {
  const response = await client.get<AssistantDTO[]>("/assistants");
  return response.data;
};

export const markMessagesAsRead = async (
  conversationId: number
): Promise<ConversationDTO> => {
  try {
    // Asegúrate de que conversationId sea un número
    const conversationIdNum =
      typeof conversationId === "string"
        ? parseInt(conversationId, 10)
        : conversationId;

    // Usar PATCH con conversationId
    const response = await client.patch<ConversationDTO>(
      `/conversation/${conversationIdNum}/mark-as-read`,
      {} // No es necesario enviar datos en el cuerpo
    );

    return response.data;
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para marcar mensajes como leídos");
      }
      if (error.response?.status === 401) {
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
      if (error.response?.status === 404) {
        throw new Error("Conversación no encontrada");
      }
    }
    throw error;
  }
};

// Nueva funcionalidad: búsqueda global mejorada
export const searchConversations = async (
  searchText: string,
  page: number = 0,
  platform: PlatformType = Platform.ALL
): Promise<PaginatedResponse<ConversationDTO>> => {
  try {
    const params = new URLSearchParams();
    params.append("globalSearch", searchText);
    params.append("page", page.toString());
    params.append("size", "10");

    // Añadir filtro de plataforma si no es ALL
    if (platform !== Platform.ALL) {
      params.append("platform", platform);
    }

    const response = await client.get<PaginatedResponse<ConversationDTO>>(
      "/conversations/search",
      { params }
    );

    // Asegurarnos de que todas las conversaciones tengan la propiedad 'platform'
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map((conversation) => ({
        ...conversation,
        platform: conversation.conversationType || ("WHATSAPP" as PlatformType),
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error en searchConversations:", error);
    throw new Error("Error realizando búsqueda global: " + error);
  }
};

// Nueva funcionalidad: obtener resumen de conversaciones con filtro de plataforma
export const getConversationSummary = async (
  platform: PlatformType = Platform.ALL
): Promise<{
  total: number;
  unread: number;
  byTag: Record<string, number>;
}> => {
  try {
    const params = new URLSearchParams();

    // Añadir filtro de plataforma si no es ALL
    if (platform !== Platform.ALL) {
      params.append("platform", platform);
    }

    const response = await client.get<{
      total: number;
      unread: number;
      byTag: Record<string, number>;
    }>("/conversations/summary", { params });

    return response.data;
  } catch (error) {
    console.error("Error al obtener resumen de conversaciones:", error);
    throw new Error("Error fetching conversation summary: " + error);
  }
};

// Nueva funcionalidad: optimización para cargar más conversaciones por página
export const getConversationsBatch = async (
  lastId?: number,
  batchSize: number = 20,
  filter?: string,
  platform: PlatformType = Platform.ALL
): Promise<ConversationDTO[]> => {
  try {
    const params = new URLSearchParams();

    if (lastId) {
      params.append("lastId", lastId.toString());
    }

    params.append("size", batchSize.toString());

    if (filter) {
      params.append("filter", filter);
    }

    // Añadir filtro de plataforma si no es ALL
    if (platform !== Platform.ALL) {
      params.append("platform", platform);
    }

    const response = await client.get<ConversationDTO[]>(
      "/conversations/batch",
      { params }
    );

    // Asegurarnos de que todas las conversaciones tengan la propiedad 'platform'
    const conversationsWithPlatform = response.data.map((conversation) => ({
      ...conversation,
      platform: conversation.conversationType || ("WHATSAPP" as PlatformType),
    }));

    return conversationsWithPlatform;
  } catch (error) {
    console.error("Error al cargar lote de conversaciones:", error);
    throw new Error("Error fetching conversations batch: " + error);
  }
};

export const associateMemberToConversation = async (
  conversationId: number,
  memberId: number
): Promise<void> => {
  try {
    await client.patch(
      `/conversation/${conversationId}/associate-member/${memberId}`
    );
  } catch (error) {
    console.error("Error al asociar miembro a la conversación:", error);
    throw new Error("Error associating member to conversation: " + error);
  }
};

export const addLabelToConversation = async (
  conversationId: number,
  label: string
): Promise<void> => {
  try {
    const interestTag = normalizeInterestTag(label);
    await client.patch(`/conversation/${conversationId}/interest-tag`, {
      interestTag,
    });
  } catch (error) {
    console.error("Error al agregar etiqueta a la conversación:", error);
    throw new Error("Error adding label to conversation: " + error);
  }
};

export const removeLabelToConversation = async (
  conversationId: number,
  label: string
): Promise<void> => {
  try {
    const interestTag = normalizeInterestTag(label);
    await client.delete(`/conversation/${conversationId}/interest-tag`, {
      data: { interestTag },
    });
  } catch (error) {
    console.error("Error al eliminar etiqueta de la conversación:", error);
    throw new Error("Error removing label from conversation: " + error);
  }
};

export const removeInterestTag = async (
  conversationId: number
): Promise<void> => {
  try {
    await client.delete(`/conversation/${conversationId}/interest-tag`);
  } catch (error) {
    console.error("Error al eliminar etiqueta de la conversación:", error);
    throw new Error("Error removing label from conversation: " + error);
  }
};

export const normalizeInterestTag = (label: string): string => {
  if (label === "Compromiso de Pago") return "COMPROMISO";
  return label
    .normalize("NFD") // separa letras de sus acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos
    .toUpperCase() // convierte a mayúsculas
    .replace(/\s+/g, "_"); // reemplaza espacios por guiones bajos
};
export const getMessagesPaginated = async (
  conversationId: number,
  page: number = 0,
  size: number = 20,
  wazendInstanceId?: number,
  search?: string // Nuevo parámetro
): Promise<PaginatedResponse<ChatMessageDTO>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (wazendInstanceId) {
      params.append("wazendInstanceId", wazendInstanceId.toString());
    }

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    const endpoint = `/messages/${conversationId}/paged`;

    const response = await client.get<PaginatedResponse<ChatMessageDTO>>(
      endpoint,
      { params }
    );

    // Convertir timestamps a hora local
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map((message) => ({
        ...message,
        sentAt: moment.utc(message.sentAt).local().format(),
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener mensajes paginados:", error);
    throw new Error("Error fetching paginated messages: " + error);
  }
};

// También modifica getMessagesGroupPaginated para incluir search
export const getMessagesGroupPaginated = async (
  id: number,
  page: number = 0,
  size: number = 20,
  search?: string // Nuevo parámetro
): Promise<PaginatedResponse<ChatMessageDTO>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    const response = await client.get<PaginatedResponse<ChatMessageDTO>>(
      `/group/${id}/paged`,
      { params }
    );

    // Convertir timestamps a hora local
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map((message) => ({
        ...message,
        sentAt: moment.utc(message.sentAt).local().format(),
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener mensajes de grupo paginados:", error);
    throw new Error("Error fetching paginated group messages: " + error);
  }
};
