import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MessageSquare, TrendingUp, Calendar, Package, RefreshCw, Users, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { adPackages } from "@/types/adPackage";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalViews: 0,
    totalChatRooms: 0,
    activeAds: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("live");

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  // Refresh analytics data every 5 minutes (less aggressive)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, 5 * 60 * 1000); // 5 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get both analytics data and chat room data for user's products
      const [analyticsResult, chatRoomsResult] = await Promise.all([
        // Get analytics data for views
        supabase
          .from('ad_analytics')
          .select(`
            *,
            product_submissions!inner (
              title,
              status,
              created_at,
              category,
              price,
              package,
              images,
              main_image_index
            )
          `)
          .eq('user_id', user?.id)
          .order('date', { ascending: false }),
        
        // Get chat room data for customer engagement
        supabase
          .from('chat_rooms')
          .select(`
            *,
            product_submissions!inner (
              title,
              status,
              created_at,
              category,
              price,
              package,
              images,
              main_image_index
            )
          `)
          .eq('seller_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (analyticsResult.error) throw analyticsResult.error;
      if (chatRoomsResult.error) throw chatRoomsResult.error;
      
      // Aggregate analytics data by product to show total stats per ad
      const analyticsData = analyticsResult.data || [];
      const chatRoomsData = chatRoomsResult.data || [];
      
      // Create a map of product data
      const productMap = new Map();
      
      // Process analytics data first
      analyticsData.forEach((item) => {
        const productId = item.product_id;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            totalViews: 0,
            totalClicks: 0,
            totalMessages: 0,
            totalChatRooms: 0,
            product_submissions: item.product_submissions,
            package_id: item.package_id, // Store package_id from analytics
            last_updated: item.date
          });
        }
        const product = productMap.get(productId);
        product.totalViews += (item.views || 0);
        product.totalClicks += (item.clicks || 0);
        product.totalMessages += (item.messages || 0);
        // Keep the most recent package_id if multiple exist
        if (item.package_id) {
          product.package_id = item.package_id;
        }
      });
      
      // Process chat room data
      chatRoomsData.forEach((item) => {
        const productId = item.product_id;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            totalViews: 0,
            totalClicks: 0,
            totalMessages: 0,
            totalChatRooms: 0,
            product_submissions: item.product_submissions,
            package_id: null, // Will be updated if analytics data exists
            last_updated: item.created_at
          });
        }
        const product = productMap.get(productId);
        product.totalChatRooms += 1;
        // Update last_updated if chat room is more recent
        if (new Date(item.created_at) > new Date(product.last_updated)) {
          product.last_updated = item.created_at;
        }
      });
      
      const aggregatedArray = Array.from(productMap.values());
      
      // Debug: Log the aggregated data to see what we're getting
      console.log('Aggregated analytics data:', aggregatedArray);
      
      setAnalytics(aggregatedArray);
      
      // Calculate total stats
      const totals = aggregatedArray.reduce((acc, item) => ({
        totalViews: acc.totalViews + (item.totalViews || 0),
        totalChatRooms: acc.totalChatRooms + (item.totalChatRooms || 0),
        activeAds: acc.activeAds + (item.product_submissions?.status === 'approved' ? 1 : 0)
      }), { totalViews: 0, totalChatRooms: 0, activeAds: 0 });
      
      setTotalStats(totals || { totalViews: 0, totalChatRooms: 0, activeAds: 0 });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get active ads count from the same source as profile page
  const loadActiveAdsCount = async () => {
    try {
      const { count: adsCount } = await supabase
        .from('product_submissions')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .eq('status', 'approved');

      setTotalStats(prev => ({
        ...prev,
        activeAds: adsCount || 0
      }));
    } catch (error) {
      console.error('Error loading active ads count:', error);
    }
  };

  // Load active ads count separately
  useEffect(() => {
    if (user) {
      loadActiveAdsCount();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get package name from package_id
  const getPackageName = (packageId: string | null) => {
    console.log('Getting package name for ID:', packageId);
    if (!packageId) return 'Free Package';
    const packageConfig = adPackages.find(pkg => pkg.id === packageId);
    console.log('Found package config:', packageConfig);
    return packageConfig?.name || 'Unknown Package';
  };

  // Get product thumbnail image
  const getProductThumbnail = (product: any) => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder.svg';
    }
    const mainIndex = product.main_image_index || 0;
    return product.images[mainIndex] || product.images[0];
  };

  // Handle product card click
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Filter analytics by status
  const getFilteredAnalytics = () => {
    switch (activeFilter) {
      case "live":
        return analytics.filter(item => item.product_submissions?.status === 'approved');
      case "closed":
        return analytics.filter(item => item.product_submissions?.status === 'closed');
      case "expired":
        return analytics.filter(item => item.product_submissions?.status === 'expired');
      default:
        return analytics;
    }
  };

  // Get count for each filter
  const getFilterCount = (filter: string) => {
    switch (filter) {
      case "live":
        return analytics.filter(item => item.product_submissions?.status === 'approved').length;
      case "closed":
        return analytics.filter(item => item.product_submissions?.status === 'closed').length;
      case "expired":
        return analytics.filter(item => item.product_submissions?.status === 'expired').length;
      default:
        return analytics.length;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="animate-fade-in">
          <div className="text-center py-12">
            <p className="text-gray-500">Please log in to view analytics.</p>
          </div>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Track the performance of your ads and customer engagement</p>
              </div>
            </div>
            <Button
              onClick={loadAnalytics}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover:bg-primary hover:text-white transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {activeFilter === 'all' ? 'Total' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Views
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {getFilteredAnalytics().reduce((sum, item) => sum + (item.totalViews || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeFilter === 'all' ? 'Across all your ads' : `From ${activeFilter} ads`}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {activeFilter === 'all' ? 'Total' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Chats
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {getFilteredAnalytics().reduce((sum, item) => sum + (item.totalChatRooms || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeFilter === 'all' ? 'Customer inquiries' : `From ${activeFilter} ads`}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {activeFilter === 'all' ? 'Total' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Ads
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {getFilteredAnalytics().length.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeFilter === 'all' ? 'All your ads' : `${activeFilter} status`}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Package className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Options */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Ads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All", icon: BarChart3 },
                    { key: "live", label: "Live", icon: Package },
                    { key: "closed", label: "Closed", icon: Calendar },
                    { key: "expired", label: "Expired", icon: Calendar }
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={activeFilter === key ? "default" : "outline"}
                      onClick={() => setActiveFilter(key)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {label} ({getFilterCount(key)})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No analytics data available yet. Analytics will appear once your ads start receiving customer inquiries.
                  </p>
                ) : getFilteredAnalytics().length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No {activeFilter} ads found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {getFilteredAnalytics().map((item) => (
                      <Card 
                        key={item.product_id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
                        onClick={() => handleProductClick(item.product_id)}
                      >
                        <CardContent className="p-0">
                          {/* Product Image */}
                          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                            <img
                              src={getProductThumbnail(item.product_submissions)}
                              alt={item.product_submissions.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge className={
                              item.product_submissions.status === 'approved' 
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : item.product_submissions.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : item.product_submissions.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : item.product_submissions.status === 'closed'
                                  ? 'bg-gray-100 text-gray-800 border-gray-200'
                                  : 'bg-orange-100 text-orange-800 border-orange-200'
                              }>
                            {item.product_submissions.status}
                          </Badge>
                        </div>
                            <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium">
                              {getPackageName(item.package_id)}
                          </div>
                          </div>
                          
                          {/* Product Info */}
                          <div className="p-4">
                            <div className="mb-3">
                              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                {item.product_submissions.title}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize mt-1">
                                {item.product_submissions.category} • GHS {item.product_submissions.price}
                              </p>
                            </div>
                            
                            {/* Analytics Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-center mb-1">
                                  <Eye className="h-4 w-4 text-blue-600 mr-1" />
                                  <span className="text-xs text-blue-600 font-medium">Views</span>
                                </div>
                                <p className="text-xl font-bold text-blue-700">{item.totalViews || 0}</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center justify-center mb-1">
                                  <MessageSquare className="h-4 w-4 text-purple-600 mr-1" />
                                  <span className="text-xs text-purple-600 font-medium">Chats</span>
                                </div>
                                <p className="text-xl font-bold text-purple-700">{item.totalChatRooms || 0}</p>
                              </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Updated {formatDate(item.last_updated)}</span>
                              <div className="flex items-center text-primary group-hover:text-primary/80">
                                <span className="text-xs mr-1">View Details</span>
                                <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;