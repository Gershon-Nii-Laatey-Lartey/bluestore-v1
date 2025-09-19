
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, FileText, Store } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "My Ads", href: "/my-ads", icon: FileText },
  { name: "My Vendor Profile", href: "/my-vendor-profile", icon: Store },
];

export const UserProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = () => {
    // Add sign out logic here
    console.log("Sign out clicked");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center w-full p-2 h-auto hover:bg-gray-50 rounded-lg",
            isCollapsed ? "justify-center" : "justify-start space-x-3"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">CS</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">Charlie Siphron</p>
              <p className="text-xs text-gray-500 truncate">csiphron@company.com</p>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-64 p-0 border border-gray-200 shadow-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">CS</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Charlie Siphron</p>
              <p className="text-xs text-gray-500">csiphron@company.com</p>
            </div>
          </div>
        </div>
        
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-4 w-4 text-gray-500" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-2.5 w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
