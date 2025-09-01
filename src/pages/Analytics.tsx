import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MessageSquare, TrendingUp, Calendar, Package, RefreshCw } from "lucide-react";
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
    totalMessages: 0,
    activeAds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  // Refresh analytics data every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get analytics data for user's products with package information
      const { data: analyticsData, error } = await supabase
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
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Aggregate analytics data by product to show total stats per ad
      const aggregatedData = analyticsData?.reduce((acc, item) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            ...item,
            totalViews: 0,
            totalMessages: 0,
            totalClicks: 0
          };
        }
        acc[productId].totalViews += (item.views || 0);
        acc[productId].totalMessages += (item.messages || 0);
        acc[productId].totalClicks += (item.clicks || 0);
        return acc;
      }, {} as Record<string, any>);
      
      const aggregatedArray = Object.values(aggregatedData || {});
      setAnalytics(aggregatedArray);
      
      // Calculate total stats
      const totals = aggregatedArray.reduce((acc, item) => ({
        totalViews: acc.totalViews + (item.totalViews || 0),
        totalMessages: acc.totalMessages + (item.totalMessages || 0),
        activeAds: acc.activeAds + (item.product_submissions.status === 'approved' ? 1 : 0)
      }), { totalViews: 0, totalMessages: 0, activeAds: 0 });
      
      setTotalStats(totals || { totalViews: 0, totalMessages: 0, activeAds: 0 });
      
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
    if (!packageId) return 'Free Package';
    const packageConfig = adPackages.find(pkg => pkg.id === packageId);
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
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                Premium Feature
              </Badge>
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
          <p className="text-gray-600">Track the performance of your ads</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-primary">{totalStats.totalMessages}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-500" />
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
                    No analytics data available yet. Analytics will appear once your ads start receiving activity.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analytics.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
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
                            <p className="text-sm text-gray-600">Total Messages</p>
                            <p className="text-xl font-semibold">{item.totalMessages || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Package</p>
                            <p className="text-sm font-semibold">
                              {getPackageName(item.package_id)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Last Updated</p>
                            <p className="text-sm font-semibold">{formatDate(item.date)}</p>
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