// NewChatButton.tsx
import { motion } from "framer-motion";
import { MessageSquareText, Plus } from "lucide-react";
import { useState } from "react";

interface NewChatButtonProps {
  onClick: () => void;
}

const NewChatButton = ({ onClick }: NewChatButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex justify-center">
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-sm overflow-hidden relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          boxShadow: isHovered
            ? "0 4px 8px rgba(59, 130, 246, 0.3)"
            : "0 2px 4px rgba(59, 130, 246, 0.2)"
        }}
      >
        {/* Sutiles elementos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent opacity-40"></div>

        {/* Círculo animado (sutil) */}
        <motion.div
          className="absolute -right-4 top-0 w-8 h-full bg-white/10 rounded-full"
          animate={{
            x: isHovered ? [-15, 0, -15] : -15,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            repeatType: "loop"
          }}
        ></motion.div>

        {/* Icono del chat */}
        <div className="relative flex items-center justify-center z-10">
          <MessageSquareText size={16} className="text-white" />
          <motion.div
            className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          ></motion.div>
        </div>

        {/* Texto */}
        <span className="text-sm font-medium tracking-wide z-10">Nuevo chat</span>

        {/* Icono de plus */}
        <div className="bg-white/10 rounded-full p-0.5 ml-1 z-10">
          <Plus size={12} className="text-white" />
        </div>
      </motion.button>
    </div>
  );
};

export default NewChatButton;