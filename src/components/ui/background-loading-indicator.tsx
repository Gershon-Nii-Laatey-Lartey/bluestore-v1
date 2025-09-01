import { Loader2 } from "lucide-react";

interface BackgroundLoadingIndicatorProps {
  isFetching: boolean;
  className?: string;
}

export const BackgroundLoadingIndicator = ({ 
  isFetching, 
  className = "" 
}: BackgroundLoadingIndicatorProps) => {
  if (!isFetching) return null;

  return (
    <div className={`flex items-center justify-center py-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span>Updating...</span>
    </div>
  );
};
