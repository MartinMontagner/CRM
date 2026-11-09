import { ChatMessageDTO } from "@/model/chats/Chat";
import { GROUP_MEMBER_COLORS } from "@/utils/group/colorsGroupChat";
import { useDateFormatting } from "@/hooks/useDateFormatting";
import { useState } from "react";
import {
  MdAdminPanelSettings,
  MdSmartToy,
  MdPerson,
  MdDevices,
  MdSchool,
  MdDone,
  MdMoreHoriz,
} from "react-icons/md";
import { MessageImage } from "./tipos/MessageImage";
import { MessageVideo } from "./tipos/MessageVideo";
import { MessageAudio } from "./tipos/MessageAudio";
import { MessageDocument } from "./tipos/MessageDocument";
import { MessageSticker } from "./tipos/MessageSticker";
import { MessageReactions } from "./tipos/MessageReactions";
import { ImageZoomModal } from "./modal/ImageZoomModal";
import { VideoZoomModal } from "./modal/VideoZoomModal";
import { DocumentModal } from "./modal/DocumentModal";

interface MessageItemProps {
  message: ChatMessageDTO;
  globalIndex: number;
  searchTerm?: string;
  isGroupChat: boolean;
  isSearchMode?: boolean;
  onReactionClick?: (messageId: number, reaction: string) => void;
}

const MessageItem = ({
  message,
  globalIndex,
  searchTerm = "",
  isGroupChat,
  isSearchMode = false,
  onReactionClick,
}: MessageItemProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const { formatMessageTimestamp } = useDateFormatting();

  // Set para tipos de media que requieren padding especial
  const MEDIA_TYPES = new Set(["IMAGE", "VIDEO", "STICKER"]);

  // Handler para clicks en reacciones
  const handleReactionClick = (reaction: string) => {
    if (onReactionClick && typeof message.id === "number") {
      onReactionClick(message.id, reaction);
    }
  };

  // Verificar si el mensaje tiene reacciones
  const hasReactions = message.reactions && message.reactions.length > 0;

  // Function to highlight searched text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(
      `(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-300 text-black">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Get color scheme for group member
  const getGroupMemberColorScheme = (
    phoneNumber: string | undefined | null
  ) => {
    if (!phoneNumber) {
      return {
        bg: "bg-gray-400",
        accent: "text-gray-600",
        light: "bg-gray-200",
        text: "text-gray-800",
      };
    }

    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
      const char = phoneNumber.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const colorIndex = Math.abs(hash) % GROUP_MEMBER_COLORS.length;
    return GROUP_MEMBER_COLORS[colorIndex];
  };

  // Get icon for avatar (larger size)
  const getAvatarIcon = (sender: string) => {
    const iconClass = "w-5 h-5";

    switch (sender) {
      case "ADMIN":
        return <MdAdminPanelSettings className={iconClass} />;
      case "BOT":
        return <MdSmartToy className={iconClass} />;
      case "USER":
        return <MdPerson className={iconClass} />;
      case "DEVICE":
        return <MdDevices className={iconClass} />;
      case "STUDENT":
        return <MdSchool className={iconClass} />;
      default:
        return <MdPerson className={iconClass} />;
    }
  };

  // Get icon for sender type (small size for names)
  const getSenderIcon = (sender: string) => {
    const iconClass = "w-3 h-3";

    switch (sender) {
      case "ADMIN":
        return <MdAdminPanelSettings className={iconClass} />;
      case "BOT":
        return <MdSmartToy className={iconClass} />;
      case "USER":
        return <MdPerson className={iconClass} />;
      case "DEVICE":
        return <MdDevices className={iconClass} />;
      case "STUDENT":
        return <MdSchool className={iconClass} />;
      default:
        return <MdPerson className={iconClass} />;
    }
  };

  // Get background color based on sender type
  const getMessageBgColor = (sender: string, id?: string) => {
    if (isGroupChat && sender === "STUDENT") {
      const colorScheme = getGroupMemberColorScheme(id || "");
      return colorScheme.bg;
    }

    switch (sender) {
      case "ADMIN":
        return "bg-orange-600";
      case "BOT":
        return "bg-purple-600";
      case "USER":
        return "bg-tertiary-600";
      case "STUDENT":
        return "bg-white";
      default:
        return "bg-tertiary-600";
    }
  };

  // Get text color based on sender type
  const getMessageTextColor = (sender: string) => {
    if (isGroupChat && sender === "STUDENT") {
      return "text-white";
    }
    return sender === "STUDENT" ? "text-grey-700" : "text-white";
  };

  // Get accent text color for timestamps and metadata
  const getAccentTextColor = (sender: string, phoneNumber?: string) => {
    if (isGroupChat && sender === "STUDENT") {
      const colorScheme = getGroupMemberColorScheme(phoneNumber || "");
      return colorScheme.accent;
    }

    if (sender === "STUDENT") {
      return "text-grey-400";
    }
    return "text-tertiary-100";
  };

  // Get sender display name
  const getMessageSenderName = (message: ChatMessageDTO) => {
    if (isGroupChat && message.sender === "STUDENT") {
      const fullname = message.groupMember
        ? message.groupMember?.fullname
            .toLocaleLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : undefined;
      return fullname || message.groupMember?.participant || "Unknown Student";
    }

    switch (message.sender) {
      case "ADMIN":
        return "Admin";
      case "BOT":
        return "Bot";
      case "USER":
        return message.userName || "User";
      case "DEVICE":
        return "DISPOSITIVO";
      default:
        return "";
    }
  };

  // Helper functions using Sets (más rápido)
  const isMediaMessage = () => MEDIA_TYPES.has(message.messageType);

  // Get document file type for modal
  const getDocumentFileType = (fileName?: string): "pdf" | "image" => {
    if (!fileName) return "pdf";
    const extension = fileName.split(".").pop()?.toLowerCase();
    const imageExtensions = new Set([
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
      "webp",
      "bmp",
    ]);
    return imageExtensions.has(extension || "") ? "image" : "pdf";
  };

  // Determine message positioning
  const isRightSide = message.sender !== "STUDENT" || message.fromMe;

  // Get colors
  const bgColor = getMessageBgColor(
    message.sender,
    message.groupMember?.id.toString() || message.sender
  );
  const textColor = getMessageTextColor(message.sender);
  const accentColor = getAccentTextColor(
    message.sender,
    message.groupMember?.id.toString() || message.sender
  );
  const senderName = getMessageSenderName(message);

  const title = () => {
    switch (message.sender) {
      case "ADMIN":
        return "Mensaje del administrador";
      case "BOT":
        return "Mensaje del bot";
      case "USER":
        return "Mensaje enviado desde aplicación web";
      case "DEVICE":
        return "Mensaje enviado desde un dispositivo";
      default:
        return "";
    }
  };

  // Render message content using switch case (más eficiente)
  const renderMessageContent = () => {
    switch (message.messageType) {
      case "STICKER":
        return (
          <MessageSticker
            src={message.mediaUrl || ""}
            alt={message.content || "Sticker"}
          />
        );
      case "IMAGE":
        return (
          <MessageImage
            sender={message.userName || message.phoneNumber || "Desconocido"}
            src={message.mediaUrl || ""}
            alt="Imagen del mensaje"
            onImageClick={() => setIsImageModalOpen(true)}
          />
        );

      case "VIDEO":
        return (
          <MessageVideo
            sender={message.userName || message.phoneNumber || "Desconocido"}
            src={message.mediaUrl || ""}
            alt="Video del mensaje"
            onVideoClick={() => setIsVideoModalOpen(true)}
          />
        );

      case "AUDIO":
        return (
          <MessageAudio src={message.mediaUrl || ""} isFromMe={isRightSide} />
        );

      case "DOCUMENT":
        return (
          <MessageDocument
            src={message.mediaUrl || ""}
            fileName={message.fileName || "Documento"}
            fileType={message.fileType}
            isFromMe={isRightSide}
            onDocumentClick={() => setIsDocumentModalOpen(true)}
          />
        );

      default:
        // TEXT messages y search highlighting
        if (searchTerm && isSearchMode) {
          return highlightText(message.content, searchTerm);
        }
        return message.content;
    }
  };

  return (
    <>
      <div
        title={title()}
        data-message-id={message.id}
        data-message-index={globalIndex}
        className={`mb-4 flex flex-col ${
          isRightSide ? "items-end" : "items-start"
        }`}
      >
        {/* Container principal del mensaje */}
        <div
          className={`flex ${
            isRightSide ? "justify-end" : "justify-start"
          } w-full`}
        >
          {/* Avatar for student messages */}
          {!isRightSide && (
            <div className="flex-shrink-0 mr-2 self-end">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                  isGroupChat
                    ? `${
                        getGroupMemberColorScheme(
                          message.groupMember?.id.toString() ||
                            message.phoneNumber ||
                            " "
                        ).light
                      }`
                    : "bg-tertiary-100"
                }`}
              >
                <div
                  className={`${
                    isGroupChat
                      ? getGroupMemberColorScheme(
                          message.groupMember?.id.toString() ||
                            message.phoneNumber
                        ).text
                      : "text-tertiary-600"
                  }`}
                >
                  {getAvatarIcon(message.sender)}
                </div>
              </div>
            </div>
          )}

          <div
            className={`
              ${
                isMediaMessage() ? "p-1" : "py-3 px-4"
              } rounded-lg max-w-[80%] break-words shadow-sm
              ${bgColor} ${textColor}
              ${isRightSide ? "rounded-tr-none mr-1" : "rounded-tl-none ml-1"}
              ${hasReactions ? "mb-1" : ""}
            `}
          >
            {/* Sender name with icon - Show for group chats on student messages or regular right-side messages */}
            {((isGroupChat && message.sender === "STUDENT") ||
              (isRightSide && senderName)) &&
              !isMediaMessage() && (
                <div
                  className={`text-xs font-medium mb-1 flex items-center gap-1.5 ${
                    message.sender === "USER"
                      ? "text-tertiary-100"
                      : message.sender === "ADMIN" || message.sender === "BOT"
                      ? "text-tertiary-200"
                      : accentColor
                  }`}
                >
                  <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center">
                    {getSenderIcon(message.sender)}
                  </div>
                  <span className="truncate">{senderName}</span>
                </div>
              )}

            {/* Message content */}
            <div
              className={`${
                isMediaMessage() ? "" : "whitespace-pre-wrap leading-relaxed"
              }`}
            >
              {renderMessageContent()}
            </div>

            {/* Timestamp and status - usando el hook de formateo */}
            <div
              className={`text-xs mt-1 flex items-center justify-end ${
                isRightSide ? "text-tertiary-100" : accentColor
              }`}
            >
              {formatMessageTimestamp(message.sentAt)}

              {isRightSide && (
                <span className="ml-1">
                  {message.read ? (
                    <MdDone className="h-3 w-3 inline" />
                  ) : (
                    <MdMoreHoriz className="h-3 w-3 inline" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Spacer for right-side messages */}
          {isRightSide && <div className="w-9 flex-shrink-0"></div>}
        </div>

        {/* Reacciones - mostrar debajo del mensaje */}
        {hasReactions && (
          <div
            className={`max-w-[80%] mt-1 ${isRightSide ? "mr-10" : "ml-10"}`}
          >
            <MessageReactions
              reactions={message.reactions!}
              isFromMe={isRightSide}
              onReactionClick={handleReactionClick}
            />
          </div>
        )}
      </div>

      {/* Modal de zoom para imágenes */}
      {message.messageType === "IMAGE" && message.mediaUrl && (
        <ImageZoomModal
          src={message.mediaUrl}
          alt={`${message.sender}-${message.id}-${globalIndex}`}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}

      {/* Modal de zoom para videos */}
      {message.messageType === "VIDEO" && message.mediaUrl && (
        <VideoZoomModal
          src={message.mediaUrl}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}

      {/* Modal para documentos */}
      {message.messageType === "DOCUMENT" && message.mediaUrl && (
        <DocumentModal
          src={message.mediaUrl}
          fileName={message.fileName || "Documento"}
          fileType={getDocumentFileType(message.mediaUrl)}
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
        />
      )}
    </>
  );
};

export default MessageItem;
