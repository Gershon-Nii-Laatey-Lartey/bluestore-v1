
import { MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

import { SearchDropdown } from "@/components/SearchDropdown";
import { LocationSelector } from "@/components/LocationSelector";
import { useUserLocation } from "@/hooks/useUserLocation";

export const MobileHeader = () => {
  const location = useLocation();
  const { userLocation, updateLocation } = useUserLocation();
  
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
    <div className="bg-background p-4 space-y-4 w-full py-[8px] my-[5px] px-0">
      {/* Location and Notification */}
      <div className="flex items-center justify-between w-full">
        <div className="relative min-w-0 flex-1">
          <LocationSelector 
            currentLocation={userLocation}
            onLocationChange={updateLocation}
            className="justify-start p-0 h-auto text-left"
          />
        </div>
        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Bell className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Search Bar - conditionally shown */}
      {shouldShowSearch() && (
        <div className="w-full">
          <SearchDropdown 
            placeholder={getSearchPlaceholder()} 
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
