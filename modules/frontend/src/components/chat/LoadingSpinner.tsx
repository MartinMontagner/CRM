interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const LoadingSpinner = ({
  size = "md",
  color = "text-blue-500"
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4"
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizes[size]} border-t-transparent ${color}`}
      aria-label="Cargando..."
    />
  );
};

export default LoadingSpinner;