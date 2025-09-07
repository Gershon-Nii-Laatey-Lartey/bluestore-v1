
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { ProductSubmission } from "@/services/dataService";
import { formatPrice } from "@/utils/formatters";

interface PackageStatsCardProps {
  pendingSubmissions: ProductSubmission[];
}

export const PackageStatsCard = ({ pendingSubmissions }: PackageStatsCardProps) => {
  const packageStats = pendingSubmissions.reduce((stats, submission) => {
    const packageId = submission.package?.id || 'no-package';
    const packageName = submission.package?.name || 'No Package';
    const packagePrice = submission.package?.price || 0;
    
    if (!stats[packageId]) {
      stats[packageId] = {
        name: packageName,
        count: 0,
        totalRevenue: 0,
        color: getPackageColor(packageId)
      };
    }
    
    stats[packageId].count++;
    stats[packageId].totalRevenue += packagePrice;
    
    return stats;
  }, {} as Record<string, { name: string; count: number; totalRevenue: number; color: string }>);

  function getPackageColor(packageId: string) {
    switch (packageId) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
      case 'starter':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'rising':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700';
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'business':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
      case 'premium':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  }

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'pro':
      case 'business':
      case 'premium':
        return Shield;
      case 'standard':
      case 'rising':
        return TrendingUp;
      default:
        return Star;
    }
  };

  const totalRevenue = Object.values(packageStats).reduce((sum, stat) => sum + stat.totalRevenue, 0);

  // Calculate max values for scaling
  const maxCount = Math.max(...Object.values(packageStats).map(stat => stat.count));
  const maxRevenue = Math.max(...Object.values(packageStats).map(stat => stat.totalRevenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Package Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Revenue Summary */}
          {/* Bar Chart */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Products by Package</h4>
            
            {/* Chart Container */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-end justify-between h-48 gap-2">
                {Object.entries(packageStats)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([packageId, stats]) => {
                    const IconComponent = getPackageIcon(packageId);
                    const countPercentage = maxCount > 0 ? (stats.count / maxCount) * 100 : 0;
                    const barHeight = Math.max((countPercentage / 100) * 160, 8); // Min height of 8px
                    const totalProducts = pendingSubmissions.length;
                    const percentageOfTotal = totalProducts > 0 ? (stats.count / totalProducts) * 100 : 0;
                    
                    return (
                      <div key={packageId} className="flex flex-col items-center flex-1 group">
                        {/* Bar */}
                        <div className="relative w-full flex flex-col items-center">
                          {/* Value Label */}
                          <div className="text-xs font-medium text-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {stats.count} ({percentageOfTotal.toFixed(1)}%)
                          </div>
                          
                          {/* Bar Container */}
                          <div className="w-full bg-muted rounded-t-md h-40 flex items-end">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-md transition-all duration-700 ease-out relative group/bar"
                              style={{ height: `${barHeight}px` }}
                            >
                              {/* Hover Tooltip */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {stats.count} products ({percentageOfTotal.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Package Label */}
                        <div className="mt-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <IconComponent className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className={`${stats.color} text-xs px-1 py-0`}>
                              {stats.name.split(' ')[0]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Chart Legend */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(packageStats)
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([packageId, stats]) => {
                      const IconComponent = getPackageIcon(packageId);
                      const totalProducts = pendingSubmissions.length;
                      const percentageOfTotal = totalProducts > 0 ? (stats.count / totalProducts) * 100 : 0;
                      return (
                        <div key={packageId} className="flex items-center gap-1 text-xs">
                          <IconComponent className="h-3 w-3" />
                          <span className="text-muted-foreground">{stats.name}:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {stats.count} ({percentageOfTotal.toFixed(1)}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
