import React, { useEffect, useState, useRef } from "react";
import { Table, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "./MemberSubscriptionTable.css";
import { useSorting } from "@/hooks/useSorting";
import { useSelection } from "@/hooks/useSelection";
import { useMemberSubscriptions } from "@/hooks/useMemberSubscriptions";
import { AppliedFilters } from "./AppliedFilters";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { ActionBar } from "./ActionBar";
import { SendMessageModal } from "../workers/SendMessageModal";
import { sortMemberSubscriptions } from "@/utils/sortUtils";
import { TableSkeleton } from "../skeletons/table/TableSkeleton";
import { useFiltersStore } from "@/hooks/useFilters";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Nuevos imports para el modal de chat
import { ChatConversationsModal } from "./modalChat/ChatConversationsModal";
import { useConversations, useChatNavigation } from "@/hooks/useConversations";

const MemberSubscriptionTable: React.FC = () => {
  // Initialize custom hooks
  const { appliedFilters, removeFilter, clearFilters } = useFiltersStore();
  const { sortConfig, hasSortChanged } = useSorting();

  // Pagination state
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customPage, setCustomPage] = useState("1");
  
  // Ref para evitar bucles infinitos
  const hasMountedRef = useRef(false);
  // Controlar si estamos en medio de una actualización de filtro
  const isFilteringRef = useRef(false);
  
  const {
    selectedIds,
    toggleSelection,
    clearSelection,
    toggleSelectAll,
    getSelectedPhoneNumbers,
  } = useSelection();

  const {
    members,
    loading,
    isFetching,
    totalFilteredItems,
    fetchMemberSubscriptions,
    totalElements,
  } = useMemberSubscriptions({
    appliedFilters,
    sortConfig,
    pageSize,
    page: currentPage - 1, // Ajuste para backend (0-indexed)
  });

  // Modal state for send message
  const [
    sendMessageOpened,
    { open: openSendMessageModal, close: closeSendMessageModal },
  ] = useDisclosure(false);

  // Nuevos hooks y estado para el modal de chat
  const { conversations, loading: conversationsLoading, fetchConversations } = useConversations();
  const { navigateToChat } = useChatNavigation();
  const [
    chatModalOpened,
    { open: openChatModal, close: closeChatModal },
  ] = useDisclosure(false);
  const [selectedPhoneForChat, setSelectedPhoneForChat] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  // Calculate total pages
  useEffect(() => {
    if (!loading) {
      const total = appliedFilters.length > 0 ? totalFilteredItems : totalElements;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
    }
  }, [totalFilteredItems, totalElements, pageSize, loading, appliedFilters.length]);

  // Efecto para manejar cambios en los filtros
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    
    // Marcar que estamos en proceso de filtrado
    isFilteringRef.current = true;
    
    // Reset pagination al aplicar filtros
    setCurrentPage(1);
    setCustomPage("1");
    
    // Small delay to ensure state updates are processed
    setTimeout(() => {
      // Desmarcar el proceso de filtrado después de un pequeño retraso
      isFilteringRef.current = false;
    }, 200);
    
  }, [appliedFilters]); // Dependencia en los filtros

  // Handle page size change
  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      const newSize = parseInt(value);
      setPageSize(newSize);
      setCurrentPage(1);
      setCustomPage("1");
    }
  };

  // Check for sort changes - efecto aislado para evitar bucles
  useEffect(() => {
    if (!hasMountedRef.current || isFilteringRef.current) {
      return;
    }
    
    const sortChanged = hasSortChanged();
    if (sortChanged && !isFetching && !loading) {
      // Usamos setTimeout para evitar condiciones de carrera
      const timeoutId = setTimeout(() => {
        fetchMemberSubscriptions(currentPage - 1, pageSize, true);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [sortConfig.field, sortConfig.direction]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (loading || isFetching) return; // No cambiar la página mientras carga
    
    setCurrentPage(page);
    setCustomPage(page.toString());
    
    // Si hay filtros aplicados, no enviar un page number (se usará 0 por defecto)
    // De lo contrario, enviar el page number actual
    const pageToSend = appliedFilters.length > 0 ? 0 : page - 1;
    
    // Actualizar datos con un pequeño retraso
    setTimeout(() => {
      fetchMemberSubscriptions(pageToSend, pageSize, false);
    }, 50);
  };

  // Handle custom page input change
  const handleCustomPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPage(e.target.value);
  };

  // Handle custom page submit
  const handleCustomPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(customPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // Si hay filtros aplicados, no enviar un page number (se usará 0 por defecto)
      // De lo contrario, enviar el page number actual
      const pageToSend = appliedFilters.length > 0 ? 0 : page - 1;
      
      // Asegurarse de cargar datos para la nueva página
      setTimeout(() => {
        fetchMemberSubscriptions(pageToSend, pageSize, false);
      }, 50);
    } else {
      setCustomPage(currentPage.toString());
    }
  };

  // Nueva función para manejar el click en el icono de chat
  const handleChatClick = async (phoneNumber: string) => {
    // Encontrar el miembro para obtener el nombre del estudiante
    const member = members.find(m => m.phone === phoneNumber);
    
    setSelectedPhoneForChat(phoneNumber);
    setSelectedStudentName(member?.firstName && member?.lastName 
      ? `${member.firstName} ${member.lastName}` 
      : member?.firstName || ""
    );
    
    // Abrir el modal y cargar las conversaciones
    openChatModal();
    await fetchConversations(phoneNumber);
  };

  // Función para manejar la selección de una conversación específica
  const handleSelectConversation = (conversationId: number, platform: any, wazendInstance?: string) => {
    navigateToChat(conversationId, platform, wazendInstance);
  };

  // Get sorted members (client-side sorting when filters are applied)
  const sortedMembers =
    appliedFilters.length > 0
      ? sortMemberSubscriptions(members, sortConfig)
      : members;
      
  // Calcular el rango de filas que se está mostrando
  const total = appliedFilters.length > 0 ? totalFilteredItems : totalElements;
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, total);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white pt-3 pb-1 px-6 rounded-3xl shadow-md h-full flex flex-col"
    >
      {/* Top section with applied filters and pagination controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-grow">
          {/* Applied Filters */}
          <AppliedFilters
            filters={appliedFilters}
            onRemoveFilter={removeFilter}
            onClearFilters={clearFilters}
          />
        </div>
        
        {/* Rows per page selector */}
        <div className="flex items-center ml-4">
          <span className="text-sm text-gray-600 mr-2">Filas por página:</span>
          <Select
            data={[
              { value: "20", label: "20" },
              { value: "50", label: "50" },
              { value: "200", label: "200" },
              { value: "500", label: "500" },
            ]}
            value={pageSize.toString()}
            onChange={handlePageSizeChange}
            styles={{
              input: {
                width: "80px",
                height: "35px",
                fontSize: "0.875rem",
              },
            }}
          />
        </div>
      </div>

      {/* Main Table Container with dynamic height */}
      <div className="flex flex-col w-full flex-grow">
        <div className="w-full flex justify-center flex-grow">
          {/* Table with dynamic height based on ActionBar visibility */}
          <div
            className="w-full overflow-auto rounded-t-md relative"
            style={{
              height: selectedIds.length > 0 
                ? "calc(100vh - 320px)" // Altura reducida cuando ActionBar es visible
                : "calc(100vh - 250px)", // Altura normal
              minHeight: "300px",
            }}
          >
            <Table
              unstyled
              highlightOnHover
              styles={{
                table: {
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                },
                th: {
                  color: "#AAAAAA",
                  fontWeight: "normal",
                  textAlign: "left",
                  border: "none",
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "#fff",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                },
                td: {
                  whiteSpace: "nowrap",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                },
              }}
            >
              {/* Table Header */}
              <TableHeader
                clearSelection={clearSelection}
                hasAppliedFilters={appliedFilters.length > 0}
                isLoading={loading}
                isAutoLoading={false}
                members={sortedMembers}
                selectedIds={selectedIds}
                onSelectAll={toggleSelectAll}
              />

              {/* Table Body */}
              {!loading ? (
                <TableBody
                  members={sortedMembers}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelection}
                  onChatClick={handleChatClick} // Nueva prop
                />
              ) : (
                <></>
              )}
            </Table>
            {loading && <TableSkeleton />}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4 py-2 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {loading ? (
              "Cargando datos..."
            ) : total > 0 ? (
              `Mostrando ${startRow} - ${endRow}`
            ) : (
              "Sin resultados"
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || loading}
              className={`p-1 rounded-full ${
                currentPage <= 1 || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <form onSubmit={handleCustomPageSubmit} className="flex items-center">
              <span className="text-sm text-gray-600">Página</span>
              <input
                type="text"
                value={customPage}
                onChange={handleCustomPageChange}
                onBlur={handleCustomPageSubmit}
                className="mx-2 w-12 h-8 border border-gray-300 rounded text-center text-sm"
                disabled={loading}
              />
              <span className="text-sm text-gray-600">de {totalPages}</span>
            </form>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || loading}
              className={`p-1 rounded-full ${
                currentPage >= totalPages || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar for selected items */}
        <ActionBar
          selectedCount={selectedIds.length}
          onOpenSendMessageModal={openSendMessageModal}
        />

        {/* Send Message Modal */}
        <SendMessageModal
          isOpen={sendMessageOpened}
          onClose={closeSendMessageModal}
          selectedCount={selectedIds.length}
          phoneNumbers={getSelectedPhoneNumbers(members)}
        />

        {/* Chat Conversations Modal */}
        <ChatConversationsModal
          isOpen={chatModalOpened}
          onClose={closeChatModal}
          phoneNumber={selectedPhoneForChat}
          studentName={selectedStudentName}
          conversations={conversations}
          loading={conversationsLoading}
          onSelectConversation={handleSelectConversation}
        />
      </div>
    </motion.div>
  );
};

export default MemberSubscriptionTable;