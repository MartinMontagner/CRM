import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { SendMessageRequestDTO } from "@/model/chats/Chat";
import { WazendCreateInstanceDTO, WazendInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import axios from "axios";


const client = createRefreshTokenHttpClient("/wazend");

// Obtener todas las instancias de Wazend
export const getAllWazendInstances = async (): Promise<WazendInstanceDTO[]> => {
    try {
        const response = await client.get<WazendInstanceDTO[]>("/find/all");
        return response.data;
    } catch (error) {
        console.error("Error al obtener instancias de Wazend:", error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) {
                throw new Error('No tienes permiso para ver instancias de Wazend');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }
        throw new Error("Error al obtener instancias de Wazend: " + error);
    }
};

// Obtener una instancia específica de Wazend
export const getWazendInstance = async (instanceId: number): Promise<WazendInstanceDTO> => {
    try {
        const response = await client.get<WazendInstanceDTO>(`/find/${instanceId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la instancia de Wazend ${instanceId}:`, error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Instancia de Wazend no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }
        throw new Error(`Error al obtener la instancia de Wazend: ${error}`);
    }
};

// Obtener una instancia específica de Wazend
export const createInstance = async (instance : WazendCreateInstanceDTO): Promise<WazendInstanceDTO> => {
    try {
        const response = await client.post<WazendInstanceDTO>(`/create`, instance);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la instancia de Wazend ${instance}:`, error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Instancia de Wazend no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }
        throw new Error(`Error al obtener la instancia de Wazend: ${error}`);
    }
};
export const updateInstance = async (id: number, updates: Partial<Omit<WazendInstanceDTO, 'id'>>): Promise<WazendInstanceDTO> => {
    try {
        const response = await client.put<WazendInstanceDTO>(`/update/${id}`, updates);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la instancia de Wazend ${id}:`, error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Instancia de Wazend no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }
        throw new Error(`Error al obtener la instancia de Wazend: ${error}`);
    }
};
export const deleteInstance = async (id: number): Promise<void> => {
    try {
        await client.delete<WazendInstanceDTO>(`/delete/${id}`);
    } catch (error) {
        console.error(`Error al obtener la instancia de Wazend ${id}:`, error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Instancia de Wazend no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }
        throw new Error(`Error al obtener la instancia de Wazend: ${error}`);
    }
};

// Enviar mensaje a través de una instancia específica de Wazend
export const sendWazendMessage = async (
    messageRequest: SendMessageRequestDTO,
    instanceId: number,
    isGroup: boolean,
    conversationId?: number
): Promise<void> => {
    if (messageRequest.phoneNumber.includes('+')) {
        messageRequest.phoneNumber = messageRequest.phoneNumber.replace('+', '');
    }
    if (messageRequest.phoneNumber.includes(' ')) {
        messageRequest.phoneNumber = messageRequest.phoneNumber.replace(' ', '');
    }
    try {
        const wazendClient = createRefreshTokenHttpClient("/wazend/chats");
        if (!isGroup) {
            await wazendClient.post(`/send/${instanceId}`, messageRequest);
        }
        else {
            await wazendClient.post(`/send/${conversationId}/${instanceId}`, messageRequest);
        }
        console.log(`Mensaje enviado correctamente a través de la instancia ${instanceId}`);
    } catch (error) {
        console.error("Error al enviar mensaje mediante Wazend:", error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) {
                throw new Error('No tienes permiso para enviar mensajes a través de Wazend');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
            if (error.response?.status === 404) {
                throw new Error('Instancia de Wazend no encontrada');
            }
        }
        throw new Error("Error al enviar mensaje mediante Wazend: " + error);
    }
};