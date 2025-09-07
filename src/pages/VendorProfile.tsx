
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, Package, Shield, Edit, MessageCircle, Calendar, Share2, Lock } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { dataService, VendorProfile as VendorProfileType } from "@/services/dataService";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { paymentService } from "@/services/paymentService";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { formatPrice } from "@/utils/formatters";
import { shareProfile } from "@/utils/shareUtils";
import { useToast } from "@/hooks/use-toast";


const VendorProfile = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();



  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor-profile', vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error('Vendor ID is required');
      
      console.log('Fetching vendor profile for ID:', vendorId);
      
      // Debug: Let's see what vendor profiles exist in the database
      const { data: allVendors, error: debugError } = await supabase
        .from('vendor_profiles')
        .select('id, user_id, business_name')
        .limit(5);
      
      if (!debugError) {
        console.log('Available vendor profiles:', allVendors);
      }
      
      // Try multiple approaches to find the vendor profile
      let vendorData = null;
      let vendorError = null;

      // First try: Look for vendor profile by ID (vendor profile UUID)
      try {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('id', vendorId)
          .single();
        
        if (data && !error) {
          vendorData = data;
          console.log('Found vendor profile by ID:', vendorData);
        }
      } catch (error) {
        console.log('Vendor profile not found by ID, trying user_id...');
      }

      // Second try: Look for vendor profile by user_id (if vendorId is actually a user ID)
      if (!vendorData) {
        try {
          const { data, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', vendorId)
            .single();
          
          if (data && !error) {
            vendorData = data;
            console.log('Found vendor profile by user_id:', vendorData);
          }
        } catch (error) {
          console.log('Vendor profile not found by user_id either');
        }
      }

      // If still no vendor data found, throw an error
      if (!vendorData) {
        vendorError = {
          code: 'PGRST116',
          message: 'Vendor profile not found by ID or user_id',
          details: 'The result contains 0 rows'
        };
        throw vendorError;
      }

      // Then get the associated user profile separately
      let userProfile = null;
      if (vendorData?.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', vendorData.user_id)
          .single();

        if (!profileError) {
          userProfile = profileData;
        }
      }
      
      console.log('Vendor profile data:', vendorData);
      console.log('User profile data:', userProfile);
      
      return {
        ...vendorData,
        profiles: userProfile
      };
    },
    enabled: !!vendorId
  });

  const { data: vendorProducts } = useQuery({
    queryKey: ['vendor-products', vendor?.user_id],
    queryFn: async () => {
      if (!vendor?.user_id) return [];
      
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('user_id', vendor.user_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!vendor?.user_id
  });

  // Check if this is the current user's own profile
  const isOwnProfile = vendor?.user_id === user?.id;

  // Get user's active package if it's their own profile
  const { data: userActivePackage } = useQuery({
    queryKey: ['user-active-package', user?.id],
    queryFn: async () => {
      if (!user?.id || !isOwnProfile) return null;
      
      try {
        return await paymentService.getUserActivePackage(user.id);
      } catch (error) {
        console.error('Error loading active package:', error);
        return null;
      }
    },
    enabled: !!user?.id && isOwnProfile,
    retry: false, // Don't retry subscription queries
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false // Don't refetch on window focus
  });

  // Helper functions
  const getVerificationBadge = () => {
    if (!vendor) return null;
    
    if (vendor.verification_status === 'verified') {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    } else if (vendor.verification_status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>;
    }
  };

  const getProfileImageUrl = () => {
    if (vendor?.profile_image) {
      return vendor.profile_image;
    }
    return null;
  };

  const getActivePackageInfo = () => {
    if (!userActivePackage) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <Package className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">
          {userActivePackage.package_name} Package
        </span>
      </div>
    );
  };

  const handleShareProfile = async () => {
    const profileName = vendor.business_name || vendor.profiles?.full_name || 'Vendor Profile';
    const profileUrl = window.location.href;
    
    const success = await shareProfile(
      profileName,
      profileUrl,
      () => {
        toast({
          title: "Shared!",
          description: "Vendor profile shared successfully"
        });
      },
      (error) => {
        console.error('Error sharing profile:', error);
        // Don't show error toast for unsupported Web Share API - this is expected
        if (error.message !== 'Web Share API is not supported in this browser') {
          toast({
            title: "Error",
            description: "Failed to share profile. Please try again.",
            variant: "destructive"
          });
        }
      }
    );

    if (!success) {
      // Fallback to copy URL if Web Share API is not supported
      try {
        // Check if clipboard API is available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(profileUrl);
          toast({
            title: "Link copied!",
            description: "Profile URL copied to clipboard"
          });
        } else {
          // Fallback for browsers without clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = profileUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          toast({
            title: "Link copied!",
            description: "Profile URL copied to clipboard (fallback method)"
          });
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        toast({
          title: "Copy failed",
          description: "Please manually copy the URL from your browser's address bar",
          variant: "destructive"
        });
      }
    }
  };

  // SEO data for vendor profile
  const vendorName = vendor?.business_name || vendor?.profiles?.full_name || 'Vendor';
  const vendorTitle = `${vendorName} | BlueStore | Vendor`;
  const vendorDescription = `Visit ${vendorName}'s store on BlueStore Ghana. Browse their products and contact them directly. Trusted vendor with quality products.`;
  const vendorKeywords = `${vendorName} Ghana, ${vendorName} BlueStore, vendor Ghana, online store Ghana, ${vendorName} products`;

  // Structured data for vendor profile
  const vendorStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": vendorName,
    "description": vendorDescription,
    "url": `https://bluestoregh.web.app/vendor/${vendorId}`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": vendor?.phone || "",
      "email": vendor?.email || vendor?.profiles?.email || "",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GH",
      "addressRegion": vendor?.location || "Ghana"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${vendorName}'s Products`,
      "itemListElement": vendorProducts?.map((product, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": product.title,
          "description": product.description,
          "image": product.images?.[0] || ""
        },
        "price": product.price,
        "priceCurrency": "GHS"
      })) || []
    }
  };

  const VendorSkeleton = () => (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="text-center">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
          
          {/* Profile Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );

  if (isLoading) {
    return <VendorSkeleton />;
  }

  if (error || !vendor) {
    // For error cases, we can't determine if it's the user's own profile without vendor data
    // So we'll show the create profile option for any authenticated user
    const isOwnProfile = !!user?.id;
    
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
            <p className="text-gray-600">The vendor you're looking for doesn't exist or has been removed.</p>
            {isOwnProfile && (
              <div className="mt-4">
                <Button onClick={() => navigate('/create-vendor-profile')} className="bg-blue-600 hover:bg-blue-700">
                  Create Vendor Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEOHead
        title={vendorTitle}
        description={vendorDescription}
        keywords={vendorKeywords}
        url={`https://bluestoregh.web.app/vendor/${vendorId}`}
        structuredData={vendorStructuredData}
      />
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Sidebar */}
              <div className="col-span-4">
                <div className="sticky top-24 space-y-6">
                  {/* Profile Card */}
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={getProfileImageUrl() || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {vendor.business_name?.charAt(0) || vendor.profiles?.full_name?.charAt(0) || 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <h1 className="text-2xl font-bold text-foreground mb-2">{vendor.business_name || vendor.profiles?.full_name}</h1>
                      <p className="text-muted-foreground mb-4">{vendor.profiles?.full_name && vendor.business_name ? `${vendor.profiles.full_name} • ` : ''}BlueStore Vendor</p>
                      <div className="flex items-center justify-center space-x-2 mb-6">
                        {getVerificationBadge()}
                        {isOwnProfile && getActivePackageInfo()}
                      </div>
                      
                      {/* Action buttons for own profile */}
                      {isOwnProfile && (
                        <div className="space-y-3">
                          <Button 
                            onClick={() => navigate('/edit-vendor-profile')} 
                            className="w-full"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button 
                            onClick={() => navigate('/my-ads')} 
                            variant="outline"
                            className="w-full"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            My Ads
                          </Button>
                          <Button 
                            onClick={() => handleShareProfile()}
                            variant="outline"
                            className="w-full"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Contact Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-muted-foreground">{vendor.location || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Contact</p>
                          {user ? (
                            <p className="text-muted-foreground">{vendor.phone || 'Not specified'}</p>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">Login to view</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{vendor.profiles?.email || vendor.email || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Verification</p>
                          <Badge variant={vendor.verified ? "default" : "secondary"}>
                            {vendor.verified ? "Verified" : "Not Verified"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* About Section */}
                  {vendor.description && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">About</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{vendor.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="col-span-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Products by this Vendor</h2>
                    <p className="text-muted-foreground">
                      {vendorProducts?.length || 0} {vendorProducts?.length === 1 ? 'product' : 'products'} available
                    </p>
                  </div>
                  
                  {/* Products Grid */}
                  {vendorProducts && vendorProducts.length > 0 ? (
                    <div className="product-grid grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {vendorProducts.map((product) => (
                        <Card key={product.id} className="product-card group transition-all duration-300 cursor-pointer">
                          <CardContent className="p-0">
                            <div className="product-image-container aspect-square mb-4">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={getMainImageWithFallback(product.images, product.main_image_index)} 
                                  alt={product.title}
                                  className="product-image"
                                />
                              ) : (
                                <div className="product-image-placeholder text-3xl">📱</div>
                              )}
                            </div>
                            <h4 className="product-title text-card-foreground mb-3 text-sm line-clamp-2">
                              {product.title}
                            </h4>
                            <p className="product-price text-lg text-primary mb-2">
                              {formatPrice(product.price)}
                            </p>
                            <p className="product-location text-xs capitalize">
                              {product.category} • {product.condition}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No products available from this vendor yet.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-20 w-20 mr-4">
                  <AvatarImage src={getProfileImageUrl() || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {vendor.business_name?.charAt(0) || vendor.profiles?.full_name?.charAt(0) || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{vendor.business_name || vendor.profiles?.full_name}</h1>
                  <p className="text-muted-foreground mb-2">{vendor.profiles?.full_name && vendor.business_name ? `${vendor.profiles.full_name} • ` : ''}BlueStore Vendor</p>
                  <div className="flex items-center space-x-2">
                    {getVerificationBadge()}
                    {isOwnProfile && getActivePackageInfo()}
                  </div>
                </div>
              </div>
              
              {/* Action buttons for own profile */}
              {isOwnProfile && (
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button 
                    onClick={() => navigate('/edit-vendor-profile')} 
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/my-ads')} 
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>My Ads</span>
                  </Button>
                  <Button 
                    onClick={() => handleShareProfile()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Profile</span>
                  </Button>
                </div>
              )}
              
              {/* Action buttons for other profiles */}
              {!isOwnProfile && (
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button 
                    onClick={() => handleShareProfile()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Profile</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {(vendor.business_name || vendor.profiles?.full_name || 'V').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">{vendor.business_name || vendor.profiles?.full_name}</h2>
                    <p className="text-sm text-muted-foreground">Vendor Profile</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{vendor.location || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Contact</p>
                        {user ? (
                          <p className="text-muted-foreground">{vendor.phone || 'Not specified'}</p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">Login to view</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{vendor.profiles?.email || vendor.email || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Verification</p>
                        <Badge variant={vendor.verified ? "default" : "secondary"}>
                          {vendor.verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {vendor.description && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-muted-foreground">{vendor.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Products Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Products by this Vendor</h2>
              {vendorProducts && vendorProducts.length > 0 ? (
                  <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {vendorProducts.map((product) => (
                    <Card key={product.id} className="product-card group transition-all duration-300 cursor-pointer">
                        <CardContent className="p-0">
                          <div className="product-image-container aspect-square mb-4">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={getMainImageWithFallback(product.images, product.main_image_index)} 
                              alt={product.title}
                                className="product-image"
                            />
                          ) : (
                              <div className="product-image-placeholder text-3xl">📱</div>
                          )}
                        </div>
                          <h4 className="product-title text-card-foreground mb-3 text-sm line-clamp-2">
                          {product.title}
                        </h4>
                          <p className="product-price text-lg text-primary mb-2">
                          {formatPrice(product.price)}
                        </p>
                          <p className="product-location text-xs capitalize">
                          {product.category} • {product.condition}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No products available from this vendor yet.</p>
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default VendorProfile;
