import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MessageSquare, TrendingUp, Calendar, Package, RefreshCw, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { adPackages } from "@/types/adPackage";

const Analytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalViews: 0,
    totalChatRooms: 0,
    activeAds: 0
  });
  const [loading, setLoading] = useState(true);

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
              package
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
              package
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
            </div>
            <Button
              onClick={loadAnalytics}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          <p className="text-gray-600">Track the performance of your ads and customer engagement</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-primary">{totalStats.totalViews}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Chats</p>
                      <p className="text-2xl font-bold text-primary">{totalStats.totalChatRooms}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Ads</p>
                      <p className="text-2xl font-bold text-primary">{totalStats.activeAds}</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

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
                ) : (
                  <div className="space-y-4">
                    {analytics.map((item) => (
                      <div key={item.product_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product_submissions.title}</h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {item.product_submissions.category} • GHS {item.product_submissions.price}
                            </p>
                          </div>
                          <Badge 
                            className={
                              item.product_submissions.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {item.product_submissions.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Total Views</p>
                            <p className="text-xl font-semibold">{item.totalViews || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Chats</p>
                            <p className="text-xl font-semibold">{item.totalChatRooms || 0}</p>
                          </div>
                                                      <div>
                              <p className="text-sm text-gray-600">Package</p>
                              <p className="text-sm font-semibold">
                                {getPackageName(item.package_id)}
                              </p>
                            </div>
                          <div>
                            <p className="text-sm text-gray-600">Last Updated</p>
                            <p className="text-sm font-semibold">{formatDate(item.last_updated)}</p>
                          </div>
                        </div>
                      </div>
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