
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminSecurity from "./pages/AdminSecurity";
import AdminDatabase from "./pages/AdminDatabase";
import AdminAPI from "./pages/AdminAPI";
import AddWorker from "./pages/AddWorker";
import CustomerService from "./pages/CustomerService";
import CSResolved from "./pages/CSResolved";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import PublishAd from "./pages/PublishAd";
import NotFound from "./pages/NotFound";
import MyAds from "./pages/MyAds";
import MyVendorProfile from "./pages/MyVendorProfile";
import CreateVendorProfile from "./pages/CreateVendorProfile";
import KYC from "./pages/KYC";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Wallet from "./pages/Wallet";
import PackageSelection from "./pages/PackageSelection";
import ClearanceSales from "./pages/ClearanceSales";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/security" element={
              <ProtectedRoute>
                <AdminSecurity />
              </ProtectedRoute>
            } />
            <Route path="/admin/database" element={
              <ProtectedRoute>
                <AdminDatabase />
              </ProtectedRoute>
            } />
            <Route path="/admin/api" element={
              <ProtectedRoute>
                <AdminAPI />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-worker" element={
              <ProtectedRoute>
                <AddWorker />
              </ProtectedRoute>
            } />
            <Route path="/customer-service" element={
              <ProtectedRoute>
                <CustomerService />
              </ProtectedRoute>
            } />
            <Route path="/customer-service/resolved" element={
              <ProtectedRoute>
                <CSResolved />
              </ProtectedRoute>
            } />
            <Route path="/clearance-sales" element={<ClearanceSales />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/publish" element={
              <ProtectedRoute>
                <PublishAd />
              </ProtectedRoute>
            } />
            <Route path="/package-selection" element={
              <ProtectedRoute>
                <PackageSelection />
              </ProtectedRoute>
            } />
            <Route path="/my-ads" element={
              <ProtectedRoute>
                <MyAds />
              </ProtectedRoute>
            } />
            <Route path="/my-vendor-profile" element={
              <ProtectedRoute>
                <MyVendorProfile />
              </ProtectedRoute>
            } />
            <Route path="/create-vendor-profile" element={
              <ProtectedRoute>
                <CreateVendorProfile />
              </ProtectedRoute>
            } />
            <Route path="/kyc" element={
              <ProtectedRoute>
                <KYC />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/support" element={<Support />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
