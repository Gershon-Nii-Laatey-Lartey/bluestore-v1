
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, AlertTriangle, CheckCircle } from "lucide-react";

const AdminSecurity = () => {
  const securityLogs = [
    {
      id: 1,
      event: "Successful Admin Login",
      user: "admin@bluestore.com",
      ip: "192.168.1.100",
      timestamp: "2024-06-07 14:30:25",
      status: "success"
    },
    {
      id: 2,
      event: "Failed Login Attempt",
      user: "unknown@domain.com",
      ip: "45.123.45.67",
      timestamp: "2024-06-07 13:15:42",
      status: "warning"
    },
    {
      id: 3,
      event: "Password Reset",
      user: "user@example.com",
      ip: "10.0.0.15",
      timestamp: "2024-06-07 12:45:18",
      status: "info"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case "warning":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Center</h1>
              <p className="text-gray-600">Monitor system security and manage access controls.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">2 expiring soon</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Event</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">IP Address</th>
                        <th className="text-left py-3 px-4">Timestamp</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{log.event}</td>
                          <td className="py-4 px-4">{log.user}</td>
                          <td className="py-4 px-4 font-mono text-sm">{log.ip}</td>
                          <td className="py-4 px-4 text-sm text-gray-500">{log.timestamp}</td>
                          <td className="py-4 px-4">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button variant="outline">View All Logs</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminSecurity;
