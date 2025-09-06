
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, TrendingUp } from "lucide-react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Package Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            <span className="font-medium">Total Pending Revenue: </span>
            <span className="text-green-600 dark:text-green-400 font-bold">{formatPrice(totalRevenue)}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(packageStats)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([packageId, stats]) => {
                const IconComponent = getPackageIcon(packageId);
                return (
                  <div key={packageId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-lg gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComponent className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <Badge variant="outline" className={`${stats.color} text-xs truncate max-w-[150px]`}>
                        {stats.name}
                      </Badge>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-medium text-foreground">{stats.count} products</div>
                      <div className="text-xs text-green-600 dark:text-green-400">{formatPrice(stats.totalRevenue)}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
