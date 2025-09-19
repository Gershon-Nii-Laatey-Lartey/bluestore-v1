
import { useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Ban, CheckCircle, AlertTriangle } from "lucide-react";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock user data
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+233 24 123 4567",
      status: "active",
      joinDate: "2024-01-15",
      totalAds: 12,
      location: "Accra"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+233 26 987 6543",
      status: "suspended",
      joinDate: "2024-02-20",
      totalAds: 8,
      location: "Kumasi"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+233 27 456 7890",
      status: "pending",
      joinDate: "2024-03-10",
      totalAds: 3,
      location: "Tamale"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800"><Ban className="h-3 w-3 mr-1" />Suspended</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="p-8 pt-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage and monitor all platform users.</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Users</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Contact</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Ads</th>
                        <th className="text-left py-3 px-4">Join Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.location}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-medium">{user.totalAds}</span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {user.joinDate}
                          </td>
                          <td className="py-4 px-4">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
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

export default AdminUsers;
