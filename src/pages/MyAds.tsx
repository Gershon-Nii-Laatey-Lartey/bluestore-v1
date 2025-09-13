import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ShareModal } from "@/components/ShareModal";
import { EditProductForm } from "@/components/EditProductForm";
import { ProductGrid } from "@/components/ProductGrid";
import { ExpiryDate } from "@/components/product/ExpiryDate";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Share, Edit, Trash2, Archive, AlertTriangle, RotateCcw, Lightbulb, TrendingUp, Zap, MoreVertical, Star, Plus, Package, CheckCircle, Clock, List, CreditCard, Gift } from "lucide-react";
import { productService } from "@/services/productService";
import { packageService } from "@/services/packageService";
import { dataService } from "@/services/dataService";
import { ProductSubmission } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { paymentService } from "@/services/paymentService";

declare global {
  interface Window {
    PaystackPop: any;
  }
}
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMyAds } from "@/hooks/useMyAds";
import { BackgroundLoadingIndicator } from "@/components/ui/background-loading-indicator";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { formatPrice } from "@/utils/formatters";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyAds = () => {
  const [viewingAd, setViewingAd] = useState<ProductSubmission | null>(null);
  const [editingAd, setEditingAd] = useState<ProductSubmission | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAdForShare, setSelectedAdForShare] = useState<ProductSubmission | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [reactivationModalOpen, setReactivationModalOpen] = useState(false);
  const [selectedProductForReactivation, setSelectedProductForReactivation] = useState<ProductSubmission | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("one-time");
  const [isProcessingPayment, setProcessingPayment] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { myAds: products, isLoading: loading, isFetching, refetch } = useMyAds();

  // Load Paystack script
  useEffect(() => {
    if (!document.querySelector('script[src*="paystack"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded successfully');
        setPaystackLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        toast({
          title: "Script Load Error",
          description: "Failed to load payment system. Please refresh and try again.",
          variant: "destructive"
        });
      };
      document.body.appendChild(script);
    } else {
      setPaystackLoaded(true);
    }

  }, []);

  const loadMyProducts = async () => {
    refetch();
  };

  const handleCloseAd = async (productId: string) => {
    try {
      await productService.updateProductSubmission(productId, { status: 'closed' });
      toast({
        title: "Success",
        description: "Ad has been closed successfully",
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error closing ad:', error);
      toast({
        title: "Error",
        description: "Failed to close ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleReactivateAd = async (productId: string) => {
    try {
      await productService.reactivateProductSubmission(productId);
      toast({
        title: "Success",
        description: "Ad has been reactivated successfully",
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error reactivating ad:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleOpenReactivationModal = async (product: ProductSubmission) => {
    setSelectedProductForReactivation(product);
    setLoadingPackages(true);
    setShowCheckout(false);
    setActiveTab("one-time");
    try {
      const availablePackages = await packageService.getPackages();
      console.log('🔍 Loaded packages for reactivation:', availablePackages);
      setPackages(availablePackages);
      
      // Auto-select first recommended package or first package
      const recommendedPkg = availablePackages.find(pkg => pkg.recommended);
      const firstPkg = availablePackages[0];
      setSelectedPackage(recommendedPkg?.id || firstPkg?.id || '');
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoadingPackages(false);
    }
    setReactivationModalOpen(true);
  };

  const handleReactivateWithPackage = async (packageId: string) => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment",
        variant: "destructive"
      });
      return;
    }

    if (!paystackLoaded) {
      toast({
        title: "Payment System Not Ready",
        description: "Payment system is still loading. Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    if (!window.PaystackPop) {
      toast({
        title: "Payment System Error",
        description: "Payment system not available. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setProcessingPayment(true);

    try {
      const selectedPkg = packages.find(pkg => pkg.id === packageId);
      if (!selectedPkg) {
        throw new Error('Package not found');
      }

      console.log('🔍 Selected package for reactivation:', selectedPkg);
      console.log('🔍 Package price:', selectedPkg.price);
      console.log('🔍 User email:', user.email);

      // Validate required fields
      if (!user.email) {
        throw new Error('User email is required');
      }
      
      if (!selectedPkg.price || selectedPkg.price <= 0) {
        throw new Error('Invalid package price');
      }

      const paymentData = {
        email: user.email,
        amount: Number(selectedPkg.price), // Ensure it's a number
        currency: 'GHS',
        metadata: {
          plan_id: selectedPkg.id,
          plan_name: selectedPkg.name,
          user_id: user.id,
          reactivate_product_id: selectedProductForReactivation?.id,
        }
      };

      console.log('🔍 Payment data being sent:', paymentData);

      const response = await paymentService.initializePayment(paymentData);

      if (!response.status) {
        throw new Error(response.message || 'Failed to initialize payment');
      }

      const handler = window.PaystackPop.setup({
        key: response.data.public_key || 'pk_test_0d4e4b6c6b82e5e72cfe9cf92d6f5e6c5f7a2c3d',
        email: user.email,
        amount: selectedPkg.price * 100, // Paystack expects amount in kobo
        currency: 'GHS',
        ref: response.data.reference,
        callback: function(response: any) {
          console.log('🎉 Paystack callback received:', response);
          if (response.status === 'success') {
            console.log('✅ Payment successful, calling verifyPayment...');
            // Handle successful payment
            paymentService.verifyPayment(response.reference)
              .then(async (verifyResult) => {
                console.log('✅ Payment verification successful:', verifyResult);
                
                if (verifyResult.status === true || verifyResult.status === 'success') {
                  console.log('🔄 Starting ad reactivation process...');
                  // Update the product with the new package and reactivate
                  if (selectedProductForReactivation) {
                    console.log('🗑️ Deleting old ad:', selectedProductForReactivation.id);
                    // Delete the old ad and create a new one with fresh timestamps
                    const oldAd = selectedProductForReactivation;
                    await productService.deleteProductSubmission(oldAd.id);
                    console.log('✅ Old ad deleted successfully');
                    
                    // Create a new ad with the same data but fresh timestamps
                    const newAdData = {
                      ...oldAd,
                      id: undefined, // Let database generate new ID
                      package: { 
                        id: selectedPkg.id, 
                        name: selectedPkg.name, 
                        price: selectedPkg.price 
                      },
                      status: 'approved' as const,
                      created_at: undefined, // Let database set current timestamp
                      updated_at: undefined, // Let database set current timestamp
                      submittedAt: undefined // Reset submission time
                    };
                    
                    console.log('✨ Creating new ad with data:', newAdData);
                    await dataService.createProductSubmission(newAdData);
                    console.log('✅ New ad created successfully');
                    
                    toast({
                      title: "Payment Successful!",
                      description: "Ad has been reactivated successfully!",
                    });
                    console.log('🔄 Refreshing ad list...');
                    loadMyProducts();
                    console.log('✅ Ad reactivation process completed!');
                  } else {
                    console.log('❌ No selected product for reactivation');
                  }
                } else {
                  console.log('❌ Payment verification failed:', verifyResult);
                }
              })
              .catch((verifyError) => {
                console.error('❌ Payment verification failed:', verifyError);
                
                toast({
                  title: "Payment Verification Failed",
                  description: "Please contact support if you were charged.",
                  variant: "destructive"
                });
              })
              .finally(() => {
                setProcessingPayment(false);
              });
          } else {
            toast({
              title: "Payment Failed",
              description: "Payment was not completed. Please try again.",
              variant: "destructive"
            });
            setProcessingPayment(false);
          }
        },
        onClose: function() {
          console.log('Paystack popup closed');
          
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again anytime.",
          });
          setProcessingPayment(false);
        }
      });

      // Close our modal completely to prevent z-index conflicts
      setReactivationModalOpen(false);

      handler.openIframe();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setProcessingPayment(false);
    }
  };

  const handleReactivateWithFree = async (productId: string) => {
    try {
      // Get the current ad data
      const currentAd = products.find(ad => ad.id === productId);
      if (!currentAd) {
        throw new Error('Ad not found');
      }

      // Delete the old ad and create a new one with fresh timestamps
      await productService.deleteProductSubmission(productId);
      
      // Create a new ad with the same data but fresh timestamps
      const newAdData = {
        ...currentAd,
        id: undefined, // Let database generate new ID
        package: { id: 'free', name: 'Free Package', price: 0 },
        status: 'approved' as const,
        created_at: undefined, // Let database set current timestamp
        updated_at: undefined, // Let database set current timestamp
        submittedAt: undefined // Reset submission time
      };
      
      await productService.createProductSubmission(newAdData);
      
      toast({
        title: "Success",
        description: "Ad has been reactivated with free package",
      });
      setReactivationModalOpen(false);
      loadMyProducts();
    } catch (error) {
      console.error('Error reactivating with free package:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Categorize packages based on their plan_type from database
  const categorizePackages = (packages: any[]) => {
    const oneTimePackages: any[] = [];
    const subscriptionPackages: any[] = [];

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(price);
  };


  const handleDeleteAd = async (productId: string) => {
    try {
      await productService.deleteProductSubmission(productId);
      toast({
        title: "Success",
        description: "Ad has been deleted successfully",
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Error",
        description: "Failed to delete ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleBoostAd = async (productId: string, boostLevel: 'boost' | '2x_boost') => {
    try {
      await productService.boostProductSubmission(productId, boostLevel);
      toast({
        title: "Success",
        description: `Ad has been ${boostLevel === 'boost' ? 'boosted' : '2x boosted'} successfully`,
      });
      loadMyProducts();
    } catch (error) {
      console.error('Error boosting ad:', error);
      toast({
        title: "Error",
        description: "Failed to boost ad. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleEditSave = async (updates: Partial<ProductSubmission>) => {
    if (!editingAd) return;
    
    try {
      setEditSubmitting(true);
      await productService.updateProductSubmission(editingAd.id, updates);
      toast({
        title: "Success",
        description: "Ad has been updated successfully",
      });
      setEditingAd(null);
      loadMyProducts();
    } catch (error) {
      console.error('Error updating ad:', error);
      toast({
        title: "Error",
        description: "Failed to update ad. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const handleShare = (product: ProductSubmission) => {
    setSelectedAdForShare(product);
    setShareModalOpen(true);
  };

  const handleEditProduct = (product: ProductSubmission) => {
    setEditingAd(product);
  };

  const getBoostStatus = (product: ProductSubmission) => {
    if (product.boost_level === '2x_boost') {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
          <Zap className="h-3 w-3 mr-1" />
          2x Boost
        </Badge>
      );
    } else if (product.boost_level === 'boost') {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          Boosted
        </Badge>
      );
    }
    return null;
  };

  const MobileSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DesktopSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="animate-fade-in">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Ads</h1>
              <p className="text-gray-600 mt-1">Manage your product listings</p>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              isMobile ? <MobileSkeleton key={index} /> : <DesktopSkeleton key={index} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Show edit form if editing
  if (editingAd) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="animate-fade-in">
          <EditProductForm
            product={editingAd}
            onSave={handleEditSave}
            onCancel={() => setEditingAd(null)}
            isSubmitting={editSubmitting}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Sidebar */}
              <div className="col-span-3">
                <div className="sticky top-24 space-y-6">
          <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Ads</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your product listings</p>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Ads</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{products.length}</p>
                          </div>
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                            <p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'approved').length}</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.status === 'pending').length}</p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        onClick={() => navigate("/publish-ad")} 
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Ad
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                      >
                        {viewMode === 'list' ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Switch to Grid
                          </>
                        ) : (
                          <>
                            <List className="h-4 w-4 mr-2" />
                            Switch to List
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="col-span-9">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {viewMode === 'list' ? 'List View' : 'Grid View'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {products.length} {products.length === 1 ? 'ad' : 'ads'} found
                    </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
                      <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
                      <Eye className="h-4 w-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>
        
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads yet</h3>
                <p className="text-gray-600 mb-4">You haven't published any ads yet. Start by creating your first listing to reach potential buyers!</p>
                <Button onClick={() => navigate("/publish-ad")} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <BackgroundLoadingIndicator isFetching={isFetching} />
            {viewMode === 'grid' ? (
              <ProductGrid 
                products={products} 
                loading={loading}
                showEditButtons={true}
                onEdit={handleEditProduct}
              />
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {isMobile ? (
                      // Mobile Layout - Rectangular cards with dropdown menu
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={getMainImageWithFallback(product.images, product.main_image_index)} 
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`text-2xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                📱
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                                  {product.title}
                                  {product.edited && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                      Edited
                                    </Badge>
                                  )}
                                  {getBoostStatus(product)}
                                </h3>
                                <p className="text-sm text-gray-500 capitalize">{product.category} • {product.condition}</p>
                                <p className="text-lg font-semibold text-green-600 mt-1">{formatPrice(product.price)}</p>
                                {product.negotiable && (
                                  <span className="text-xs text-gray-500">(Negotiable)</span>
                                )}
                              </div>
                              
                              {/* Status Badge and Actions Menu */}
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(product.status)}>
                                  {product.status}
                                </Badge>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48" align="end">
                                    <div className="space-y-1">

                                      {(product.status === 'approved' || product.status === 'closed') && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare(product);
                                          }}
                                        >
                                          <Share className="h-4 w-4 mr-2" />
                                          Share
                                        </Button>
                                      )}

                                      {(product.status === 'approved' || product.status === 'pending' || product.status === 'rejected') && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingAd(product);
                                          }}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </Button>
                                      )}

                                      {product.status === 'approved' && (
                                        <>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start text-orange-600"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleBoostAd(product.id, 'boost');
                                            }}
                                          >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Boost
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start text-purple-600"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleBoostAd(product.id, '2x_boost');
                                            }}
                                          >
                                            <Zap className="h-4 w-4 mr-2" />
                                            2x Boost
                                          </Button>
                                        </>
                                      )}

                                      {product.status === 'approved' && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="w-full justify-start"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Archive className="h-4 w-4 mr-2" />
                                              Close
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Close this ad?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will remove the ad from public view but keep it in your ads list. You can reactivate it later.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleCloseAd(product.id)}>
                                                Close Ad
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}

                                      {product.status === 'closed' && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="w-full justify-start text-green-600"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <RotateCcw className="h-4 w-4 mr-2" />
                                              Reactivate
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Reactivate this ad?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will make your ad visible to the public again and mark it as approved.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleReactivateAd(product.id)}>
                                                Reactivate Ad
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}

                                      {product.status === 'expired' && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="w-full justify-start text-orange-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReactivationModal(product);
                                          }}
                                        >
                                          <RotateCcw className="h-4 w-4 mr-2" />
                                          Reactivate
                                        </Button>
                                      )}

                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start text-red-600"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2">
                                              <AlertTriangle className="h-5 w-5 text-red-500" />
                                              Delete this ad permanently?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently delete your ad and remove all associated data.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => handleDeleteAd(product.id)}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Delete Permanently
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            
                            {/* Additional Info */}
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                              <p><strong>Location:</strong> {product.location}</p>
                              <p><strong>Listed:</strong> {formatDate(product.submittedAt)}</p>
                              <ExpiryDate product={product} />
                            </div>
                            
                            {/* Show rejection reason if present */}
                            {product.status === 'rejected' && product.rejection_reason && (
                              <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                                <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                                <p className="text-xs text-red-700">{product.rejection_reason}</p>
                              </div>
                            )}
                            
                            {/* Show suggestions if present */}
                            {product.suggestions && (
                              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                                <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Admin Suggestions:
                                </p>
                                <p className="text-xs text-yellow-700">{product.suggestions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    ) : (
                      // Desktop Layout - Improved design
                      <div onClick={(e) => e.stopPropagation()}>
                        <>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <span className="truncate">{product.title}</span>
                                {product.edited && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                    Edited
                                  </Badge>
                                )}
                                {getBoostStatus(product)}
                              </CardTitle>
                              <p className="text-gray-600 dark:text-gray-400 capitalize text-sm">{product.category} • {product.condition}</p>
                            </div>
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-6">
                            {/* Product Image */}
                            <div className="md:col-span-1">
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img 
                                    src={getMainImageWithFallback(product.images, product.main_image_index)} 
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`text-4xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                  📱
                                </div>
                              </div>
                            </div>
                            
                            {/* Product Details */}
                            <div className="md:col-span-2 space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">{product.description.substring(0, 100)}...</p>
                                <p className="text-lg font-semibold text-green-600">{formatPrice(product.price)}</p>
                                {product.negotiable && (
                                  <span className="text-sm text-gray-500">(Negotiable)</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-2">
                                <p><strong>Location:</strong> {product.location}</p>
                                <p><strong>Listed:</strong> {formatDate(product.submittedAt)}</p>
                                <ExpiryDate product={product} />
                              </div>
                              
                              {/* Show rejection reason if present */}
                              {product.status === 'rejected' && product.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                                  <p className="text-sm text-red-700">{product.rejection_reason}</p>
                                </div>
                              )}
                              
                              {/* Show suggestions if present */}
                              {product.suggestions && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    Admin Suggestions:
                                  </p>
                                  <p className="text-sm text-yellow-700">{product.suggestions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4">

                            {(product.status === 'approved' || product.status === 'closed') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(product);
                                }}
                              >
                                <Share className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            )}

                            {/* Edit button for all editable statuses */}
                            {(product.status === 'approved' || product.status === 'pending' || product.status === 'rejected') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAd(product);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}

                            {/* Boost buttons - Only for approved ads */}
                            {product.status === 'approved' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBoostAd(product.id, 'boost');
                                  }}
                                  className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                                >
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  Boost
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBoostAd(product.id, '2x_boost');
                                  }}
                                  className="text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  2x Boost
                                </Button>
                              </>
                            )}

                            {product.status === 'approved' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Archive className="h-4 w-4 mr-1" />
                                    Close
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Close this ad?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove the ad from public view but keep it in your ads list. You can reactivate it later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCloseAd(product.id)}>
                                      Close Ad
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {product.status === 'closed' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-600 hover:text-green-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reactivate this ad?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will make your ad visible to the public again and mark it as approved.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReactivateAd(product.id)}>
                                      Reactivate Ad
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {product.status === 'expired' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-orange-600 hover:text-orange-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReactivationModal(product);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reactivate
                              </Button>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Delete this ad permanently?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your ad and remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteAd(product.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </>
                        </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Ads</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product listings</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
              </div>
            </div>
            
            {products.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads yet</h3>
                    <p className="text-gray-600 mb-4">You haven't published any ads yet. Start by creating your first listing to reach potential buyers!</p>
                    <Button onClick={() => navigate("/publish-ad")} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Ad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <BackgroundLoadingIndicator isFetching={isFetching} />
                {viewMode === 'grid' ? (
                  <ProductGrid 
                    products={products} 
                    loading={loading}
                    showEditButtons={true}
                    onEdit={handleEditProduct}
                  />
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <Card 
                        key={product.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img 
                                    src={getMainImageWithFallback(product.images, product.main_image_index)} 
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`text-2xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                  📱
                                </div>
                              </div>
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {product.title}
                                  </h3>
                                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                                    {product.edited && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                        Edited
                                      </Badge>
                                    )}
                                    {getBoostStatus(product)}
                                  </div>
                                  <p className="text-gray-600 text-sm capitalize">{product.category} • {product.condition}</p>
                                  <p className="text-lg font-bold text-primary mt-1">{formatPrice(product.price)}</p>
                                  {product.negotiable && (
                                    <span className="text-xs text-gray-500">(Negotiable)</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(product.status)}>
                                    {product.status}
                                  </Badge>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-1">
                                      <div className="space-y-1">
                                        {(product.status === 'approved' || product.status === 'closed') && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShare(product);
                                            }}
                                          >
                                            <Share className="h-4 w-4 mr-2" />
                                            Share
                                          </Button>
                                        )}

                                        {(product.status === 'approved' || product.status === 'pending' || product.status === 'rejected') && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingAd(product);
                                            }}
                                          >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </Button>
                                        )}

                                        {product.status === 'approved' && (
                                          <>
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              className="w-full justify-start text-orange-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleBoostAd(product.id, 'boost');
                                              }}
                                            >
                                              <TrendingUp className="h-4 w-4 mr-2" />
                                              Boost
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              className="w-full justify-start text-purple-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleBoostAd(product.id, '2x_boost');
                                              }}
                                            >
                                              <Zap className="h-4 w-4 mr-2" />
                                              2x Boost
                                            </Button>
                                          </>
                                        )}

                                        {product.status === 'approved' && (
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full justify-start"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Archive className="h-4 w-4 mr-2" />
                                                Close
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Close this ad?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  This will remove the ad from public view but keep it in your ads list. You can reactivate it later.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleCloseAd(product.id)}>
                                                  Close Ad
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        )}

                                        {product.status === 'closed' && (
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full justify-start text-green-600"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reactivate
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Reactivate this ad?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  This will make your ad visible to the public again and mark it as approved.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleReactivateAd(product.id)}>
                                                  Reactivate Ad
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        )}

                                        {product.status === 'expired' && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start text-orange-600"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenReactivationModal(product);
                                            }}
                                          >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Reactivate
                                          </Button>
                                        )}

                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="w-full justify-start text-red-600"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                                Delete this ad permanently?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your ad and remove all associated data.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => handleDeleteAd(product.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Delete Permanently
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              
                              {/* Additional Info */}
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p><strong>Location:</strong> {product.location}</p>
                                <p><strong>Listed:</strong> {formatDate(product.submittedAt)}</p>
                                <ExpiryDate product={product} />
                              </div>
                              
                              {/* Show rejection reason if present */}
                              {product.status === 'rejected' && product.rejection_reason && (
                                <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                                  <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                                  <p className="text-xs text-red-700">{product.rejection_reason}</p>
                                </div>
                              )}
                              
                              {/* Show suggestions if present */}
                              {product.suggestions && (
                                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                                  <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    Admin Suggestions:
                                  </p>
                                  <p className="text-xs text-yellow-700">{product.suggestions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Share Modal */}
        {selectedAdForShare && (
          <ShareModal 
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false);
              setSelectedAdForShare(null);
            }}
            productTitle={selectedAdForShare.title}
            productUrl={`${window.location.origin}/product/${selectedAdForShare.id}`}
          />
        )}

        {/* Reactivation Modal */}
        <Dialog open={reactivationModalOpen} onOpenChange={setReactivationModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reactivate "{selectedProductForReactivation?.title}"</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
                <p className="text-sm text-gray-600 text-center">
                  Choose how you want to reactivate your ad:
                </p>
                
                {/* Free Package Option */}
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Gift className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Reactivate with Free Package</h3>
                      <p className="text-sm text-gray-500">7 days visibility</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => selectedProductForReactivation && handleReactivateWithFree(selectedProductForReactivation.id)}
                    className="w-full"
                    variant="outline"
                    size="lg"
                  >
                    Reactivate Free
                  </Button>
                </div>

                {/* Paid Package Options */}
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Reactivate with Paid Package</h3>
                      <p className="text-sm text-gray-500">Choose a package for better visibility</p>
                    </div>
                  </div>
                  
                  {loadingPackages ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading packages...</p>
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="one-time">One-time Packages</TabsTrigger>
                        <TabsTrigger value="subscription">Subscription Packages</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="one-time" className="space-y-4 mt-6">
                        {oneTimePackages.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No one-time packages available</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {oneTimePackages.map((pkg) => (
                              <Card 
                                key={pkg.id} 
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                  selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
                                }`}
                                onClick={() => setSelectedPackage(pkg.id)}
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                    {pkg.recommended && (
                                      <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-3">
                                  <div className="text-2xl font-bold text-primary mb-2">
                                    {formatPrice(pkg.price)}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{pkg.duration}</p>
                                  <ul className="space-y-1 text-sm text-gray-600">
                                    {pkg.features?.slice(0, 3).map((feature: string, index: number) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                                <CardFooter>
                                  <Button 
                                    className="w-full"
                                    onClick={() => handleReactivateWithPackage(pkg.id)}
                                  >
                                    Select Package
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="subscription" className="space-y-4 mt-6">
                        {subscriptionPackages.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No subscription packages available</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subscriptionPackages.map((pkg) => (
                              <Card 
                                key={pkg.id} 
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                  selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
                                }`}
                                onClick={() => setSelectedPackage(pkg.id)}
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                    {pkg.recommended && (
                                      <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-3">
                                  <div className="text-2xl font-bold text-primary mb-2">
                                    {formatPrice(pkg.price)}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{pkg.duration}</p>
                                  <ul className="space-y-1 text-sm text-gray-600">
                                    {pkg.features?.slice(0, 3).map((feature: string, index: number) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                                <CardFooter>
                                  <Button 
                                    className="w-full"
                                    onClick={() => handleReactivateWithPackage(pkg.id)}
                                  >
                                    Select Package
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MyAds;
