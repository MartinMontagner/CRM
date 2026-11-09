import { useState } from "react";

interface ReactionDTO {
  reaction: string; // Emoji de la reacción
  count: number; // Número de veces que se ha reaccionado con este emoji
}

interface MessageReactionsProps {
  reactions: ReactionDTO[];
  isFromMe?: boolean;
  onReactionClick?: (reaction: string) => void;
}

export const MessageReactions = ({ 
  reactions, 
  isFromMe = false,
  onReactionClick 
}: MessageReactionsProps) => {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Ordenar reacciones por count descendente
  const sortedReactions = [...reactions].sort((a, b) => b.count - a.count);

  const handleReactionClick = (reaction: string) => {
    if (onReactionClick) {
      onReactionClick(reaction);
    }
  };

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${isFromMe ? 'justify-end' : 'justify-start'}`}>
      {sortedReactions.map((reaction, index) => (
        <button
          key={`${reaction.reaction}-${index}`}
          onClick={() => handleReactionClick(reaction.reaction)}
          onMouseEnter={() => setHoveredReaction(reaction.reaction)}
          onMouseLeave={() => setHoveredReaction(null)}
          className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
            transition-all duration-200 cursor-pointer select-none
            ${isFromMe 
              ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }
            ${hoveredReaction === reaction.reaction ? 'scale-105 shadow-sm' : ''}
            hover:shadow-md active:scale-95
          `}
          title={`${reaction.reaction} ${reaction.count}`}
        >
          {/* Emoji */}
          <span 
            className={`text-sm transition-transform duration-200 ${
              hoveredReaction === reaction.reaction ? 'scale-110' : ''
            }`}
          >
            {reaction.reaction}
          </span>
          
          {/* Count */}
          <span className="font-medium text-xs">
            {reaction.count}
          </span>
        </button>
      ))}
    </div>
  );
};