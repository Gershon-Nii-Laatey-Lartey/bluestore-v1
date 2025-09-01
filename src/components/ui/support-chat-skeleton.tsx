import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const SupportChatSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-lg border animate-pulse"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Avatar skeleton */}
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title and case number skeleton */}
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              
              {/* Last message skeleton */}
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              
              {/* Status and date skeleton */}
              <div className="flex items-center space-x-2">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
