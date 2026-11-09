/*import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RefreshChatStore {
  // Estado del refresh
  isRefetching: boolean;
  refetch: (() => Promise<void>) | null;
  
  // Configuración del refresh automático
  isAutoRefreshEnabled: boolean;
  autoRefreshInterval: number; // en segundos
  intervalId: NodeJS.Timeout | null;
  
  // Acciones
  setRefetchFunction: (refetchFn: () => Promise<void>) => void;
  executeRefresh: () => Promise<void>;
  
  // Configuración del auto-refresh
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setAutoRefreshInterval: (seconds: number) => void;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  
  // Cleanup
  cleanup: () => void;
}

export const useRefreshChatStore = create<RefreshChatStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isRefetching: false,
      refetch: null,
      isAutoRefreshEnabled: false,
      autoRefreshInterval: 30, // 30 segundos por defecto
      intervalId: null,
      
      // Establecer la función de refetch (se llamará desde el componente padre)
      setRefetchFunction: (refetchFn: () => Promise<void>) => {
        const currentState = get();
        set({ refetch: refetchFn });
        
        // ✅ Aplicar configuración existente cuando se conecta a la página de chats
        console.log('🔗 Conectando función de refetch. Estado actual:', {
          isAutoRefreshEnabled: currentState.isAutoRefreshEnabled,
          autoRefreshInterval: currentState.autoRefreshInterval
        });
        
        // Si el auto-refresh está habilitado, iniciarlo con la configuración guardada
        if (currentState.isAutoRefreshEnabled) {
          console.log('🚀 Iniciando auto-refresh con configuración guardada...');
          // Usar timeout para asegurar que el refetch esté configurado
          setTimeout(() => {
            const { startAutoRefresh } = get();
            startAutoRefresh();
          }, 100);
        }
      },
      
      // Ejecutar el refresh manualmente
      executeRefresh: async () => {
        const { refetch, isRefetching } = get();
        
        if (!refetch) {
          console.warn('⚠️ Función de refetch no está configurada');
          return;
        }
        
        if (isRefetching) {
          console.log('⏳ Ya está refrescando, saltando...');
          return;
        }
        
        set({ isRefetching: true });
        console.log('🚀 Iniciando refresh desde store...');
        
        try {
          await refetch();
          console.log('✅ Refresh completado exitosamente desde store');
        } catch (error) {
          console.error('❌ Error al actualizar chats desde store:', error);
        } finally {
          // Pequeño delay para mostrar la animación
          setTimeout(() => {
            set({ isRefetching: false });
            console.log('🏁 Refresh finalizado desde store');
          }, 500);
        }
      },
      
      // Habilitar/deshabilitar auto-refresh
      setAutoRefreshEnabled: (enabled: boolean) => {
        const { startAutoRefresh, stopAutoRefresh } = get();
        
        set({ isAutoRefreshEnabled: enabled });
        
        if (enabled) {
          startAutoRefresh();
        } else {
          stopAutoRefresh();
        }
      },
      
      // Configurar intervalo de auto-refresh
      setAutoRefreshInterval: (seconds: number) => {
        const { isAutoRefreshEnabled, startAutoRefresh } = get();
        
        set({ autoRefreshInterval: seconds });
        
        // Si está habilitado, reiniciar con el nuevo intervalo
        if (isAutoRefreshEnabled) {
          startAutoRefresh();
        }
      },
      
      // Iniciar auto-refresh
      startAutoRefresh: () => {
        const { stopAutoRefresh, executeRefresh, autoRefreshInterval, refetch } = get();
        
        if (!refetch) {
          console.warn('⚠️ No se puede iniciar auto-refresh: función de refetch no configurada');
          return;
        }
        
        // Detener cualquier intervalo existente
        stopAutoRefresh();
        
        console.log(`🔄 Iniciando auto-refresh cada ${autoRefreshInterval} segundos`);
        
        const intervalId = setInterval(() => {
          console.log('⏰ Auto-refresh ejecutándose...');
          executeRefresh();
        }, autoRefreshInterval * 1000);
        
        set({ intervalId });
      },
      
      // Detener auto-refresh
      stopAutoRefresh: () => {
        const { intervalId } = get();
        
        if (intervalId) {
          clearInterval(intervalId);
          set({ intervalId: null });
          console.log('⏹️ Auto-refresh detenido');
        }
      },
      
      // Limpiar recursos
      cleanup: () => {
        const { stopAutoRefresh } = get();
        stopAutoRefresh();
        set({ 
          refetch: null,
          isRefetching: false,
          intervalId: null 
        });
        // ✅ NO limpiar isAutoRefreshEnabled ni autoRefreshInterval para persistir la configuración
      },
    }),
    {
      name: 'refresh-chat-store', // nombre único para el localStorage
      partialize: (state) => ({
        isAutoRefreshEnabled: state.isAutoRefreshEnabled,
        autoRefreshInterval: state.autoRefreshInterval,
      }), // solo persistir la configuración, no el estado del runtime
    }
  )
);*/
// RefreshChatStore.ts - Versión mejorada con WebSockets
import { create } from 'zustand';

interface RefreshChatState {
  // Estado del refresh
  isRefetching: boolean;
  isAutoRefreshEnabled: boolean;
  autoRefreshInterval: number;
  
  // Función de refetch que se configura desde el componente
  refetchFunction: (() => Promise<void>) | null;
  
  // Control de tiempo real
  isRealTimeEnabled: boolean;
  lastUpdate: Date | null;
  
  // Acciones
  setRefetchFunction: (fn: (() => Promise<void>) | null) => void;
  executeRefresh: () => Promise<void>;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setAutoRefreshInterval: (interval: number) => void;
  setRealTimeEnabled: (enabled: boolean) => void;
  updateLastRefresh: () => void;
  cleanup: () => void;
}

export const useRefreshChatStore = create<RefreshChatState>((set, get) => {
  let autoRefreshInterval: NodeJS.Timeout | null = null;

  const startAutoRefresh = () => {
    const state = get();
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    // Solo usar polling si el tiempo real está deshabilitado
    if (!state.isRealTimeEnabled && state.isAutoRefreshEnabled && state.refetchFunction) {
      console.log(`🔄 Iniciando auto-refresh cada ${state.autoRefreshInterval}s (modo polling)`);
      autoRefreshInterval = setInterval(async () => {
        const currentState = get();
        if (currentState.isAutoRefreshEnabled && !currentState.isRefetching && currentState.refetchFunction) {
          await currentState.refetchFunction();
          set({ lastUpdate: new Date() });
        }
      }, state.autoRefreshInterval * 1000);
    }
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
      console.log('⏹️ Auto-refresh detenido');
    }
  };

  return {
    // Estado inicial
    isRefetching: false,
    isAutoRefreshEnabled: false,
    autoRefreshInterval: 30, // 30 segundos por defecto
    refetchFunction: null,
    isRealTimeEnabled: true, // Por defecto habilitamos tiempo real
    lastUpdate: null,

    // Configurar función de refetch
    setRefetchFunction: (fn) => {
      set({ refetchFunction: fn });
      
      // Reiniciar auto-refresh si está habilitado
      if (get().isAutoRefreshEnabled) {
        stopAutoRefresh();
        startAutoRefresh();
      }
    },

    // Ejecutar refresh manual
    executeRefresh: async () => {
      const state = get();
      if (state.isRefetching || !state.refetchFunction) {
        console.log('⚠️ Refresh ya en progreso o función no disponible');
        return;
      }

      set({ isRefetching: true });
      try {
        console.log('🔄 Ejecutando refresh manual...');
        await state.refetchFunction();
        set({ lastUpdate: new Date() });
        console.log('✅ Refresh manual completado');
      } catch (error) {
        console.error('❌ Error en refresh manual:', error);
      } finally {
        set({ isRefetching: false });
      }
    },

    // Habilitar/deshabilitar auto-refresh
    setAutoRefreshEnabled: (enabled) => {
      set({ isAutoRefreshEnabled: enabled });
      
      if (enabled) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
      
      console.log(`🔄 Auto-refresh ${enabled ? 'habilitado' : 'deshabilitado'}`);
    },

    // Cambiar intervalo de auto-refresh
    setAutoRefreshInterval: (interval) => {
      set({ autoRefreshInterval: interval });
      
      // Reiniciar auto-refresh con nuevo intervalo si está habilitado
      if (get().isAutoRefreshEnabled) {
        stopAutoRefresh();
        startAutoRefresh();
      }
    },

    // Habilitar/deshabilitar tiempo real
    setRealTimeEnabled: (enabled) => {
      set({ isRealTimeEnabled: enabled });
      
      if (enabled) {
        // Si habilitamos tiempo real, deshabilitamos polling
        if (get().isAutoRefreshEnabled) {
          stopAutoRefresh();
        }
        console.log('🚀 Modo tiempo real habilitado - polling deshabilitado');
      } else {
        // Si deshabilitamos tiempo real, podemos reactivar polling
        if (get().isAutoRefreshEnabled) {
          startAutoRefresh();
        }
        console.log('⏱️ Modo tiempo real deshabilitado - polling disponible');
      }
    },

    // Actualizar timestamp de último refresh
    updateLastRefresh: () => {
      set({ lastUpdate: new Date() });
    },

    // Limpiar recursos
    cleanup: () => {
      stopAutoRefresh();
      set({ 
        refetchFunction: null,
        isAutoRefreshEnabled: false,
        isRefetching: false 
      });
    }
  };
});