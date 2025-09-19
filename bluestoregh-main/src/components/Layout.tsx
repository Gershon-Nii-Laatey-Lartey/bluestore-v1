
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

// Pages where the floating action button should NOT appear
const EXCLUDED_PAGES = [
  "/chat",
  "/auth",
  "/forgot-password",
  "/admin",
  "/admin/users",
  "/admin/analytics",
  "/admin/settings",
  "/admin/security",
  "/admin/database",
  "/admin/api",
  "/admin/add-worker",
  "/customer-service",
  "/customer-service/resolved",
  "/publish",
  "/package-selection",
  "/kyc",
  "/notifications",
  "/settings",
  "/support",
  "/404"
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if current page should show the FAB
  const shouldShowFAB = isMobile && !EXCLUDED_PAGES.some(page => 
    location.pathname === page || location.pathname.startsWith(page)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        {/* Main Content */}
        <SidebarInset className="flex-1 mb-16 md:mb-0 w-full overflow-x-hidden">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <Header />
          </div>
          
          <main className="pt-4 md:pt-20 px-4 md:px-6 min-h-full w-full">
            <div className="p-0 min-h-full w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileNav />
        </div>

        {/* Floating Action Button - Mobile Only */}
        {shouldShowFAB && (
          <div className="md:hidden fixed bottom-24 right-4 z-50">
            <Button
              size="default"
              className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 border border-blue-600/20 backdrop-blur-sm"
              onClick={() => navigate("/publish")}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};
