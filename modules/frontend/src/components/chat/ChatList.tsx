import { ConversationDTO } from "@/model/chats/Chat";
import ChatItem from "./ChatItem";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowDown, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface ChatListProps {
  chats: ConversationDTO[];
  onSelectChat: (conversation: ConversationDTO) => void;
  currentChatId?: number | null;
  formatPhoneNumber: (phone: string) => string;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  lastItemRef: (node: HTMLDivElement) => void;
}

const ChatList = ({
  chats,
  onSelectChat,
  currentChatId,
  formatPhoneNumber,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  lastItemRef
}: ChatListProps) => {
  // Estados para el feedback visual
  const [showFetchNotification, setShowFetchNotification] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [newItemsCount, setNewItemsCount] = useState(0);
  
  const fetchNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousChatsLengthRef = useRef(chats.length);

  // Asegurarse de que chats siempre sea un array
  const safeChats = Array.isArray(chats) ? chats : [];

  // 🆕 Efecto para detectar nuevos chats cargados
  useEffect(() => {
    const currentLength = safeChats.length;
    const previousLength = previousChatsLengthRef.current;
    
    if (currentLength > previousLength && !isFetchingNextPage) {
      // Se agregaron nuevos chats
      const newChats = currentLength - previousLength;
      setNewItemsCount(newChats);
      
      // Mostrar notificación de éxito
      setShowFetchNotification(true);
      setFetchProgress(100);
      
      fetchNotificationTimeoutRef.current = setTimeout(() => {
        setShowFetchNotification(false);
        setFetchProgress(0);
        setNewItemsCount(0);
      }, 2000);
    }
    
    previousChatsLengthRef.current = currentLength;
  }, [safeChats.length, isFetchingNextPage]);

  // 🆕 Efecto para mostrar progreso cuando se está haciendo fetch
  useEffect(() => {
    if (isFetchingNextPage) {
      setShowFetchNotification(true);
      setFetchProgress(0);
      
      // Simular progreso para mejor UX
      const progressInterval = setInterval(() => {
        setFetchProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [isFetchingNextPage]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (fetchNotificationTimeoutRef.current) {
        clearTimeout(fetchNotificationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, rgba(240, 240, 240, 0.3), rgba(255, 255, 255, 0.1));
          border-radius: 10px;
          margin: 8px 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3B82F6, #60A5FA);
          border-radius: 10px;
          box-shadow: 
            0 2px 4px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563EB, #3B82F6);
          box-shadow: 
            0 4px 8px rgba(59, 130, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: scaleX(1.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #1D4ED8, #2563EB);
          box-shadow: 
            0 2px 4px rgba(59, 130, 246, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
      
      <div className="h-full overflow-y-auto pt-1 pr-4 custom-scrollbar" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#3B82F6 rgba(240, 240, 240, 0.3)'
      }}>
      {/* 🆕 Notificación flotante de fetch dentro del scroll area */}
      <AnimatePresence>
        {showFetchNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="sticky top-2 left-1/2 transform -translate-x-1/2 z-40 mb-2"
          >
            <div className="bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                {isFetchingNextPage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span className="font-medium">
                  {isFetchingNextPage 
                    ? 'Cargando chats...' 
                    : newItemsCount > 0 
                      ? `${newItemsCount} nuevo${newItemsCount > 1 ? 's' : ''} chat${newItemsCount > 1 ? 's' : ''}`
                      : 'Chats actualizados'
                  }
                </span>
              </div>
              
              {/* Barra de progreso compacta */}
              <div className="w-12 h-1 bg-blue-300 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${fetchProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {safeChats.length > 0 ? (
        <>
          {safeChats.map((conversation, index) => {
            // Evitar errores con valores undefined
            if (!conversation) return null;
            
            // Determinar si el chat está seleccionado
            const isSelected = 
              currentChatId !== null &&
              currentChatId !== undefined &&
              conversation.conversationId === currentChatId;
            
            // El último elemento tendrá la referencia para observación de scroll infinito
            const ref = index === safeChats.length - 1 ? lastItemRef : undefined;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index < 5 ? index * 0.05 : 0 // Solo animar los primeros 5 para performance
                }}
              >
                <ChatItem
                  conversation={conversation}
                  isSelected={isSelected}
                  formatPhoneNumber={formatPhoneNumber}
                  onClick={() => onSelectChat(conversation)}
                  lastItemRef={ref}
                />
              </motion.div>
            );
          })}
          
          {/* 🆕 Indicador al final de la lista mejorado */}
          <AnimatePresence>
            {hasNextPage && (
              <motion.div 
                className="py-4 flex flex-col items-center justify-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isFetchingNextPage ? (
                  <motion.div 
                    className="flex flex-col items-center gap-2 text-blue-600"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm font-medium">Cargando más chats...</span>
                    </div>
                    
                    {/* Puntos de carga animados */}
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 bg-blue-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={fetchNextPage}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 py-2 px-4 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowDown size={16} />
                    <span className="text-sm font-medium">Cargar más chats</span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 🆕 Mensaje cuando no hay más chats */}
          {!hasNextPage && safeChats.length > 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center"
            >
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-8 h-px bg-gray-300"></div>
                <span>No hay más chats</span>
                <div className="w-8 h-px bg-gray-300"></div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="text-gray-400 mb-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No se encontraron chats</p>
          <p className="text-gray-400 text-sm mt-1">Los nuevos chats aparecerán aquí</p>
        </motion.div>
      )}
    </div>
  </div>
  );
};

export default ChatList;