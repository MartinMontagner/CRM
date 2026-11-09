import { ConversationDTO } from "@/model/chats/Chat";
import { PlatformType } from "@/model/chats/PlatformType";
import { ConversationService } from "@/service/wordpress/MemberService";
import { useState, useCallback } from "react";
import { toast } from "sonner";


// Función para obtener conversaciones por número de teléfono
const getConversationsByPhoneNumber = async (phoneNumber: string): Promise<ConversationDTO[]> => {
  return await ConversationService.getConversationsByPhoneNumber(phoneNumber);
};

interface UseConversationsReturn {
  conversations: ConversationDTO[];
  loading: boolean;
  error: string | null;
  fetchConversations: (phoneNumber: string) => Promise<void>;
  clearConversations: () => void;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber) {
      setError("Número de teléfono requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getConversationsByPhoneNumber(phoneNumber);
      setConversations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar las conversaciones";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearConversations = useCallback(() => {
    setConversations([]);
    setError(null);
  }, []);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    clearConversations,
  };
};

// Hook adicional para navegar al chat específico
export const useChatNavigation = () => {
  const navigateToChat = useCallback((
    conversationId: number, 
    platform: PlatformType, 
    wazendInstance?: string
  ) => {
    // Aquí implementas la lógica de navegación según tu router
    // Ejemplo con React Router:
    
    let chatUrl = "";
    
    if (platform === "WHATSAPP") {
      chatUrl = `/chat/whatsapp/${conversationId}`;
    } else if (platform === "WAZEND" && wazendInstance) {
      chatUrl = `/chat/wazend/${wazendInstance}/${conversationId}`;
    } else {
      chatUrl = `/chat/${conversationId}`;
    }
    
    // Si usas React Router:
    // const navigate = useNavigate();
    // navigate(chatUrl);
    
    // Si usas Next.js Router:
    // const router = useRouter();
    // router.push(chatUrl);
    
    // Por ahora, simulamos con console.log
    console.log(`Navegando a: ${chatUrl}`);
    toast.success(`Navegando al chat: ${conversationId}`);
    
    // Aquí podrías también abrir en una nueva ventana:
    // window.open(chatUrl, '_blank');
    
  }, []);

  return { navigateToChat };
};