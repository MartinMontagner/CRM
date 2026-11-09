import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { CustomTag } from "@/model/chats/Contact";
import { CreateCustomTagDTO } from "@/model/tags/TagsDTO";

const client = createRefreshTokenHttpClient("/custom-tags");

/**
 * Crea un nuevo custom tag.
 * @param customTag Datos del custom tag a crear.
 * @returns El custom tag creado.
 */
export const createCustomTag = async (customTag: CreateCustomTagDTO): Promise<CustomTag> => {
    try {
        if (!customTag || !customTag.name || !customTag.color || !customTag.studentTag) {
            throw new Error("Custom tag must have a name, color, and studentTag.");
        }
        const response = await client.post<CustomTag>("", customTag);
        return response.data;
    } catch (error) {
        console.error("Error creating custom tag:", error);
        throw new Error("Error creating custom tag: " + error);
    }
};

export const getAvailableCustomTags = async (
  conversationId: number
): Promise<CustomTag[]> => {
    try {
        const response = await client.get<CustomTag[]>(
        `/${conversationId}/available`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching available custom tags:", error);
        throw new Error("Error fetching available custom tags: " + error);
    }
}

export const addcustomTagToConversation = async (
  conversationId: number,
  customTag: CustomTag
): Promise<void> => {
    try {
        // Crear el body para la solicitud
        if (!customTag || !customTag.id) {
            throw new Error("Custom tag is required and must have an ID.");
        }
        await client.patch(
        `/${conversationId}/add`,
        customTag
        );
    } catch (error) {
        console.error("Error adding custom tag to conversation:", error);
        throw new Error("Error adding custom tag to conversation: " + error);
    }
}

export const removeCustomTagToConversation = async (
  conversationId: number,
  customTag: CustomTag
): Promise<void> => {
    try {
        // Crear el body para la solicitud
        if (!customTag || !customTag.id) {
            throw new Error("Custom tag is required and must have an ID.");
        }
        await client.patch(
        `/${conversationId}/remove`,
        customTag
        );
    } catch (error) {
        console.error("Error removing custom tag from conversation:", error);
        throw new Error("Error removing custom tag from conversation: " + error);
    }
}

export const getAllCustomTags = async (): Promise<CustomTag[]> => {
    try {
        const response = await client.get<CustomTag[]>("");
        return response.data;
    } catch (error) {
        console.error("Error fetching all custom tags:", error);
        throw new Error("Error fetching all custom tags: " + error);
    }
};

/**
 * Actualiza un custom tag existente.
 * @param id ID del custom tag a actualizar.
 * @param updateDto Datos para actualizar el custom tag.
 * @returns El custom tag actualizado.
 */
export const updateCustomTag = async (id: number, updateDto: CreateCustomTagDTO): Promise<CustomTag> => {
    try {
        if (!id || !updateDto) {
            throw new Error("ID and update data are required to update a custom tag.");
        }
        const response = await client.put<CustomTag>(`/${id}`, updateDto);
        return response.data;
    } catch (error) {
        console.error("Error updating custom tag:", error);
        throw new Error("Error updating custom tag: " + error);
    }
};

/**
 * Elimina (desactiva) un custom tag existente.
 * @param id ID del custom tag a eliminar.
 * @returns void
 */
export const deleteCustomTag = async (id: number): Promise<void> => {
    try {
        if (!id) {
            throw new Error("ID is required to delete a custom tag.");
        }
        await client.delete(`/${id}`);
    } catch (error) {
        console.error("Error deleting custom tag:", error);
        throw new Error("Error deleting custom tag: " + error);
    }
};