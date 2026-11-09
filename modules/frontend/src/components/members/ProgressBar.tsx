import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total,
  label = "suscripciones cargadas"
}) => {
  if (total <= 0) return null;
  
  const progress = Math.min(100, (current / total) * 100);
  
  return (
    <div className="mb-4 bg-white rounded-md">
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary-600 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium">
          {current} de {total} {label}
        </span>
      </div>
    </div>
  );
};