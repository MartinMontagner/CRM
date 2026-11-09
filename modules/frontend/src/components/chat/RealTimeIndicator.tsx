// src/components/chat/RealTimeIndicator.tsx
import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { useRefreshChatStore } from '@/state/chat/RefreshChatStore';

interface RealTimeIndicatorProps {
  className?: string;
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ className = '' }) => {
  const { isConnected } = useWebSocket();
  const { isRealTimeEnabled } = useRefreshChatStore();

  const getStatusColor = () => {
    if (isConnected && isRealTimeEnabled) return 'bg-green-500';
    if (isConnected && !isRealTimeEnabled) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isConnected && isRealTimeEnabled) return 'Tiempo real activo';
    if (isConnected && !isRealTimeEnabled) return 'Conectado (tiempo real pausado)';
    return 'Desconectado';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div 
          className={`w-2 h-2 rounded-full ${getStatusColor()} ${
            isConnected && isRealTimeEnabled ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-xs text-gray-600">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default RealTimeIndicator;