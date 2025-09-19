
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Bell, Menu, X, Shield } from "lucide-react";
import { adminService, AdminStats } from "@/services/adminService";
import { ProductReviewTab } from "@/components/admin/ProductReviewTab";
import { UserManagement } from "@/components/admin/UserManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { useIsMobile } from "@/hooks/use-mobile";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for user activities.",
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable notifications later in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive"
      });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const adminStats = await adminService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductReviewTab onRefresh={loadData} />;
      case "users":
        return <UserManagement onRefresh={loadData} />;
      case "categories":
        return <CategoryManagement onRefresh={loadData} />;
      case "locations":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Location Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Location management coming soon...</p>
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.totalProducts.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Products</div>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalCategories}</div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.verifiedUsers.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Verified Users</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab("products")}
                  >
                    <span className="text-sm font-medium">Manage Products</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab("users")}
                  >
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab("categories")}
                  >
                    <span className="text-sm font-medium">Manage Categories</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <span className="text-sm font-medium">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {notificationPermission !== 'granted' && (
              <Button 
                onClick={requestNotificationPermission} 
                variant="ghost" 
                size="sm"
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={loadData} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main content with top padding */}
        <div className="pt-16">
          {/* Mobile Sidebar */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
              <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Admin Menu</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                  <div className="p-4 space-y-2">
                    {[
                      { id: "products", label: "Products", icon: "📦" },
                      { id: "users", label: "Users", icon: "👥" },
                      { id: "categories", label: "Categories", icon: "🏷️" },
                      { id: "locations", label: "Locations", icon: "📍" },
                      { id: "analytics", label: "Analytics", icon: "📊" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Content */}
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <AdminLayout>
      <div className="flex h-full">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={loadData}
          onNotificationPermission={requestNotificationPermission}
          notificationPermission={notificationPermission}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 mt-1">Manage products, users, and platform settings</p>
                </div>
                <div className="flex items-center space-x-2">
                  {notificationPermission !== 'granted' && (
                    <Button 
                      onClick={requestNotificationPermission} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Button>
                  )}
                  <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
