
import { Search, MapPin, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

export const MobileHeader = () => {
  const location = useLocation();
  
  const getSearchPlaceholder = () => {
    if (location.pathname === '/favorites') {
      return "Search favorites";
    }
    return "Search products";
  };

  const shouldShowSearch = () => {
    return !location.pathname.includes('/chat') && !location.pathname.includes('/profile');
  };

  return (
    <div className="bg-white p-4 space-y-4 w-full">
      {/* Location and Notification */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center text-gray-600 min-w-0 flex-1">
          <MapPin className="h-4 w-4 mr-1 text-blue-600 shrink-0" />
          <span className="text-sm font-medium truncate">Accra, Greater Accra Region</span>
        </div>
        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Bell className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Search Bar - conditionally shown */}
      {shouldShowSearch() && (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={getSearchPlaceholder()}
            className="pl-10 w-full bg-gray-50 border-0"
          />
        </div>
      )}
    </div>
  );
};
