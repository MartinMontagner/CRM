import {
  Filter,
  getAdvancedFilterOptions,
} from "@/components/constants/Filter";
import { ConversationDTO } from "@/model/chats/Chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Search, ChevronDown, ChevronUp, FilterIcon } from "lucide-react";
import ChatList from "./ChatList";
import LoadingSpinner from "./LoadingSpinner";
import { useFilterSelectedStore } from "./FilterSelectedStore";
import { useRefreshChatStore } from "@/state/chat/RefreshChatStore";
import NewChatModal, { NewChatData } from "./newChat/NewChatModal";
import { FilterTag } from "./FilterTag";
import NewChatButton from "./newChat/NewChatButton";
import PlatformSelector from "./PlatformSelector";
import ReadStatusSelector from "./ReadStatusSelector"; // Importar el nuevo componente
import { PlatformType } from "@/model/chats/PlatformType";
import { CustomTag } from "@/model/chats/Contact";
import { getAllCustomTags } from "@/service/tags/CustomTagService";
import { motion, AnimatePresence } from "framer-motion";
import { ReadStatusType } from "@/model/chats/ReadStatusType";
import { useAppStore } from "@/state/store";
import { studentTagsAllowed } from "@/utils/getStudentTagsAllowed";
import { StudentTagType } from "@/types/StudentTags";
import { StudentTagButton } from "./StudentTagButton";


interface SidebarProps {
  conversations: ConversationDTO[];
  onSelectChat: (conversation: ConversationDTO) => void;
  loading?: boolean;
  currentChatId?: number | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  isMobileView?: boolean;
  onCreateNewChat?: (data: NewChatData) => void;
  formatPhoneNumber?: (phone: string) => string;
}

const studentTagsMapping: Record<StudentTagType, string> = {
  ALL: "Todos",
  LEAD: "Lead",
  ALUMNO: "Alumno",
  EX_ALUMNO: "Ex-Alumno",
};

const Sidebar = ({
  conversations,
  onSelectChat,
  loading = false,
  currentChatId = null,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isMobileView = false,
  onCreateNewChat,
  formatPhoneNumber,
}: SidebarProps) => {
  // Component state
  const [localSearchText, setLocalSearchText] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilterOption, setSelectedFilterOption] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  // Variables de estado para manejo de filtros de tipo custom tag
  const [customTagsImportants, setCustomTagsImportants] = useState<CustomTag[]>([]);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);

  // store de refresh
  const { isRefetching, isRealTimeEnabled } = useRefreshChatStore();

  // References
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const authData = useAppStore((state) => state.authData);
  const roles = authData?.roles || [];

  const shouldShowFilter = roles.every(role => {
    const allowedTags = studentTagsAllowed(role);
    return allowedTags.length > 1;
  });

  useEffect(() => {
    const fetchCustomTags = async () => {
      try {
        const response = await getAllCustomTags();
        // Filtrar los tags importantes
        const importantTags = response.filter(tag => tag.important === true);
        setCustomTagsImportants(importantTags);
        const otherTags = response.filter(tag => tag.important === false);
        setCustomTags(otherTags);
      } catch (error) {
        console.error("Error fetching custom tags:", error);
      }
    }
    fetchCustomTags();
  }, []);

  // Custom store hooks
  const {
    selectedFilters,
    searchText,
    readStatus,
    selectedPlatform,
    selectedStudentTags,
    isAdvancedFilterActive,
    setSelected,
    setSearchText,
    setReadStatus,
    setPlatform,
    setStudentTags,
    addAdvancedFilter,
    applyFilters,
    setWazendInstanceId,
  } = useFilterSelectedStore();

  // Select active filter (only take the first one)
  const activeFilter =
    selectedFilters && selectedFilters.length > 0
      ? selectedFilters[0]
      : Filter.ALL;
  
  // Select active student tag filter
  const activeFilterTag = 
    selectedStudentTags && selectedStudentTags !== "ALL"
      ? selectedStudentTags
      : "ALL";

  // Get available filters
  const filterOptions = getAdvancedFilterOptions() || [];
  const advancedFilterChips = Object.entries(
    useFilterSelectedStore.getState().advancedFilters
  )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value)
    .map(([key, value]) => {
      // Busca el nombre personalizado del filtro
      const option = filterOptions.find((opt) => opt.content === key);
      const label = option ? option.personalizedTag : key;
      return (
        <span
          key={key}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-2 mb-2"
        >
          {label}: <span className="font-semibold">{value}</span>
          <button
            className="ml-1 text-blue-600 hover:text-blue-900"
            onClick={() => {
              // Quitar solo este filtro avanzado
              useFilterSelectedStore.getState().removeAdvancedFilter(key);
            }}
            aria-label={`Quitar filtro ${label}`}
          >
            <X size={14} />
          </button>
        </span>
      );
    });
  
  // Lógica para determinar qué tags mostrar
  const getVisibleTags = () => {
    const tags = [];

    // Siempre agregar "Todos"
    tags.push({
      key: Filter.ALL,
      label: "Todos",
      isActive: activeFilter === Filter.ALL,
      onClick: () => handleTagSelect(Filter.ALL)
    });

    // Combinar todas las etiquetas: importantes primero, luego normales
    const allTags = [...customTagsImportants, ...customTags];

    // Mostrar las primeras 5 etiquetas (priorizando importantes)
    const tagsToShow = allTags.slice(0, 5);
    tagsToShow.forEach(tag => {
      tags.push({
        key: tag.id,
        label: tag.name,
        isActive: activeFilter === tag.id.toString(),
        onClick: () => handleTagSelect(tag.id.toString())
      });
    });

    return tags;
  };

  // Lógica para determinar qué tags adicionales mostrar cuando se expande
  const getAdditionalTags = () => {
    const additionalTags: { key: number; label: string; isActive: boolean; onClick: () => void; }[] = [];

    // Combinar todas las etiquetas: importantes primero, luego normales
    const allTags = [...customTagsImportants, ...customTags];

    // Mostrar el resto de las etiquetas (después de las primeras 5)
    const remainingTags = allTags.slice(5);
    remainingTags.forEach(tag => {
      additionalTags.push({
        key: tag.id,
        label: tag.name,
        isActive: activeFilter === tag.id.toString(),
        onClick: () => handleTagSelect(tag.id.toString())
      });
    });

    return additionalTags;
  };

  // Determinar si se debe mostrar el toggle
  const shouldShowToggle = () => {
    // Mostrar toggle si hay más de 5 etiquetas en total
    const totalTags = customTagsImportants.length + customTags.length;
    return totalTags > 5;
  };

  const visibleTags = getVisibleTags();
  const additionalTags = getAdditionalTags();

  // Initialize local search text from store
  useEffect(() => {
    setLocalSearchText(searchText || "");
  }, [searchText]);

  // Set up observer for infinite scroll
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

    // Function to toggle advanced filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);

    // // If we close filters and there's an active advanced filter, clear it
    // if (showFilters && isAdvancedFilterActive) {
    //   resetFilters();
    //   setSelectedFilterOption("");
    //   setFilterValue("");
    //   setSelectedCountry("");
    // }
  };

  // Function to handle main filter tag selection
  const handleTagSelect = (tag: string) => {
    if (tag) {
      setSelected(tag);
      // When selecting a main filter, reset advanced filters
      setSelectedFilterOption("");
      setFilterValue("");
      setSelectedCountry("");
    }
  };

  // Function to handle student tag selection
  const handleStudentTagSelect = (tag: StudentTagType) => {
    if (tag) {
      setStudentTags(tag);
      // When selecting a student tag, reset advanced filters
      setSelectedFilterOption("");
      setFilterValue("");
      setSelectedCountry("");
    }
  }

  const handleMessagesSelect = (readStatus: ReadStatusType) => { 
    setReadStatus(readStatus);
    // When selecting a read status, reset advanced filters
    setSelectedFilterOption("");
    setFilterValue("");
    setSelectedCountry("");
  }

  // Function to handle platform change
  const handlePlatformChange = (platform: PlatformType, id: number | null) => {
    setPlatform(platform);
    if (platform === "ALL") {
      setWazendInstanceId(null);
      return;
    }
    if (!id) {
      setWazendInstanceId(null);
      return;
    }
    setWazendInstanceId(id);
  };

  // Function to handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update local state immediately for UI
    setLocalSearchText(value);

    // Use debounce to update the store
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value);
    }, 300);
  };

    // Function to apply advanced filter
  const applyAdvancedFilter = () => {
    if (selectedFilterOption) {
      if (selectedFilterOption === "COUNTRY") {
        addAdvancedFilter(selectedFilterOption, selectedCountry);
      } else if (filterValue.trim()) {
        addAdvancedFilter(selectedFilterOption, filterValue.trim());
      }
    }
  };

  // Handle filter option change
  const handleFilterOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterOption(e.target.value);
    setFilterValue(""); // Reset value when changing filter type
    setSelectedCountry(e.target.value === "COUNTRY" ? "" : "");
  };

  // Handle new chat creation
  const handleNewChatSubmit = (data: NewChatData) => {
    if (onCreateNewChat) {
      onCreateNewChat(data);
    }
    setIsNewChatModalOpen(false);
  };

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Apply local filtering to the conversations
  const filteredConversations = applyFilters(conversations || []);

  // Función por defecto para formatear teléfono si no se proporciona
  const defaultFormatPhoneNumber = useCallback((phone: string) => {
    try {
      return phone.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "+$1 $2-$3-$4");
    } catch (e) {
      console.error("Error formateando número de teléfono:", e);
      return phone || "";
    }
  }, []);

  const phoneFormatter = formatPhoneNumber || defaultFormatPhoneNumber;

  // Determine CSS classes based on view mode using Tailwind responsive classes
  const containerClasses = isMobileView
    ? "flex flex-col h-full w-full bg-white" // Mobile view: full width
    : "flex flex-col bg-white shadow-md h-full w-full md:w-1/2 md:min-w-[250px] md:max-w-sm overflow-hidden"; // Responsive: full width on mobile, sidebar on desktop

  return (
    <div className={containerClasses}>
      <div className="px-4 pt-4 flex flex-col bg-gradient-to-b from-[#F0F0F0] to-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">CHATS</h1>
          <div className="flex items-center gap-2">
            <ReadStatusSelector
              selectedStatus={readStatus}
              onStatusChange={handleMessagesSelect}
            />
            <PlatformSelector
              selectedPlatform={selectedPlatform}
              onPlatformChange={handlePlatformChange}
            />
          </div>
        </div>

        <div className="mb-2">
          <NewChatButton onClick={() => setIsNewChatModalOpen(true)} />
        </div>

        {/* Main search bar - only visible if no advanced filter is active */}
        {!isAdvancedFilterActive && (
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar"
              value={localSearchText}
              onChange={handleSearchChange}
              className="w-full h-8 pl-8 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tertiary-400"
            />
          </div>
        )}
        {/* Mostrar chips de filtros avanzados activos */}
        {advancedFilterChips.length > 0 && (
          <div className="flex flex-wrap mb-4">{advancedFilterChips}</div>
        )}

        {/* Mostrar selector de etiquetas de estudiante si hay más de un tag permitido */}
        {shouldShowFilter && (
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(studentTagsMapping).map(([key, label]) => {
              const isActive = activeFilterTag === key;
              console.log(`Student tag: ${key}, isActive: ${isActive}, activeFilterTag: ${activeFilterTag}`);
              
              return (
                <StudentTagButton
                  key={key}
                  tag={key as StudentTagType}
                  label={label}
                  isActive={isActive}
                  onClick={() => handleStudentTagSelect(key as StudentTagType)}
                />
              );
            })}
          </div>
        )}

        {/* Filter tags - disponibles en todas las vistas */}
          <div className="mb-4">
            {/* Tags principales */}
            <div className="flex flex-wrap gap-2 mb-2">
              {visibleTags.map((tag) => (
                <FilterTag
                  key={tag.key}
                  label={tag.label}
                  isActive={tag.isActive}
                  onClick={tag.onClick}
                />
              ))}
            </div>

            {/* Tags adicionales (mostrar solo si showAllTags es true) */}
            {showAllTags && additionalTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {additionalTags.map((tag) => (
                  <FilterTag
                    key={tag.key}
                    label={tag.label}
                    isActive={tag.isActive}
                    onClick={tag.onClick}
                  />
                ))}
              </div>
            )}

            {/* Toggle button */}
            {shouldShowToggle() && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label={showAllTags ? "Mostrar menos etiquetas" : "Mostrar más etiquetas"}
                >
                  {showAllTags ? (
                    <>
                      Mostrar menos
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Mostrar más
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Banner de filtro avanzado activo - removido el condicional de mobile */}

        {/* Button to show advanced filters */}
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleFilters}
            className="flex items-center gap-1 px-4 py-1 text-sm text-gray-700 border-gray-300"
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
          >
            <FilterIcon size={16} className="text-gray-600" />
            Filtrar
            {showFilters ? (
              <ChevronUp size={16} className="text-gray-600 ml-1" />
            ) : (
              <ChevronDown size={16} className="text-gray-600 ml-1" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              id="advanced-filters"
              className="mb-4 p-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-3">
                <select
                  value={selectedFilterOption}
                  onChange={handleFilterOptionChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tertiary-400 text-center"
                  aria-label="Seleccionar tipo de filtro"
                >
                  <option value="">Seleccionar filtro</option>
                  {filterOptions.map(option => (
                    <option key={option.content} value={option.content}>
                      {option.personalizedTag}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFilterOption && (
                <motion.div
                  className="mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <input
                    type="text"
                    placeholder={
                      selectedFilterOption
                        ? `Filtrar por ${filterOptions.find(opt => opt.content === selectedFilterOption)?.personalizedTag || selectedFilterOption}`
                        : "Escriba aquí..."
                    }
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tertiary-400"
                    aria-label={`Filtrar por ${selectedFilterOption}`}
                  />
                </motion.div>
              )}

              {selectedFilterOption && (
                <motion.div
                  className="flex justify-center mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <button
                    onClick={applyAdvancedFilter}
                    className="w-full px-3 py-2 text-center text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Aplicar filtro
                  </button>
                </motion.div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={toggleFilters}
                  className="flex items-center justify-center gap-1 px-3 py-1 text-sm text-gray-700"
                  aria-label="Cerrar filtros avanzados"
                >
                  COMPRIMIR
                  <ChevronUp size={16} className="text-gray-600" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Chat list */}
      <div
        className={`flex-1 overflow-hidden ${isMobileView ? "px-4" : "pl-2"}`}
        ref={listRef}
      >
        {loading || isRefetching ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            {isRefetching && (
              <p className="text-sm text-gray-500 mt-2">
                {isRealTimeEnabled
                  ? "Sincronizando..."
                  : "Actualizando chats..."}
              </p>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto" aria-live="polite">
            {Array.isArray(filteredConversations) &&
              filteredConversations.length > 0 ? (
              <ChatList
                chats={filteredConversations}
                onSelectChat={onSelectChat}
                currentChatId={currentChatId}
                formatPhoneNumber={phoneFormatter}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                lastItemRef={lastItemRef}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron conversaciones
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={handleNewChatSubmit}
      />
    </div>
  );
};

export default Sidebar;