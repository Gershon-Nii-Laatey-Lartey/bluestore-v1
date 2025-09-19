
import { useState } from "react";
import { 
  Package, 
  FileCheck, 
  Users, 
  Headphones, 
  MapPin, 
  Tag, 
  Settings, 
  TrendingUp, 
  Shield, 
  Flag,
  MessageSquare,
  FileText,
  Gift,
  History,
  ShoppingBag,
  Bell,
  RefreshCw,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingProducts?: number;
  pendingKyc?: number;
  onRefresh?: () => void;
  onNotificationPermission?: () => void;
  notificationPermission?: NotificationPermission;
}

const menuGroups = [
  {
    title: "Content Management",
    items: [
      {
        id: "products",
        label: "Products",
        icon: Package,
      },
      {
        id: "product-catalog",
        label: "Product Catalog",
        icon: ShoppingBag
      },
      {
        id: "kyc",
        label: "KYC",
        icon: FileCheck,
      }
    ]
  },
  {
    title: "User Management",
    items: [
      {
        id: "users",
        label: "Users",
        icon: Users
      },
      {
        id: "cs-workers",
        label: "CS Workers",
        icon: Headphones
      }
    ]
  },
  {
    title: "Support & Reports",
    items: [
      {
        id: "reports",
        label: "Reports",
        icon: Flag
      },
      {
        id: "support-chats",
        label: "Support Chats",
        icon: MessageSquare
      },
      {
        id: "transferred-cases",
        label: "Transferred Cases",
        icon: Shield
      },
      {
        id: "case-updates",
        label: "Case Updates",
        icon: FileText
      }
    ]
  },
  {
    title: "Platform Settings",
    items: [
      {
        id: "locations",
        label: "Locations",
        icon: MapPin
      },
      {
        id: "categories",
        label: "Categories",
        icon: Tag
      },
      {
        id: "packages",
        label: "Packages",
        icon: TrendingUp
      },
      {
        id: "terms",
        label: "Terms",
        icon: Settings
      },
      {
        id: "audit-log",
        label: "Audit Log",
        icon: History
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: TrendingUp
      },
      {
        id: "promo-codes",
        label: "Promo Codes",
        icon: Gift
      }
    ]
  }
];

export const AdminSidebar = ({ 
  activeTab, 
  onTabChange, 
  pendingProducts = 0, 
  pendingKyc = 0,
  onRefresh,
  onNotificationPermission,
  notificationPermission = 'default'
}: AdminSidebarProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  if (isMobile) {
    return null; // Mobile uses different layout
  }

  return (
    <Sidebar 
      className={cn(
        "border-r bg-white border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent className="px-0 py-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0"
            >
              {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {notificationPermission !== 'granted' && onNotificationPermission && (
                <Button 
                  onClick={onNotificationPermission} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              )}
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        )}

        <SidebarGroup className="h-full">
          <SidebarGroupContent className="h-full">
            <SidebarMenu className="space-y-1 h-full py-4 px-4">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  {!collapsed && (
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {group.title}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeTab === item.id;
                      const badge = item.id === 'products' ? pendingProducts : 
                                   item.id === 'kyc' ? pendingKyc : undefined;
                      
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton 
                            onClick={() => onTabChange(item.id)}
                            isActive={isActive}
                            className={cn(
                              "flex items-center h-10 px-3 space-x-3 transition-colors rounded-lg w-full",
                              isActive 
                                ? "bg-blue-50 text-blue-600 border border-blue-200" 
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <IconComponent className="h-4 w-4 shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="text-sm font-medium truncate">
                                  {item.label}
                                </span>
                                {badge && badge > 0 && (
                                  <Badge variant="destructive" className="ml-auto text-xs">
                                    {badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4 bg-gray-50">
        <div className="text-center">
          {!collapsed && (
            <>
              <p className="text-sm font-medium text-gray-900">Admin Panel</p>
              <p className="text-xs text-gray-500">BlueStore Management</p>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
