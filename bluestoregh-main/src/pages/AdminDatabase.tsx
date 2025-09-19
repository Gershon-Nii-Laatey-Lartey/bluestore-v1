
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, HardDrive, Activity, RefreshCw } from "lucide-react";

const AdminDatabase = () => {
  const dbStats = [
    { name: "Users", count: "1,247", growth: "+5.2%" },
    { name: "Products", count: "3,891", growth: "+12.1%" },
    { name: "Orders", count: "856", growth: "+8.7%" },
    { name: "Reviews", count: "2,103", growth: "+15.3%" }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="p-8 pt-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
              <p className="text-gray-600">Monitor database performance and manage data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4 GB</div>
                  <p className="text-xs text-muted-foreground">+150 MB this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45ms</div>
                  <p className="text-xs text-muted-foreground">Average response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connections</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23/100</div>
                  <p className="text-xs text-muted-foreground">Active connections</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dbStats.map((stat) => (
                      <div key={stat.name} className="flex items-center justify-between">
                        <span className="font-medium">{stat.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">{stat.count}</span>
                          <Badge variant="outline" className="text-green-600">
                            {stat.growth}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Statistics
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Optimize Tables
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDatabase;
