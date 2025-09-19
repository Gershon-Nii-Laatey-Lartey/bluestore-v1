import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {children}
      </div>
    </SidebarProvider>
  );
};
