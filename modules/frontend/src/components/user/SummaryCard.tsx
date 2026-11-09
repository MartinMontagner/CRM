import { motion } from "framer-motion";

export const SummaryCard = ({
  title,
  value,
  color,
  icon,
  loading = false,
}: {
  title: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
  loading?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className={`bg-gradient-to-br ${color} rounded-lg p-4 shadow-md`}
  >
    <h3 className="text-sm uppercase tracking-wider font-semibold mb-2">
      {title}
    </h3>
    <div className="flex items-end justify-between">
      {loading ? (
        <>
          <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {icon}
        </>
      )}
    </div>
  </motion.div>
);
