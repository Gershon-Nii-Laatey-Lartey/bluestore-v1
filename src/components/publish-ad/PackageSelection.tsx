
import { useState, useEffect } from "react";
import { AdPackage } from "@/types/adPackage";
import { PackageCard } from "./PackageCard";
import { PackageInformation } from "./PackageInformation";
import { PackageReview } from "./PackageReview";
import { packageService } from "@/services/packageService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PackageSelectionProps {
  selectedPackage: string;
  onSelectPackage: (packageId: string) => void;
  onPublishNow: (packageId: string) => void;
  userActiveAds?: number;
  freeAdsCount?: number;
  hasActiveSubscription?: boolean;
}

export const PackageSelection = ({ 
  selectedPackage, 
  onSelectPackage,
  onPublishNow,
  userActiveAds = 0,
  freeAdsCount = 0,
  hasActiveSubscription = false
}: PackageSelectionProps) => {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("one-time");
  const [showReview, setShowReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
    // Preload Paystack script to reduce wait in the review screen
    if (!document.querySelector('script[src*="paystack"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToReview = () => {
    setShowReview(true);
  };

  const handleBackToSelection = () => {
    setShowReview(false);
  };

  const handlePaymentSuccess = () => {
    onPublishNow(selectedPackage);
  };

  // Categorize packages based on their plan_type from database
  const categorizePackages = (packages: AdPackage[]) => {
    const oneTimePackages: AdPackage[] = [];
    const subscriptionPackages: AdPackage[] = [];

    packages.forEach(pkg => {
      // Use plan_type field from database to categorize packages
      if (pkg.plan_type === 'subscription') {
        subscriptionPackages.push(pkg);
      } else {
        oneTimePackages.push(pkg);
      }
    });

    return { oneTimePackages, subscriptionPackages };
  };

  const { oneTimePackages, subscriptionPackages } = categorizePackages(packages);
  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
  const isFreePackage = selectedPkg?.price === 0;
  const isFreeLimitReached = isFreePackage && freeAdsCount >= (selectedPkg?.adsAllowed || 0);

  // Auto-select first package when switching tabs
  useEffect(() => {
    const currentTabPackages = activeTab === "one-time" ? oneTimePackages : subscriptionPackages;
    if (currentTabPackages.length > 0 && !currentTabPackages.find(pkg => pkg.id === selectedPackage)) {
      onSelectPackage(currentTabPackages[0].id);
    }
  }, [activeTab, oneTimePackages, subscriptionPackages, selectedPackage, onSelectPackage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show review component if user has selected a package and clicked continue
  if (showReview && selectedPkg) {
    return (
      <PackageReview
        selectedPackage={selectedPkg}
        onBack={handleBackToSelection}
        onPaymentSuccess={handlePaymentSuccess}
        userActiveAds={userActiveAds}
        freeAdsCount={freeAdsCount}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="one-time" className="flex items-center gap-2">
            <span>One-Time Plans</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {oneTimePackages.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <span>Monthly Subscriptions</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {subscriptionPackages.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="one-time" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimePackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={selectedPackage === pkg.id}
                onSelectPackage={onSelectPackage}
                freeAdsCount={freeAdsCount}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={selectedPackage === pkg.id}
                onSelectPackage={onSelectPackage}
                freeAdsCount={freeAdsCount}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Continue Button - only show when a package is selected */}
      {selectedPkg && (
        <div className="space-y-4">
          <Button
            onClick={handleContinueToReview}
            className="w-full"
            size="lg"
            disabled={isFreeLimitReached}
          >
            {isFreeLimitReached ? (
              'Free Limit Reached'
            ) : (
              <>
                Continue with {selectedPkg.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          
          {isFreeLimitReached && (
            <p className="text-sm text-muted-foreground text-center">
              You've reached the limit for free ads. Please select a paid package.
            </p>
          )}
        </div>
      )}

      {/* Info banners removed per feedback */}
    </div>
  );
};
