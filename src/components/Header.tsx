
import { MapPin, Bell, User, Heart, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

import { SearchDropdown } from "@/components/SearchDropdown";
import { LocationSelector } from "@/components/LocationSelector";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const { toggleSidebar } = useSidebar();
  const { userLocation, updateLocation } = useUserLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isMobile) {
      loadRecentNotifications();
    }
  }, [user, isMobile]);

  const loadRecentNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user?.id);
      setNotifications(data.slice(0, 5)); // Show only 5 most recent
    } catch (error) {
      // Error loading notifications
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-2">
      <div className="flex items-center justify-between max-w-full mx-auto">
        {/* Logo, Sidebar Toggle and Location */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted/50"
              onClick={toggleSidebar}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <path d="M9 3v18"/>
                <path d="m16 15-3-3 3-3"/>
              </svg>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <Link to="/">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                BlueStore
              </h1>
            </Link>
          </div>
          <div className="relative">
            <LocationSelector 
              currentLocation={userLocation}
              onLocationChange={updateLocation}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <SearchDropdown placeholder="Search products" />
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-1">
          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* Notification Dropdown for Desktop */}
          {!isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                  <Bell className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Recent updates and alerts</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <span className="text-lg">{getTypeIcon(notification.type)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <Badge className="h-2 w-2 bg-blue-600 rounded-full p-0"></Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t bg-gray-50">
                  <Link to="/notifications">
                    <Button variant="ghost" size="sm" className="w-full">
                      See all notifications
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
              <User className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
