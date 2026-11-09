export const TableSkeleton = () => (
  <div className="p-4">
    <div className="animate-pulse space-y-4">
      {/* Skeleton para la tabla */}
      <div className="space-y-2">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="flex space-x-4">
            <div className="h-6 bg-gray-300 rounded w-1/12"></div>
            <div className="h-6 bg-gray-300 rounded w-2/12"></div>
            <div className="h-6 bg-gray-300 rounded w-3/12"></div>
            <div className="h-6 bg-gray-300 rounded w-4/12"></div>
            <div className="h-6 bg-gray-300 rounded w-2/12"></div> 
            <div className="h-6 bg-gray-300 rounded w-2/12"></div> 
            <div className="h-6 bg-gray-300 rounded w-2/12"></div> 
            <div className="h-6 bg-gray-300 rounded w-2/12"></div> 
            <div className="h-6 bg-gray-300 rounded w-2/12"></div> 
            <div className="h-6 bg-gray-300 rounded w-2/12"></div> 
            
          </div>
        ))}
      </div>
    </div>
  </div>
);