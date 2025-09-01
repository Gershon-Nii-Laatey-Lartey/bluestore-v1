
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, FileText, Store, Shield, Package, MessageCircle, BarChart3, Settings, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { dataService } from "@/services/dataService";
import { paymentService } from "@/services/paymentService";



export const UserProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePackage, setActivePackage] = useState<any>(null);

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, profile, signOut } = useAuth();

  const menuItems = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "My Chats", href: "/chat", icon: MessageCircle },
    { name: "My Ads", href: "/my-ads", icon: FileText },
    { name: "My Vendor Profile", href: `/vendor/${user?.id}`, icon: Store },
    { name: "Active Packages", href: "/active-packages", icon: Package },
  ];

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        try {
          const [adminStatus, userPackage] = await Promise.all([
            dataService.isAdmin(),
            paymentService.getUserActivePackage(user.id)
          ]);
          
          setIsAdmin(adminStatus);
          setActivePackage(userPackage);
          

        } catch (error) {
          setIsAdmin(false);
          setActivePackage(null);
        }
      }
    };

    checkUserStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center w-full p-2 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg",
            isCollapsed ? "justify-center" : "justify-start space-x-3"
          )}
          onClick={() => setAuthDialogOpen(true)}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm font-medium">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sign In</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Access your account</p>
            </div>
          )}
        </Button>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }

  const displayName = profile?.full_name || user.email || "User";
  const initials = profile?.full_name ? getInitials(profile.full_name) : (user.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center w-full p-2 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg",
            isCollapsed ? "justify-center" : "justify-start space-x-3"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} />
            <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-64 p-0 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="py-2 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <item.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{item.name}</span>
            </Link>
          ))}
          {/* Admin Link - Only visible to admins */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {/* Analytics - Available to all users */}
          <Link
            to="/analytics"
            onClick={() => setOpen(false)}
            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <div className="flex items-center space-x-2">
              <span>Analytics</span>
              <Sparkles className="h-3 w-3 text-blue-500" />
            </div>
          </Link>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-2.5 w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 rounded-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
