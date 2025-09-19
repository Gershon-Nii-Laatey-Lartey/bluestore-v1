
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle, AlertCircle, Clock } from "lucide-react";

const AdminAPI = () => {
  const apiEndpoints = [
    {
      name: "User Authentication",
      endpoint: "/api/auth",
      status: "operational",
      responseTime: "120ms",
      uptime: "99.9%"
    },
    {
      name: "Product Catalog",
      endpoint: "/api/products",
      status: "operational",
      responseTime: "85ms",
      uptime: "99.8%"
    },
    {
      name: "Payment Processing",
      endpoint: "/api/payments",
      status: "degraded",
      responseTime: "250ms",
      uptime: "98.5%"
    },
    {
      name: "File Upload",
      endpoint: "/api/upload",
      status: "operational",
      responseTime: "180ms",
      uptime: "99.7%"
    },
    {
      name: "Notifications",
      endpoint: "/api/notifications",
      status: "maintenance",
      responseTime: "N/A",
      uptime: "95.2%"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Degraded</Badge>;
      case "maintenance":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Maintenance</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="p-8 pt-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Status Monitor</h1>
              <p className="text-gray-600">Monitor API endpoints and system health.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Operational</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">3</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Degraded</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">1</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">159ms</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Service</th>
                        <th className="text-left py-3 px-4">Endpoint</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Response Time</th>
                        <th className="text-left py-3 px-4">Uptime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiEndpoints.map((api, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{api.name}</td>
                          <td className="py-4 px-4 font-mono text-sm">{api.endpoint}</td>
                          <td className="py-4 px-4">{getStatusBadge(api.status)}</td>
                          <td className="py-4 px-4">{api.responseTime}</td>
                          <td className="py-4 px-4">{api.uptime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminAPI;
