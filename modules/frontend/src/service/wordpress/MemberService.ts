import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { ConversationDTO } from "@/model/chats/Chat";
import { ContactInfo } from "@/model/chats/Contact";
import { MemberSubscriptionViewDTO, PaginatedResponse } from "@/model/member/Member";
import getCountryCode from "@/utils/getCountryCode";

const client = createRefreshTokenHttpClient("/member-subscriptions");

// Interfaz para las condiciones de filtrado
export interface FilterCondition {
    field: string;
    value: string;
    operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

// Interfaz para la configuración de ordenamiento
export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc' | null;
}

/**
 * Obtiene suscripciones de miembros con paginación y ordenamiento opcional
 * @param page Número de página (comenzando desde 0)
 * @param pageSize Tamaño de la página
 * @param sortConfig Configuración de ordenamiento (opcional)
 * @returns Datos paginados de suscripciones
 */
export const getMemberSubscriptions = async (
    page: number,
    pageSize: number,
    sortConfig?: SortConfig
): Promise<PaginatedResponse<MemberSubscriptionViewDTO>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', pageSize.toString());
        
        // Añadir parámetro de ordenamiento si está definido
        if (sortConfig && sortConfig.direction && sortConfig.field) {
            params.append('sort', `${sortConfig.field},${sortConfig.direction}`);
        }
        
        const response = await client.get<PaginatedResponse<MemberSubscriptionViewDTO>>('', { params });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching member subscriptions');
    }
};

/**
 * Obtiene suscripciones de miembros filtradas con paginación y ordenamiento opcional
 * @param filters Condiciones de filtrado
 * @param page Número de página (comenzando desde 0)
 * @param pageSize Tamaño de la página
 * @param sortConfig Configuración de ordenamiento (opcional)
 * @returns Datos paginados de suscripciones filtradas
 */
export const getFilteredMemberSubscriptions = async (
    filters: FilterCondition[],
    page: number,
    pageSize: number = 100, // Tamaño de lote mayor para filtrados
    sortConfig?: SortConfig
): Promise<PaginatedResponse<MemberSubscriptionViewDTO>> => {
    try {
        const params = new URLSearchParams();
        
        // Añadir filtros
        filters.forEach(filter => {
            params.append(filter.field, filter.value);
        });
        
        params.append('page', page.toString());
        params.append('size', pageSize.toString());
        
        // Añadir parámetro de ordenamiento si está definido
        if (sortConfig && sortConfig.direction) {
            params.append('sort', `${sortConfig.field},${sortConfig.direction}`);
        }
        
        const response = await client.get<PaginatedResponse<MemberSubscriptionViewDTO>>('/filter', { params });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching filtered member subscriptions');
    }
};

/**
 * Obtiene un miembro por su email
 */
export const getMemberByEmail = async (email: string): Promise<MemberSubscriptionViewDTO> => {
    const res = await client.get<MemberSubscriptionViewDTO>(`/${encodeURIComponent(email)}`);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
};

/**
 * Exporta un conjunto de miembros a un archivo
 */
export const exportMembersToFile = async (emails: string[], format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    try {
        const response = await client.post<Blob>(`/export`, { emails, format }, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw new Error('Error exporting members');
    }
};

/**
 * Obtiene información de contacto de un miembro por su número de teléfono
 */
export const getContact = async (phoneNumber: string, conversationId: number): Promise<ContactInfo> => {
    try {
        const response = await client.get<ContactInfo>(`/get-info/${phoneNumber}/${conversationId}`);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    } catch (error) {
        console.error("Error al obtener información de contacto:", error);
        throw new Error('Error al obtener información de contacto');
    }
};

export const updateContact = async (conversationId: number, contactInfo: ContactInfo): Promise<void> => {
    try {
        await client.put(`/contact-info/${conversationId}`, {
            ...contactInfo,
            addressCountry: contactInfo.addressCountry ? getCountryCode(contactInfo.addressCountry) : null,
        });
    } catch (error) {
        console.error("Error al actualizar información de contacto:", error);
        throw new Error('Error al actualizar información de contacto');
    }
};

export const ConversationService = {
  /**
   * Obtiene todas las conversaciones asociadas a un número de teléfono
   * @param phoneNumber - Número de teléfono del cliente
   * @returns Promise<ConversationDTO[]>
   */
  async getConversationsByPhoneNumber(phoneNumber: string): Promise<ConversationDTO[]> {
    try {
      const response = await fetch(
        `${phoneNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Agregar headers de autenticación si es necesario
            // "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConversationDTO[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw new Error(
        error instanceof Error 
          ? `Error al obtener conversaciones: ${error.message}`
          : "Error desconocido al obtener conversaciones"
      );
    }
  },

  /**
   * Obtiene una conversación específica por ID
   * @param conversationId - ID de la conversación
   * @returns Promise<ConversationDTO>
   */
  async getConversationById(conversationId: number): Promise<ConversationDTO> {
    try {
      const response = await fetch(
        `${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConversationDTO = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw new Error(
        error instanceof Error 
          ? `Error al obtener conversación: ${error.message}`
          : "Error desconocido al obtener conversación"
      );
    }
  },

  /**
   * Obtiene conversaciones filtradas por plataforma
   * @param phoneNumber - Número de teléfono del cliente
   * @param platform - Plataforma (WHATSAPP, WAZEND, etc.)
   * @returns Promise<ConversationDTO[]>
   */
  async getConversationsByPlatform(
    phoneNumber: string, 
    platform: string
  ): Promise<ConversationDTO[]> {
    try {
      const response = await fetch(
        `${phoneNumber}/platform/${platform}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConversationDTO[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching conversations by platform:", error);
      throw new Error(
        error instanceof Error 
          ? `Error al obtener conversaciones por plataforma: ${error.message}`
          : "Error desconocido al obtener conversaciones por plataforma"
      );
    }
  },
};