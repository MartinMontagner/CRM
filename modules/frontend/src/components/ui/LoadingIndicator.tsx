import React from "react";

interface LoadingIndicatorProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "medium",
  className = "",
}) => {
  const sizeMap = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-16 w-16",
  };

  return (
    <div className={`flex justify-center p-4 ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeMap[size]}`}
      ></div>
    </div>
  );
};