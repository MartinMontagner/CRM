import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { SyncResultDTO } from "@/model/chats/SyncResultDTO";
import axios from "axios";


const client = createRefreshTokenHttpClient("/sync");
const importClient = createRefreshTokenHttpClient("/import");

// Obtener una instancia específica de Wazend
export const syncChats = async (): Promise<SyncResultDTO> => {
    try {
        const response = await client.post<SyncResultDTO>(`/chats-conversations`);
        return response.data;
    } catch (error) {
        console.error(`Error al sincronizar: ${error}`);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('No se sincronizaron los datos. Asegúrate de que el servidor esté en ejecución y que la URL sea correcta.');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }
        throw new Error(`Error desconocido al sincronizar: ${error instanceof Error ? error.message : 'Error no manejado'}`);
    }
};

export const importChats = async (file: File, instanceIdName: string): Promise<SyncResultDTO> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("instanceId", instanceIdName);

        const response = await importClient.post<SyncResultDTO>(`/wazend`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Error al importar: ${error}`);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('No se importaron los datos. Asegúrate de que el servidor esté en ejecución y que la URL sea correcta.');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
            if (error.response?.status === 403) {
                throw new Error('No tienes permisos para importar datos.');
            }
        }
        throw new Error(`Error desconocido al importar: ${error instanceof Error ? error.message : 'Error no manejado'}`);
    }
};