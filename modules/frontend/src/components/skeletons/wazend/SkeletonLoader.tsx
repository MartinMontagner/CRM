interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  className?: string;
}

export const SkeletonLoader= ({
  count = 1,
  height = "h-16",
  className = "",
} : SkeletonLoaderProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded-md bg-slate-200 ${height} ${className} mb-3`}
        />
      ))}
    </>
  );
};
