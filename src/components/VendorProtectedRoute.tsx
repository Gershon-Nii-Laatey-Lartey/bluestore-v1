
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { dataService } from "@/services/dataService";

interface VendorProtectedRouteProps {
  children: React.ReactNode;
}

// Cache vendor profile check to prevent reload feeling
let vendorProfileCache: { [userId: string]: { profile: any; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to clear cache for a specific user (useful when vendor profile is created/updated)
export const clearVendorProfileCache = (userId: string) => {
  delete vendorProfileCache[userId];
};

export const VendorProtectedRoute = ({ children }: VendorProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkVendorProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = vendorProfileCache[user.id];
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setVendorProfile(cached.profile);
        setLoading(false);
        return;
      }

      try {
        const profile = await dataService.getVendorProfile();
        setVendorProfile(profile);
        
        // Cache the result
        vendorProfileCache[user.id] = {
          profile,
          timestamp: now
        };
      } catch (error) {
        setVendorProfile(null);
        // Cache null result too
        vendorProfileCache[user.id] = {
          profile: null,
          timestamp: now
        };
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkVendorProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Show loading state while checking auth and vendor profile
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user doesn't have a vendor profile, redirect to vendor required page
  if (!vendorProfile) {
    return <Navigate to="/vendor-required" state={{ from: location }} replace />;
  }

  // If user is authenticated and has a vendor profile, render the protected content
  return <>{children}</>;
};
