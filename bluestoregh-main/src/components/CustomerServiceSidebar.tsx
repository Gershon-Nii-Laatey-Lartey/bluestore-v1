
import { Link, useLocation } from "react-router-dom";
import { Shield, MessageSquare, Users, FileText, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";

const csNavItems = [
  {
    name: "Dashboard",
    href: "/customer-service",
    icon: MessageSquare
  },
  {
    name: "KYC Verification",
    href: "/customer-service?tab=kyc",
    icon: Shield
  },
  {
    name: "Ad Review",
    href: "/customer-service?tab=ads",
    icon: FileText
  },
  {
    name: "Support Tickets",
    href: "/customer-service?tab=support",
    icon: Clock
  },
  {
    name: "User Management",
    href: "/customer-service?tab=users",
    icon: Users
  },
  {
    name: "Resolved Cases",
    href: "/customer-service/resolved",
    icon: CheckCircle
  }
];

export const CustomerServiceSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar className="border-r bg-white border-gray-200">
      <SidebarContent className="px-0 py-0 mt-[80px] h-[calc(100vh-80px)]">
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="h-full">
            <SidebarMenu className="space-y-2 h-full py-4 px-4">
              {csNavItems.map(item => {
                const isActive = location.pathname + location.search === item.href || location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      className={cn(
                        "flex items-center h-12 px-4 space-x-3 transition-colors rounded-lg",
                        isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 mr-2" : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Link 
                        to={item.href} 
                        className="flex items-center w-full space-x-3"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 bg-blue-50">
        <div className="text-center">
          <p className="text-sm font-medium text-blue-900">Customer Service</p>
          <p className="text-xs text-blue-600">Support Center</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
