import React from "react";
import { Modal, Button, Badge, Divider } from "@mantine/core";
import { MessageCircle, Users, Clock } from "lucide-react";
import { ConversationDTO } from "@/model/chats/Chat"; 
import { PlatformType } from "@/model/chats/PlatformType";

interface ChatConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  studentName?: string;
  conversations: ConversationDTO[];
  loading: boolean;
  onSelectConversation: (conversationId: number, platform: PlatformType, wazendInstance?: string) => void;
}

export const ChatConversationsModal: React.FC<ChatConversationsModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  studentName,
  conversations,
  loading,
  onSelectConversation,
}) => {
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} días`;
    }
  };

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case "WHATSAPP":
        return "📱";
      case "WAZEND":
        return "💬";
      default:
        return "💬";
    }
  };

  const getPlatformColor = (platform: PlatformType) => {
    switch (platform) {
      case "WHATSAPP":
        return "green";
      case "WAZEND":
        return "blue";
      default:
        return "gray";
    }
  };

  const handleConversationClick = (conversation: ConversationDTO) => {
    const wazendInstance = conversation.wazend?.instanceIdServer || conversation.wazend?.name;
    onSelectConversation(conversation.conversationId, conversation.conversationType, wazendInstance);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Conversaciones disponibles
            </h3>
            <p className="text-sm text-gray-600">
              {studentName && `${studentName} • `}{phoneNumber}
            </p>
          </div>
        </div>
      }
      size="lg"
      centered
      styles={{
        title: { width: "100%" },
      }}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron conversaciones para este número</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation, index) => (
              <div key={conversation.conversationId}>
                <div 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header con plataforma e instancia */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">
                          {getPlatformIcon(conversation.conversationType)}
                        </span>
                        <Badge 
                          color={getPlatformColor(conversation.conversationType)}
                          size="sm"
                        >
                          {conversation.conversationType}
                        </Badge>
                        
                        {/* Mostrar instancia de Wazend si existe */}
                        {conversation.wazend && (
                          <Badge color="cyan" variant="light" size="sm">
                            {conversation.wazend.name || conversation.wazend.instanceIdServer}
                          </Badge>
                        )}
                        
                        {/* Mostrar si es grupo */}
                        {conversation.group && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <Badge color="blue" variant="light" size="sm">
                              {conversation.wazendGroup?.groupName || "Grupo"}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Último mensaje */}
                      <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                        {conversation.lastMessage || "Sin mensajes"}
                      </p>

                      {/* Footer con información */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(conversation.lastMessageTime)}</span>
                          </div>
                          
                          {conversation.unreadCount > 0 && (
                            <Badge color="red" size="xs" className="ml-2">
                              {conversation.unreadCount} sin leer
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          size="xs"
                          variant="light"
                          className="text-xs"
                        >
                          Abrir Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Divider entre conversaciones (excepto la última) */}
                {index < conversations.length - 1 && (
                  <Divider className="my-2" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Footer del modal */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};