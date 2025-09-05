import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Bell, Menu, X, ArrowLeft } from "lucide-react";
import { dataService, ProductSubmission, KYCSubmission } from "@/services/dataService";
import { notificationService } from "@/services/notificationService";
import { ProductReviewTab } from "@/components/admin/ProductReviewTab";
import { PackageStatsCard } from "@/components/admin/PackageStatsCard";
import { KYCVerificationTab } from "@/components/admin/KYCVerificationTab";
import { PaymentAnalytics } from "@/components/admin/PaymentAnalytics";
import { UserManagement } from "@/components/admin/UserManagement";
import { KYCHistory } from "@/components/admin/KYCHistory";
import LocationManagement from "@/components/admin/LocationManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import { PackageManagement } from "@/components/admin/PackageManagement";
import { CSWorkerManagement } from "@/components/admin/CSWorkerManagement";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ReportsManagement } from "@/components/admin/ReportsManagement";
import { SupportChatsManagement } from "@/components/admin/SupportChatsManagement";
import { TransferredCasesManagement } from "@/components/admin/TransferredCasesManagement";
import { CaseUpdatesManagement } from "@/components/admin/CaseUpdatesManagement";
import { TermsManagement } from "@/components/admin/TermsManagement";
import { SupportChat } from "@/components/admin/SupportChat";
import { PromoCodeManagement } from "@/components/admin/PromoCodeManagement";
import { ProductCatalogTab } from "@/components/admin/ProductCatalogTab";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ShoppingBag
} from "lucide-react";
import { AuditLog } from "@/components/admin/AuditLog";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [pendingSubmissions, setPendingSubmissions] = useState<ProductSubmission[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<ProductSubmission[]>([]);
  const [rejectedProducts, setRejectedProducts] = useState<ProductSubmission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [pendingKyc, setPendingKyc] = useState<KYCSubmission[]>([]);
  const [approvedKyc, setApprovedKyc] = useState<KYCSubmission[]>([]);
  const [rejectedKyc, setRejectedKyc] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const { collapsed } = useAdminSidebar();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
    // Seed default packages if needed
    seedDefaultPackagesIfEmpty();
    // Check notification permission
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      
      if (granted) {
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

  const seedDefaultPackagesIfEmpty = async () => {
    try {
      const { seedDefaultPackages } = await import('@/services/seedPackages');
      await seedDefaultPackages();
    } catch (error) {
      console.error('Error seeding packages:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin data...');
      
      const [submissions, kycSubmissions] = await Promise.all([
        dataService.getProductSubmissions(),
        dataService.getAllKYCSubmissions()
      ]);

      console.log('Loaded submissions:', submissions.length);
      console.log('Loaded KYC submissions:', kycSubmissions.length);

      const pending = submissions.filter(s => s.status === 'pending');
      const approved = submissions.filter(s => s.status === 'approved');
      const rejected = submissions.filter(s => s.status === 'rejected');

      setPendingSubmissions(pending);
      setApprovedProducts(approved);
      setRejectedProducts(rejected);
      setTotalSubmissions(submissions.length);

      const pendingKycList = kycSubmissions.filter(k => k.status === 'pending');
      const approvedKycList = kycSubmissions.filter(k => k.status === 'approved');
      const rejectedKycList = kycSubmissions.filter(k => k.status === 'rejected');

      setPendingKyc(pendingKycList);
      setApprovedKyc(approvedKycList);
      setRejectedKyc(rejectedKycList);

      console.log('Admin data loaded successfully');
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

  const handleApproval = async (submissionId: string, approved: boolean, rejectionReason?: string, suggestions?: string) => {
    try {
      if (approved) {
        await dataService.approveProductSubmission(submissionId, suggestions);
        toast({
          title: "Product Approved",
          description: suggestions ? "Product approved with suggestions sent to vendor." : "Product has been approved successfully."
        });
      } else {
        await dataService.rejectProductSubmission(submissionId, rejectionReason || "");
        toast({
          title: "Product Rejected",
          description: "Product has been rejected with feedback sent to vendor.",
          variant: "destructive"
        });
      }
      
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const handleKycApproval = async (kycId: string, approved: boolean, rejectionReason?: string) => {
    try {
      if (approved) {
        await dataService.approveKYCSubmission(kycId);
        toast({
          title: "KYC Approved",
          description: "KYC has been approved successfully."
        });
      } else {
        await dataService.rejectKYCSubmission(kycId, rejectionReason || "");
        toast({
          title: "KYC Rejected",
          description: "KYC has been rejected."
        });
      }
      
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Error",
        description: "Failed to update KYC status",
        variant: "destructive"
      });
    }
  };

  const menuGroups = [
    {
      title: "Content Management",
      items: [
        {
          id: "products",
          label: "Products",
          icon: Package,
          badge: pendingSubmissions.length > 0 ? pendingSubmissions.length : undefined
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
          badge: pendingKyc.length > 0 ? pendingKyc.length : undefined
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

  const getTabLabel = (tabId: string) => {
    for (const group of menuGroups) {
      const item = group.items.find(item => item.id === tabId);
      if (item) return item.label;
    }
    return tabId;
  };

  const getTabIcon = (tabId: string) => {
    for (const group of menuGroups) {
      const item = group.items.find(item => item.id === tabId);
      if (item) return item.icon;
    }
    return Settings;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-fade-in space-y-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <ProductReviewTab
            pendingSubmissions={pendingSubmissions}
            approvedProducts={approvedProducts}
            rejectedProducts={rejectedProducts}
            totalSubmissions={totalSubmissions}
            onApproval={handleApproval}
          />
        );
      case "kyc":
        return (
          <div className="space-y-6">
            <KYCVerificationTab
              pendingKyc={pendingKyc}
              approvedKyc={approvedKyc}
              rejectedKyc={rejectedKyc}
              onApproval={handleKycApproval}
            />
            <KYCHistory 
              approvedKyc={approvedKyc}
              rejectedKyc={rejectedKyc}
            />
          </div>
        );
      case "users":
        return <UserManagement />;
      case "cs-workers":
        return <CSWorkerManagement />;
      case "reports":
        return <ReportsManagement />;
      case "support-chats":
        return <SupportChat />;
      case "transferred-cases":
        return <TransferredCasesManagement />;
      case "case-updates":
        return <CaseUpdatesManagement />;
      case "locations":
        return <LocationManagement />;
      case "categories":
        return <CategoryManagement />;
      case "packages":
        return <PackageManagement />;
      case "terms":
        return <TermsManagement />;
      case "audit-log":
        return <AuditLog />;
      case "analytics":
        return <PaymentAnalytics />;
      case "product-catalog":
        return <ProductCatalogTab />;

      case "promo-codes":
        return <PromoCodeManagement />;
      default:
        return null;
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
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

        <div className="flex">
          {/* Mobile Sidebar */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
              <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Admin Menu</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                  {menuGroups.map((group) => (
                    <div key={group.title} className="p-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                        {group.title}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setShowMobileMenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === item.id
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <IconComponent className="h-4 w-4" />
                                <span className="text-sm font-medium">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge variant="destructive" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Content */}
          <div className="flex-1 w-full">
            {/* Current Tab Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center space-x-3">
                {(() => {
                  const IconComponent = getTabIcon(activeTab);
                  return <IconComponent className="h-5 w-5 text-blue-600" />;
                })()}
                <h2 className="text-lg font-semibold text-gray-900">{getTabLabel(activeTab)}</h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
              {/* Package Stats for Pending Submissions */}
              {pendingSubmissions.length > 0 && activeTab === "products" && (
                <div className="mb-6">
                  <PackageStatsCard pendingSubmissions={pendingSubmissions} />
                </div>
              )}

              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <AdminLayout>
      <div className="animate-fade-in flex h-full">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingSubmissions={pendingSubmissions.length}
          pendingKyc={pendingKyc.length}
        />
        
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="p-6">
            <div className="bg-white rounded-lg border p-6 mb-6">
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

            {/* Package Stats for Pending Submissions */}
            {pendingSubmissions.length > 0 && activeTab === "products" && (
              <div className="mb-6">
                <PackageStatsCard pendingSubmissions={pendingSubmissions} />
              </div>
            )}

            {renderTabContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
