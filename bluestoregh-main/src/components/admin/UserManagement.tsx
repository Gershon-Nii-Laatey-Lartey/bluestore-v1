import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminService, User } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, ShieldCheck, User as UserIcon, Building } from "lucide-react";

interface UserManagementProps {
  onRefresh?: () => void;
}

export const UserManagement = ({ onRefresh }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { users: fetchedUsers } = await adminService.getUsers(1, 100);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.updateUserVerification(userId, !currentStatus);
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, is_verified: !currentStatus } : u
      ));
      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'verified' : 'unverified'} successfully`
      });
    } catch (error) {
      console.error('Error updating user verification:', error);
      toast({
        title: "Error",
        description: "Failed to update user verification",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone?.includes(searchQuery);
    
    const matchesFilter = filterType === "all" || user.user_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (user: User) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserRole = (user: User) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].role;
    }
    return 'user';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Management</span>
            <Badge variant="outline">
              {filteredUsers.length} users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, username, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter">Filter by type</Label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Users</option>
                <option value="buyer">Buyers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || user.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || 'no-username'}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.user_type === 'vendor' ? (
                          <Building className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-blue-600 mr-1" />
                        )}
                        <Badge 
                          variant={user.user_type === 'admin' ? 'destructive' : 
                                 user.user_type === 'vendor' ? 'default' : 'secondary'}
                        >
                          {user.user_type}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">
                        {getUserRole(user)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.location ? 
                        `${user.location.city}, ${user.location.state_province}` : 
                        'No location'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.is_verified ? (
                          <ShieldCheck className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <Shield className="h-4 w-4 text-gray-400 mr-1" />
                        )}
                        <Badge variant={user.is_verified ? "default" : "secondary"}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVerification(user.user_id, user.is_verified)}
                        className="h-8 px-3"
                      >
                        {user.is_verified ? (
                          <>
                            <ShieldCheck className="h-4 w-4 text-green-600 mr-1" />
                            Unverify
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 text-gray-400 mr-1" />
                            Verify
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms' : 'No users available'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
