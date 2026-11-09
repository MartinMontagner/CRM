import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { AxiosError } from "axios";
import { getConversationById } from "@/service/chat/ChatService";
import { ConversationDTO } from "@/model/chats/Chat";

export const useConversation = (
  selectedChat: ConversationDTO | null, 
  setSelectedChat: (chat: ConversationDTO | null) => void
) => {
  const [searchParams] = useSearchParams();
  const chatIdParam = searchParams.get("chat");
  const chatIdParamNumber = chatIdParam && !isNaN(Number(chatIdParam)) ? Number(chatIdParam) : undefined;
  
  // Ref para evitar efectos duplicados
  const lastProcessedChatId = useRef<number | null>(null);

  const { data: conversationSelectedInParam, isLoading, isError } = useQuery<ConversationDTO, AxiosError>(
    ["conversation", chatIdParamNumber],
    async () => {
      if (!chatIdParamNumber) {
        return Promise.reject(new Error("No chat ID provided"));
      }
      
      // Si ya tenemos el chat seleccionado y coincide con el parámetro, no hacer fetch
      if (selectedChat?.conversationId === chatIdParamNumber) {
        return selectedChat;
      }
      
      return await getConversationById(chatIdParamNumber);
    },
    {
      enabled: !!chatIdParamNumber && selectedChat?.conversationId !== chatIdParamNumber,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );

  // Efecto para sincronizar con URL solo cuando es necesario
  useEffect(() => {
    // Si no hay chatId en URL y hay un chat seleccionado, limpiar
    if (!chatIdParamNumber && selectedChat) {
      console.log("🧹 Limpiando chat seleccionado (no hay ID en URL)");
      setSelectedChat(null);
      lastProcessedChatId.current = null;
      return;
    }

    // Si hay chatId en URL pero ya lo hemos procesado, no hacer nada
    if (chatIdParamNumber && lastProcessedChatId.current === chatIdParamNumber) {
      return;
    }

    // Si hay chatId en URL y coincide con el chat actual, marcar como procesado
    if (chatIdParamNumber && selectedChat?.conversationId === chatIdParamNumber) {
      lastProcessedChatId.current = chatIdParamNumber;
      return;
    }

    // Si tenemos datos del query y no coincide con el chat actual
    if (conversationSelectedInParam && conversationSelectedInParam.conversationId !== selectedChat?.conversationId) {
      console.log("📥 Conversación cargada desde URL:", conversationSelectedInParam.conversationId);
      setSelectedChat(conversationSelectedInParam);
      lastProcessedChatId.current = conversationSelectedInParam.conversationId;
    }
  }, [chatIdParamNumber, conversationSelectedInParam, selectedChat?.conversationId, setSelectedChat]);

  // Efecto separado para manejar errores
  useEffect(() => {
    if (isError && chatIdParamNumber) {
      console.error("💥 Error al cargar la conversación:", chatIdParamNumber);
      setSelectedChat(null);
      lastProcessedChatId.current = null;
    }
  }, [isError, chatIdParamNumber, setSelectedChat]);

  return { isLoading, isError };
};