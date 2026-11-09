export const UserCardSkeleton = () => (
  <div className="p-6 rounded-xl shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="h-6 w-56 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-lg p-1 flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="ml-2 pr-2 flex-1">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
);
