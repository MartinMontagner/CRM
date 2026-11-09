import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaUsers,
  FaChevronDown,
  FaCheck,
  FaServer,
} from "react-icons/fa";
import { MdSelectAll } from "react-icons/md";
import { PlatformType } from "@/model/chats/PlatformType";
import { useQuery } from "react-query";
import { getAllWazendInstances } from "@/service/chat/WazendService";
import { WazendInstanceDTO } from "@/model/wazend/WazendInstanceDTO";

interface PlatformSelectorProps {
  selectedPlatform: PlatformType;

  onPlatformChange: (platform: PlatformType, id: number | null) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onPlatformChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null
  );
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Lista de instancias de wazend disponibles
  const wazendInstances = useQuery<WazendInstanceDTO[]>(
    "wazendInstances",
    async () => {
      const res = await getAllWazendInstances();
      return res;
    },
    {
      cacheTime: 0, 
      refetchOnWindowFocus: false,
    }

  );

  const platforms: {
    id: string;
    name: string;
    icon: React.ReactNode;
    instances?: WazendInstanceDTO[];
    hasInstances?: boolean;
  }[] = [
    {
      id: "ALL",
      name: "Todas",
      icon: <MdSelectAll className="text-blue-500" size={18} />,
      instances: [],
    },
    {
      id: "WHATSAPP",
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-green-500" size={18} />,
    },
    {
      id: "WAZEND",
      name: "Wazend",
      icon: <FaServer className="text-purple-500" size={18} />,
      instances: wazendInstances.data || [],
      hasInstances: true,
    },
    {
      id: "WAZEND_GROUP",
      name: "Wazend Grupo",
      icon: <FaUsers className="text-orange-500" size={18} />,
      instances: wazendInstances.data || [],
      hasInstances: true,
    },
  ];

  const isPlattformSelected = (platformId: string) => {
    return selectedPlatform === platformId && !selectedInstanceId;
  };

  const hasSelectedInstance = (platformId: string) => {
    return selectedPlatform === platformId && selectedInstanceId !== null;
  };

  const getSelectedInstanceName = (platformId: string) => {
    if (!hasSelectedInstance(platformId)) return null;
    const platform = platforms.find((p) => p.id === platformId);
    return platform?.instances?.find((inst) => inst.id === selectedInstanceId)
      ?.name;
  };

  const handleSelectPlatform = (
    platform: PlatformType,
    id: number | null = null
  ) => {
    onPlatformChange(platform, id);
    setSelectedInstanceId(null); // Reinicia la instancia seleccionada
    setIsOpen(false);
    setExpandedPlatform(null);
  };

  const handleSelectInstance = (
    platform: PlatformType,
    instance: WazendInstanceDTO
  ) => {
    onPlatformChange(platform, instance.id);
    setIsOpen(false);
    setExpandedPlatform(null);
  };

  const toggleExpanded = (platformId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPlatform(expandedPlatform === platformId ? null : platformId);
  };

  // Obtener el nombre para mostrar del platform seleccionado
  const getDisplayName = () => {
    const platform = platforms.find((p) => p.id === selectedPlatform);
    if (!platform) return "Todas";

    if (selectedInstanceId && platform.instances) {
      const instance = platform.instances.find(
        (inst) => inst.id === selectedInstanceId
      );
      if (instance) {
        return `${platform.name} - ${instance.name.length > 5 ? instance.name.slice(0, 5) + "..." : instance.name}`;
      }
    }

    return platform.name;
  };

  const getDisplayIcon = () => {
    const platform = platforms.find((p) => p.id === selectedPlatform);
    return (
      platform?.icon || <MdSelectAll className="text-blue-500" size={18} />
    );
  };

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={toggleDropdown}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {getDisplayIcon()}
        <span className="text-gray-700 max-w-36 font-medium text-wrap">{getDisplayName()}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown size={14} className="text-gray-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-80 right-0"
            role="listbox"
          >
            {platforms.map((platform) => (
              <div key={platform.id}>
                <div className="flex items-center">
                  <motion.button
                    className={`flex items-center gap-3 flex-1 px-4 py-3 text-sm text-left transition-colors relative ${
                      isPlattformSelected(platform.id)
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : hasSelectedInstance(platform.id)
                        ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      handleSelectPlatform(platform.id as PlatformType)
                    }
                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                    role="option"
                    aria-selected={
                      selectedPlatform === platform.id && !selectedInstanceId
                    }
                  >
                    {platform.icon}
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{platform.name}</span>
                      {hasSelectedInstance(platform.id) && (
                        <span className="text-xs text-green-600 font-medium">
                          ⚡ {getSelectedInstanceName(platform.id)}
                        </span>
                      )}
                    </div>
  
                  {platform.hasInstances &&
                    (platform.instances?.length ?? 0) > 0 && (
                      <motion.div
                        className="px-3 py-4 hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={(e) => toggleExpanded(platform.id, e)}
                      >
                        <motion.div
                          animate={{
                            rotate: expandedPlatform === platform.id ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <FaChevronDown size={12} className="text-gray-400" />
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.button>

                </div>

                <AnimatePresence>
                  {expandedPlatform === platform.id && platform.instances && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-y-auto scrollbar max-h-60 overflow-x-hidden"
                    >
                      <div className="bg-gray-50 border-t border-gray-100">
                        <div className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Instancias disponibles
                        </div>
                        {platform.instances.map((instance) => (
                          <motion.button
                            key={instance.id}
                            className={`flex items-center justify-between w-full px-8 py-3 text-sm text-left transition-all duration-200 relative ${
                              selectedInstanceId === instance.id
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform"
                                : "text-gray-600 hover:bg-white hover:shadow-sm"
                            }`}
                            onClick={() => {
                              handleSelectInstance(
                                platform.id as PlatformType,
                                instance
                              );
                              setSelectedInstanceId(instance.id);
                            }}
                            whileHover={{
                              scale:
                                selectedInstanceId === instance.id
                                  ? 1.02
                                  : 1.01,
                              x: selectedInstanceId === instance.id ? 0 : 4,
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                                  selectedInstanceId === instance.id
                                    ? "border-white bg-white"
                                    : "border-gray-300 bg-transparent"
                                }`}
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                {selectedInstanceId === instance.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="w-2 h-2 bg-blue-500 rounded-full"
                                  />
                                )}
                              </motion.div>
                              <div className="flex flex-col">
                                <span
                                  className={`font-semibold ${
                                    selectedInstanceId === instance.id
                                      ? "text-white"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {instance.name.length > 10
                                    ? `${instance.name.slice(0, 10)}...`
                                    : instance.name}
                                </span>
                                <span
                                  className={`text-xs ${
                                    selectedInstanceId === instance.id
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {instance.instance}
                                </span>
                              </div>
                            </div>

                            {selectedInstanceId === instance.id && (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 20,
                                  delay: 0.1,
                                }}
                                className="flex items-center justify-center w-7 h-7 bg-white bg-opacity-20 rounded-full backdrop-blur-sm"
                              >
                                <FaCheck size={12} className="text-white" />
                              </motion.div>
                            )}

                            {/* Efecto de brillo para la seleccionada */}
                            {selectedInstanceId === instance.id && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 2,
                                  ease: "linear",
                                }}
                              />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlatformSelector;