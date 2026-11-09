const ChatListSkeleton = ({ count = 5 }) => {
    return (
      <div className="h-full overflow-y-auto">
        {Array(count)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="p-4 border-b border-gray-200 animate-pulse"
            >
              <div className="flex items-start">
                <div className="relative mr-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mt-2" />
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };
  
  export default ChatListSkeleton;