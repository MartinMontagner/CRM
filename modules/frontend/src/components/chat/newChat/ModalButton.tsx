import { motion } from "framer-motion";

interface ModalButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "icon";
  className?: string;
  disabled?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  ["aria-label"]?: string;
}

export const ModalButton = ({ 
  children, 
  type = "button", 
  onClick, 
  variant = "primary",
  className = "",
  disabled,
  onSubmit,
}: ModalButtonProps) => {
  const baseClasses = "px-4 py-2 rounded-md flex items-center gap-2 justify-center";
  
  const variantClasses = {
    primary: `text-white ${disabled ? "bg-gray-400" : "bg-blue-500"} hover:bg-blue-600`,
    secondary: "text-gray-700 bg-gray-200 hover:bg-gray-300",
    icon: "text-gray-500 hover:text-gray-700 p-1"
  };
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className={`${variant !== "icon" ? baseClasses : ""} ${variantClasses[variant]} ${className}`}
      onSubmit={onSubmit}
    >
      {children}
    </motion.button>
  );
};