import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
export const RoleChip = ({
  description,
  onRemove,
}: {
  role: string;
  description: string;
  onRemove: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 text-sm font-medium px-3 py-2 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <span className="flex items-center gap-1">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      {description}
    </span>
    <motion.button
      type="button"
      onClick={onRemove}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="ml-1 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors duration-200"
      aria-label={`Remover ${description}`}
    >
      <FaTimes className="w-3 h-3" />
    </motion.button>
  </motion.div>
);
