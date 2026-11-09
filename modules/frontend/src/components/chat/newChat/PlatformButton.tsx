import { motion } from "framer-motion";

interface PlatformButtonProps {
  platform: "whatsapp" | "wazend";
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export const PlatformButton = ({ label, isSelected, onClick }: PlatformButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`flex-1 py-2 rounded-md transition-colors duration-200 ${
        isSelected
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </motion.button>
  );
};