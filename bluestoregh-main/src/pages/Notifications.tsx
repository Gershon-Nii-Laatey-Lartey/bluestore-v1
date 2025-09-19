
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your latest notifications</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No new notifications</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
