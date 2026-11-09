import { createRefreshTokenHttpClient } from "@/client/HttpClient";

import axios from "axios";
import { CustomTag } from "@/model/chats/Contact";

const client = createRefreshTokenHttpClient("/custom-tags");
const publicClient = axios.create({
  baseURL: BACKEND_URL + "/custom-tags",
});

publicClient.interceptors.request.use(
  (config) => config,
  (error) => error
);

publicClient.interceptors.response.use(
  (response) => response,
  (error) => error
);

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