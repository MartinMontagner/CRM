import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import moment from "moment";
import { IoMdSend } from "react-icons/io";
import { RiRobot2Fill } from "react-icons/ri";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdOutlineViewModule } from "react-icons/md";
import { PlatformType } from "@/model/chats/PlatformType";
import { DisabledChatInput } from "./chatWindow/DisabledChatInput";

interface MessageInputProps {
  platformType: PlatformType
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isSending?: boolean;
  initialMessage?: string;
  setMessageText?: (setFn: (text: string) => void) => void;
  onOpenSuggestionsModal?: (initialText: string) => void;
  lastMessageTime?: number | null;
  onOpenTemplatesModal?: () => void;
  isActive?: boolean;

}

const MessageInput: React.FC<MessageInputProps> = ({ 
  platformType,
  onSendMessage, 
  disabled = false,
  isSending = false,
  initialMessage = "",
  setMessageText,
  onOpenSuggestionsModal,
  lastMessageTime,
  onOpenTemplatesModal,
  isActive = true,
}) => {
  const [message, setMessage] = useState<string>(initialMessage);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Para evitar envíos duplicados
  const isSendingRef = useRef<boolean>(false);
  
  // Calcular si han pasado más de 24 horas desde el último mensaje
  const isOutsideWindow = (): boolean => {
    if (!lastMessageTime) return false;
    console.log(`[MessageInput] Último mensaje recibido a las: ${new Date(lastMessageTime).toLocaleString()}`);
  
    // lastMessageTime ya es un timestamp local desde ChatWindow, usar directamente
    const lastMessageMoment = moment(lastMessageTime);
    const currentMoment = moment();
  
    // Calcular la diferencia en horas y minutos con el momento actual
    const hoursDiff = currentMoment.diff(lastMessageMoment, 'hours');
    const minutesDiff = currentMoment.diff(lastMessageMoment, 'minutes') % 60;
    const totalMinutes = currentMoment.diff(lastMessageMoment, 'minutes');
  
    console.log(`[MessageInput] Último mensaje: ${lastMessageMoment.format()}`);
    console.log(`[MessageInput] Momento actual: ${currentMoment.format()}`);
    console.log(`[MessageInput] Tiempo desde el último mensaje: ${hoursDiff} horas y ${minutesDiff} minutos (${totalMinutes} minutos totales)`);
    
    // Comprobar si han pasado más de 24 horas (1440 minutos)
    const isOutside = totalMinutes >= 1440;
    console.log(`[MessageInput] ¿Fuera de ventana de 24h?: ${isOutside}`);
    
    return isOutside;
  };
  
  // Verificar si estamos fuera de la ventana de 24 horas
  const outsideMessageWindow = isOutsideWindow();

  // Debug adicional
  console.log(`[MessageInput] outsideMessageWindow: ${outsideMessageWindow}, platformType: ${platformType}`);

  // Exponer la función setMessage al componente padre
  useEffect(() => {
    if (setMessageText) {
      setMessageText(setMessage);
    }
  }, [setMessageText]);

  // Actualizar mensaje si cambia initialMessage
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  // Restaurar el foco en el input después de enviar
  useEffect(() => {
    if (!isSending && inputRef.current && !outsideMessageWindow) {
      inputRef.current.focus();
    }
  }, [isSending, outsideMessageWindow]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    console.log(`[MessageInput] Intento de envío - outsideMessageWindow: ${outsideMessageWindow}, platformType: ${platformType}`);
    
    // CORREGIDO: Para WhatsApp, bloquear completamente el envío si estamos fuera de la ventana
    if (platformType === "WHATSAPP" && outsideMessageWindow) {
      console.log("[MessageInput] Envío bloqueado: fuera de ventana de 24h para WhatsApp");
      return;
    }
    
    // Verificar si podemos enviar el mensaje
    if (!message.trim() || disabled || isSendingRef.current) {
      console.log("[MessageInput] Envío bloqueado: mensaje vacío, deshabilitado o enviando");
      return;
    }
    
    // Evitar doble envío
    const messageToSend = message.trim();
    setMessage(""); // Limpiar inmediatamente para evitar doble envío
    
    console.log("MessageInput: Enviando mensaje:", messageToSend);
    
    // Enviar el mensaje
    await onSendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enviar con Enter, pero permitir Shift+Enter para nuevas líneas
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // Manejar clic en el botón de sugerencias
  const handleOpenSuggestionsClick = () => {
    if (onOpenSuggestionsModal) {
      console.log("MessageInput: Abriendo modal de sugerencias con texto:", message);
      onOpenSuggestionsModal(message);
    } else {
      console.warn("MessageInput: onOpenSuggestionsModal no está disponible");
    }
  };

  // Manejar clic en el botón de templates
  const handleOpenTemplatesClick = () => {
    if (onOpenTemplatesModal) {
      console.log("MessageInput: Abriendo modal de templates");
      onOpenTemplatesModal();
    } else {
      console.warn("MessageInput: onOpenTemplatesModal no está disponible");
    }
  };

    if (!isActive) {
    return <DisabledChatInput  />;
  }

  return (
    <div className="bg-grey-100 px-4 py-2 rounded-b-2xl">
      <form className="w-full flex" onSubmit={handleSubmit}>
        <div className="w-full flex">
          {/* Mensaje informativo cuando estamos fuera del tiempo permitido */}
          {outsideMessageWindow && platformType === "WHATSAPP" && (
            <div className="flex-1 text-sm text-grey-500 bg-grey-200 rounded-lg py-3 px-4 flex items-center">
              <AiOutlineInfoCircle className="mr-3" />
              <span className="select-none text-grey-500/65">
                Han pasado más de 24 horas desde el último mensaje. Use una plantilla para iniciar una nueva conversación.
              </span>
            </div>
          )}
          
          {/* Input normal cuando estamos dentro de la ventana de tiempo O es WAZEND */}
          {((!outsideMessageWindow && platformType === "WHATSAPP") || (platformType === "WAZEND" || platformType === "WAZEND_GROUP")) && (
            <div className="flex-1 flex">
              <input
                ref={inputRef}
                type="text"
                className={`flex-1 py-2 px-4 bg-grey-100 rounded-lg outline-none text-grey-700 ${
                  disabled || isSending ? "opacity-50" : ""
                }`}
                placeholder={isSending ? "Enviando..." : disabled ? "Deshabilitado" : "Escribe un mensaje aquí"}
                value={message}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isSending}
              />
            </div>
          )}
          
          {/* Botón para abrir SuggestionsModal - solo visible cuando podemos enviar mensajes normales */}
          {onOpenSuggestionsModal && ((!outsideMessageWindow && platformType === "WHATSAPP") || platformType === "WAZEND" || platformType === "WAZEND_GROUP") && (
            <button
              type="button"
              onClick={handleOpenSuggestionsClick}
              className="ml-2 p-2 rounded-lg hover:bg-grey-200 text-tertiary-600"
              title="Sugerencias de IA"
              disabled={disabled || isSending}
            >
              <RiRobot2Fill className="h-5 w-5" />
            </button>
          )}
          
          {/* Botón para abrir el modal de templates - solo visible cuando estamos fuera de la ventana de WhatsApp */}
          {onOpenTemplatesModal && outsideMessageWindow && platformType === "WHATSAPP" && (
            <button
              type="button"
              onClick={handleOpenTemplatesClick}
              className="ml-2 p-2 rounded-lg hover:bg-grey-200 text-blue-600"
              title="Enviar plantilla"
            >
              <MdOutlineViewModule className="h-5 w-5" />
            </button>
          )}
          
          {/* Botón de enviar - solo visible cuando podemos enviar mensajes normales */}
          {(!outsideMessageWindow && platformType === "WHATSAPP" || (platformType === "WAZEND" || platformType === "WAZEND_GROUP")) && (
            <button
              type="submit"
              className={`ml-2 p-2 rounded-lg ${
                !message.trim() || disabled || isSending 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-grey-200"
              }`}
              disabled={!message.trim() || disabled || isSending}
            >
              {isSending ? (
                <div className="h-5 w-5 border-2 border-tertiary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <IoMdSend className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;