import NavbarLayout from "@/components/layout/NavbarLayout";
import NoPermissionView from "@/components/user/NoPermissionView";
import { PageHeader } from "@/components/user/PageHeader";
import PendingUsersList from "@/components/user/PendingUsersList";
import { StatusSummary } from "@/components/user/StatusSummary";
import { SyncDataComponent } from "@/components/user/SyncDataComponent";
import UserRoleManagement from "@/components/user/UserRoleManagement";
import { Role } from "@/model/auth/AuthData";
import { syncStudentTags } from "@/service/student/StudentConversationService";
import { useAppStore } from "@/state/store";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiDatabase, FiTag } from "react-icons/fi";
import { SyncConfirmationModal } from "./SyncConfirmationModal";

function EnableUserPage() {
  const [showPageType, setShowPageType] = useState<"pending" | "edit">(
    "pending"
  );
  const [showSyncPage, setShowSyncPage] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const roles = useAppStore((state) => state.authData?.roles);

  const handlePageTypeChange = (type: "pending" | "edit") => {
    setShowPageType(type);
  };

  const handleShowSync = () => {
    if (roles?.includes(Role.SUPER_ADMIN)) {
      setShowSyncPage(true);
    } else {
      alert("No tienes permisos para sincronizar datos.");
    }
  };

  const handleBackFromSync = () => {
    setShowSyncPage(false);
  };

  const handleShowSyncModal = () => {
    setShowSyncModal(true);
  };

  const handleCloseSyncModal = () => {
    if (!isSyncing) {
      setShowSyncModal(false);
    }
  };

  const handleConfirmSync = async () => {
    setIsSyncing(true);
    
    try {
      await syncStudentTags();
      console.log("Etiquetas sincronizadas correctamente.");
    } catch (error) {
      console.error("Error al sincronizar etiquetas:", error);
    } finally {
      setIsSyncing(false);
      setShowSyncModal(false);
    }
  };

   const hasAcces = roles?.includes(Role.ADMIN) || roles?.includes(Role.SUPER_ADMIN);

  return (
    <NavbarLayout>
      <div className="h-screen w-full overflow-y-auto scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thin bg-grey-200">
        <AnimatePresence mode="wait">
          {!showSyncPage ? (
            <motion.div
              key="main-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-5 min-h-screen w-full px-6 pt-5 pb-32 sm:px-10 sm:py-6 xl:px-12"
            >
              <PageHeader
                handlePageTypeChange={handlePageTypeChange}
                showPageType={showPageType}
                hasAcces={hasAcces}
              />
              <StatusSummary />

              {/* Botones de sincronización */}
              {roles?.includes(Role.SUPER_ADMIN) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex justify-end mb-4 gap-1"
                >
                  <button
                    onClick={handleShowSyncModal}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-md ${
                      isSyncing
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FiTag className="w-4 h-4" />
                    Sincronizar Etiquetas
                  </button>
                  <button
                    onClick={handleShowSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-md ${
                      isSyncing
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FiDatabase className="w-4 h-4" />
                    Sincronizar Datos
                  </button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-b-lg overflow-hidden mb-6"
              >
                {hasAcces ? (
                  <div className="rounded-b-lg overflow-hidden mb-6 shadow-md">
                    {showPageType === "pending" ? (
                      <PendingUsersList />
                    ) : (
                      <UserRoleManagement />
                    )}
                  </div>
                ) : (
                  <NoPermissionView />
                )}
              </motion.div>
            </motion.div>
          ) : (
            roles?.includes(Role.ADMIN) && (
              <SyncDataComponent key="sync-page" onBack={handleBackFromSync} />
            )
          )}
        </AnimatePresence>

        {/* Modal de Confirmación */}
        <AnimatePresence>
          <SyncConfirmationModal
            isOpen={showSyncModal}
            onClose={handleCloseSyncModal}
            onConfirm={handleConfirmSync}
            isLoading={isSyncing}
          />
        </AnimatePresence>
      </div>
    </NavbarLayout>
  );
}

export default EnableUserPage;