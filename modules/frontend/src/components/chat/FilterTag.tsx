import { motion } from "framer-motion";
// Filter Tag Component
interface FilterTagProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const FilterTag = ({ label, isActive, onClick }: FilterTagProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
        isActive
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </motion.button>
  );
};