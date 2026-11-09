import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiRefreshCw,
  FiCheck,
  FiX,
  FiArrowLeft,
  FiDatabase,
  FiMessageSquare,
  FiClock,
  FiCalendar,
  FiActivity,
  FiUpload,
  FiFile,
  FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";
import { syncChats, importChats } from "@/service/sync/SyncChatsService";
import { SyncResultDTO } from "@/model/chats/SyncResultDTO";
import { useMutation } from "react-query";
import { useWazendQuery } from "@/hooks/useWazendQuery";

// Componente de Sincronización e Importación
interface SyncDataComponentProps {
  onBack: () => void; // Función para manejar el regreso a la página anterior
}

type TabType = "sync" | "import";

export const SyncDataComponent = ({ onBack }: SyncDataComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("sync");

  // Estados para sincronización
  const [isSyncConfirming, setIsSyncConfirming] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResultDTO | null>(null);

  // Estados para importación
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instanceId, setInstanceId] = useState<string>("");
  const [isImportConfirming, setIsImportConfirming] = useState(false);
  const [importResult, setImportResult] = useState<SyncResultDTO | null>(null);

  const handleFirstSyncConfirmation = () => {
    setIsSyncConfirming(true);
  };

  const {
    mutate: syncMutation,
    isLoading: isSyncLoading,
    error: syncError,
  } = useMutation({
    mutationFn: () => syncChats(),
    onSuccess: (data: SyncResultDTO) => {
      if (!isSyncConfirming) return;
      setSyncResult(data);
      setIsSyncConfirming(false);
    },
    onError: () => {
      setIsSyncConfirming(false);
    },
  });

  const {
    mutate: importMutation,
    isLoading: isImportLoading,
    error: importError,
  } = useMutation({
    mutationFn: ({ file, instanceId }: { file: File; instanceId: string }) =>
      importChats(file, instanceId),
    onSuccess: (data: SyncResultDTO) => {
      if (!isImportConfirming) return;
      setImportResult(data);
      setIsImportConfirming(false);
    },
    onError: () => {
      setIsImportConfirming(false);
    },
  });

  const handleFinalSync = async () => {
    syncMutation();
  };

  const handleSyncCancel = () => {
    setIsSyncConfirming(false);
  };

  const resetSync = () => {
    setSyncResult(null);
  };

  // Funciones para importación
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else {
      alert("Por favor selecciona un archivo CSV válido");
    }
  };

  const handleFirstImportConfirmation = () => {
    if (!selectedFile || !instanceId.trim()) {
      alert("Por favor selecciona un archivo CSV y una instancia");
      return;
    }
    setIsImportConfirming(true);
  };

  const handleFinalImport = () => {
    if (selectedFile && instanceId.trim()) {
      importMutation({ file: selectedFile, instanceId: instanceId.trim() });
    }
  };

  const handleImportCancel = () => {
    setIsImportConfirming(false);
  };

  const resetImport = () => {
    setImportResult(null);
    setSelectedFile(null);
    setInstanceId("");
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const { getInstancesQuery } = useWazendQuery();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 min-h-screen w-full px-6 pt-5 pb-32 sm:px-10 sm:py-6 xl:px-12"
    >
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Datos de Chats
        </h1>
      </div>

      {/* Pestañas */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setActiveTab("sync")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "sync"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4" />
              Sincronizar
            </div>
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "import"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiUpload className="w-4 h-4" />
              Importar CSV
            </div>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* TAB DE SINCRONIZACIÓN */}
          {activeTab === "sync" && (
            <>
              {/* Estado inicial - Botón de sincronizar */}
              {!isSyncConfirming && !syncResult && !syncError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-8 text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiDatabase className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Sincronizar Datos de Chats
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Esta acción sincronizará todos los chats con sus últimos
                    mensajes y fechas de creación.
                  </p>
                  <button
                    onClick={handleFirstSyncConfirmation}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FiRefreshCw className="w-5 h-5" />
                    Iniciar Sincronización
                  </button>
                </motion.div>
              )}

              {/* Confirmación sincronización */}
              {isSyncConfirming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-amber-200"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiActivity className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    ¿Confirmar Sincronización?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Esta acción sincronizará todos los chats. El proceso puede
                    tomar algunos minutos.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSyncCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleFinalSync}
                      disabled={isSyncLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      {isSyncLoading ? (
                        <>
                          <FiRefreshCw className="w-5 h-5 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          Confirmar
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Resultado exitoso sincronización */}
              {syncResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Sincronización Completada
                  </h2>

                  <div className="space-y-4">
                    {/* Chats con último mensaje */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FiMessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Últimos Mensajes
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {syncResult.sentAtCount} chats sincronizados
                      </p>
                      {syncResult.sentAtIds?.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          IDs: {syncResult.sentAtIds.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Chats creados */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FiCalendar className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800">
                          Fechas de Creación
                        </span>
                      </div>
                      <p className="text-sm text-purple-700">
                        {syncResult.createdAtCount} chats sincronizados
                      </p>
                      {syncResult.createdAtIds?.length > 0 && (
                        <p className="text-xs text-purple-600 mt-1">
                          IDs: {syncResult.createdAtIds.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Fecha actual */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FiClock className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Fecha Actual
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        {syncResult.nowCount} registros actualizados
                      </p>
                      {syncResult.nowIds?.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          IDs: {syncResult.nowIds.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={resetSync}
                    className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Sincronizar Nuevamente
                  </button>
                </motion.div>
              )}

              {/* Error sincronización */}
              {Boolean(syncError) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-red-200"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiX className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Error en la Sincronización
                  </h2>
                  <p className="text-red-600 mb-6">
                    {syncError instanceof Error
                      ? syncError.message
                      : "Ocurrió un error desconocido."}
                  </p>
                  <button
                    onClick={resetSync}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Intentar Nuevamente
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* TAB DE IMPORTACIÓN CSV */}
          {activeTab === "import" && (
            <>
              {/* Estado inicial - Formulario de importación */}
              {!isImportConfirming && !importResult && !importError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiUpload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    Importar Chats desde CSV
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    Selecciona un archivo CSV e instancia para importar los
                    chats.
                  </p>

                  {/* Campo de ID de instancia */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instancia
                    </label>
                    {getInstancesQuery.isLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                        <FiRefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500 text-sm">
                          Cargando instancias...
                        </span>
                      </div>
                    ) : getInstancesQuery.data && getInstancesQuery.data.length > 0 ? (
                      <div className="relative">
                        <select
                          value={instanceId}
                          onChange={(e) => setInstanceId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
                        >
                          <option value="">Selecciona una instancia</option>
                          {getInstancesQuery.data.map((instance) => (
                            <option key={instance.id} value={instance.instance}>
                              {instance.name} ({instance.instance})
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm text-center">
                        No hay instancias disponibles. Crea una instancia
                        primero.
                      </div>
                    )}
                  </div>

                  {/* Selector de archivo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo CSV
                    </label>
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                          Haz clic para
                          seleccionar
                        </p>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label
                          htmlFor="csv-upload"
                          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          <FiUpload className="w-4 h-4" />
                          Seleccionar archivo
                        </label>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FiFile className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleFirstImportConfirmation}
                    disabled={
                      !selectedFile || !instanceId.trim() || getInstancesQuery.isLoading
                    }
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FiUpload className="w-5 h-5" />
                    Iniciar Importación
                  </button>
                </motion.div>
              )}

              {/* Confirmación importación */}
              {isImportConfirming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-amber-200"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiAlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    ¿Confirmar Importación?
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Archivo:</strong> {selectedFile?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Instancia:</strong>{" "}
                      {getInstancesQuery.data?.find((inst) => inst.instance === instanceId)
                        ?.name || instanceId}{" "}
                      ({instanceId})
                    </p>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Esta acción importará todos los chats desde el archivo CSV.
                    El proceso puede tomar algunos minutos.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleImportCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleFinalImport}
                      disabled={isImportLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      {isImportLoading ? (
                        <>
                          <FiUpload className="w-5 h-5 animate-pulse" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          Confirmar
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Resultado exitoso importación */}
              {importResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Cola de importación enviada, se procesará en segundo plano
                  </h2>

                  <button
                    onClick={resetImport}
                    className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Importar Nuevamente
                  </button>
                </motion.div>
              )}

              {/* Error importación */}
              {Boolean(importError) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-red-200"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiX className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Error en la Importación
                  </h2>
                  <p className="text-red-600 mb-6">
                    {importError instanceof Error
                      ? importError.message
                      : "Ocurrió un error desconocido."}
                  </p>
                  <button
                    onClick={resetImport}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Intentar Nuevamente
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
