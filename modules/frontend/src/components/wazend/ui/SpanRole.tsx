import { RoleDescription } from "@/model/auth/AuthData";
import { 
  FaCrown, 
  FaUserShield, 
  FaBullhorn, 
  FaChartLine, 
  FaUserGraduate, 
  FaHandsHelping, 
  FaUser,
  FaBook,
  FaUserTie,
  FaHandshake
} from "react-icons/fa";
import { motion } from "framer-motion";

interface SpanRoleProps {
  role: string;
  rolesDescription: RoleDescription[];
}

const commonAnimationProps = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const iconAnimations = {
  SUPER_ADMIN: { rotate: [0, 10, -10, 0], duration: 2 },
  ADMIN: { scale: [1, 1.2, 1], duration: 1.5 },
  RESP_MARKETING: { rotate: [0, 15, -15, 0], duration: 1.8 },
  MARKETING: { y: [0, -2, 0], duration: 1.2 },
  RESP_ATT_ALUMNO: { rotate: [0, 5, -5, 0], duration: 2.5 },
  ATT_ALUMNO: { x: [0, 1, -1, 0], duration: 2 },
  USER: { scale: [1, 1.1, 1], duration: 3 },
  COACH_HEBREO: { rotate: [0, 8, -8, 0], duration: 2.2 },
  COACH_MENTORIA: { y: [0, -3, 0], duration: 1.8 },
  VENTAS: { scale: [1, 1.15, 1], duration: 1.6 },
  DEFAULT: { opacity: [1, 0.7, 1], duration: 2 },
};

const roleStyles: Record<string, { className: string; hoverColor: string }> = {
  SUPER_ADMIN: {
    className: "bg-purple-100 text-purple-800 border-purple-200",
    hoverColor: "#e9d5ff",
  },
  ADMIN: {
    className: "bg-red-100 text-red-800 border-red-200",
    hoverColor: "#fecaca",
  },
  RESP_MARKETING: {
    className: "bg-orange-100 text-orange-800 border-orange-200",
    hoverColor: "#fed7aa",
  },
  MARKETING: {
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hoverColor: "#fef3c7",
  },
  RESP_ATT_ALUMNO: {
    className: "bg-blue-100 text-blue-800 border-blue-200",
    hoverColor: "#dbeafe",
  },
  ATT_ALUMNO: {
    className: "bg-cyan-100 text-cyan-800 border-cyan-200",
    hoverColor: "#cffafe",
  },
  USER: {
    className: "bg-gray-100 text-gray-800 border-gray-200",
    hoverColor: "#f3f4f6",
  },
  COACH_HEBREO: {
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    hoverColor: "#d1fae5",
  },
  COACH_MENTORIA: {
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    hoverColor: "#e0e7ff",
  },
  VENTAS: {
    className: "bg-teal-100 text-teal-800 border-teal-200",
    hoverColor: "#ccfbf1",
  },
  DEFAULT: {
    className: "bg-slate-100 text-slate-800 border-slate-200",
    hoverColor: "#f1f5f9",
  },
};

export const SpanRole = ({ role, rolesDescription }: SpanRoleProps) => {
  const typeSpanRoleStyle = (role: string) => {
    const { className, hoverColor } = roleStyles[role] || roleStyles.DEFAULT;
    /** @ts-expect-error Role may not exist in iconAnimations, fallback to DEFAULT */
    const iconAnimation = iconAnimations[role] || iconAnimations.DEFAULT;

    return (
      <motion.span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs select-none font-medium rounded-full border ${className}`}
        {...commonAnimationProps}
        whileHover={{ ...commonAnimationProps.whileHover, backgroundColor: hoverColor }}
      >
        <motion.div
          animate={iconAnimation}
          transition={{ duration: iconAnimation.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          {getIconByRole(role)}
        </motion.div>
        {rolesDescription?.find((r) => r.role.toString() === role)?.description || role}
      </motion.span>
    );
  };

  const getIconByRole = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <FaCrown className="w-3 h-3" />;
      case "ADMIN":
        return <FaUserShield className="w-3 h-3" />;
      case "RESP_MARKETING":
        return <FaBullhorn className="w-3 h-3" />;
      case "MARKETING":
        return <FaChartLine className="w-3 h-3" />;
      case "RESP_ATT_ALUMNO":
        return <FaUserGraduate className="w-3 h-3" />;
      case "ATT_ALUMNO":
        return <FaHandsHelping className="w-3 h-3" />;
      case "USER":
        return <FaUser className="w-3 h-3" />;
      case "COACH_HEBREO":
        return <FaBook className="w-3 h-3" />;
      case "COACH_MENTORIA":
        return <FaUserTie className="w-3 h-3" />;
      case "VENTAS":
        return <FaHandshake className="w-3 h-3" />;
      default:
        return <FaUser className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      key={role}
      title={`Rol: ${
        rolesDescription?.find((r) => r.role.toString() === role)
          ?.description || "Descripción no disponible"
      }`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {typeSpanRoleStyle(role)}
    </motion.div>
  );
};