
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Settings, Activity, MessageSquare, Shield, Eye, EyeOff, Copy, Key, MoreVertical, Phone } from "lucide-react";
import { CSWorker, csService } from "@/services/csService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CSWorkerManagement = () => {
  const [workers, setWorkers] = useState<CSWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newWorker, setNewWorker] = useState({
    email_head: '',
    full_name: '',
    phone: '',
    password: '',
    roles: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);
  const [selectedWorkerForPasswordChange, setSelectedWorkerForPasswordChange] = useState<CSWorker | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const availableRoles = [
    { value: 'customer_service_chat', label: 'Customer Service Chat' },
    { value: 'complaints_reports_manager', label: 'Complaints & Reports Manager' },
    { value: 'product_review', label: 'Product Review' },
    { value: 'general_access', label: 'General Access' }
  ];

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await csService.getAllCSWorkers();
      setWorkers(data);
    } catch (error) {
      console.error('Error loading CS workers:', error);
      toast({
        title: "Error",
        description: "Failed to load CS workers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async () => {
    try {
      if (!newWorker.email_head.trim()) {
        toast({
          title: "Missing Email",
          description: "Please provide an email username",
          variant: "destructive"
        });
        return;
      }

      if (!newWorker.full_name || !newWorker.password || newWorker.roles.length === 0) {
        toast({
          title: "Missing Information",
          description: "Please provide full name, password, and at least one role",
          variant: "destructive"
        });
        return;
      }

      const result = await csService.createCSWorker(newWorker);
      
      setGeneratedPassword(result.password);
      setShowPassword(true);
      
      toast({
        title: "CS Worker Created",
        description: "CS worker has been created successfully. Save the generated password!"
      });

      setNewWorker({
        email_head: '',
        full_name: '',
        phone: '',
        password: '',
        roles: []
      });
      setIsCreateDialogOpen(false);
      await loadWorkers();
    } catch (error) {
      console.error('Error creating CS worker:', error);
      toast({
        title: "Error",
        description: "Failed to create CS worker",
        variant: "destructive"
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedWorkerForPasswordChange || !newPassword.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide a new password",
        variant: "destructive"
      });
      return;
    }

    try {
      await csService.changeCSWorkerPassword(selectedWorkerForPasswordChange.user_id, newPassword);
      
      toast({
        title: "Password Changed",
        description: "CS worker password has been updated successfully"
      });
      
      setShowPasswordChangeDialog(false);
      setSelectedWorkerForPasswordChange(null);
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const handleStatusChange = async (workerId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await csService.updateCSWorkerStatus(workerId, status);
      toast({
        title: "Status Updated",
        description: "CS worker status has been updated"
      });
      await loadWorkers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update worker status",
        variant: "destructive"
      });
    }
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setNewWorker(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setNewWorker(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer_service_chat': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'complaints_reports_manager': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'product_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'general_access': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Service Workers</h2>
          <p className="text-muted-foreground">Manage CS workers and their roles</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              <span>Add CS Worker</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Create New CS Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex">
                  <Input
                    id="email"
                    placeholder="username"
                    value={newWorker.email_head}
                    onChange={(e) => setNewWorker(prev => ({ ...prev, email_head: e.target.value }))}
                    className="rounded-r-none border-r-0"
                  />
                  <div className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground flex items-center">
                    @bluestoreghana.com
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newWorker.full_name}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={newWorker.password}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Employee ID</Label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded border">
                  Auto-generated on creation
                </div>
              </div>
              
              <div>
                <Label>Roles</Label>
                <div className="space-y-2 mt-2">
                  {availableRoles.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.value}
                        checked={newWorker.roles.includes(role.value)}
                        onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                      />
                      <Label htmlFor={role.value}>{role.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCreateWorker}
                  className="flex-1"
                >
                  Create Worker
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="workers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workers" className="flex items-center space-x-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Workers</span>
            <span className="sm:hidden">({workers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2 text-xs sm:text-sm">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
            <span className="sm:hidden">Perf</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Workers Tab */}
        <TabsContent value="workers">
          <div className="space-y-4">
            {/* Mobile Layout - Cards */}
            <div className="block md:hidden space-y-4">
              {workers.map((worker) => (
                <Card key={worker.id} className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                  <CardContent className="p-4">
                    {/* Worker Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">{worker.full_name}</h3>
                          <p className="text-sm text-gray-600">{worker.email}</p>
                          {worker.employee_id && (
                            <p className="text-sm text-gray-500">ID: {worker.employee_id}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge className={getStatusColor(worker.status)} variant="secondary">
                        {worker.status}
                      </Badge>
                    </div>
                    
                    {/* Roles */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {worker.roles?.map((role) => (
                          <Badge 
                            key={role.id} 
                            className={getRoleColor(role.role)}
                            variant="secondary"
                          >
                            {availableRoles.find(r => r.value === role.role)?.label || role.role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkerForPasswordChange(worker);
                          setShowPasswordChangeDialog(true);
                        }}
                        className="h-10 px-3 text-sm"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      
                      <Select
                        value={worker.status}
                        onValueChange={(value) => handleStatusChange(worker.id, value as any)}
                      >
                        <SelectTrigger className="w-32 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Layout - Cards */}
            <div className="hidden md:grid gap-4">
            {workers.map((worker) => (
              <Card key={worker.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{worker.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{worker.email}</p>
                        {worker.employee_id && (
                          <p className="text-sm text-muted-foreground">ID: {worker.employee_id}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-wrap gap-1">
                        {worker.roles?.map((role) => (
                          <Badge 
                            key={role.id} 
                            className={getRoleColor(role.role)}
                            variant="secondary"
                          >
                            {availableRoles.find(r => r.value === role.role)?.label || role.role}
                          </Badge>
                        ))}
                      </div>
                      
                      <Badge className={getStatusColor(worker.status)} variant="secondary">
                        {worker.status}
                      </Badge>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkerForPasswordChange(worker);
                            setShowPasswordChangeDialog(true);
                          }}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Change Password
                        </Button>
                        
                        <Select
                          value={worker.status}
                          onValueChange={(value) => handleStatusChange(worker.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
            
            {workers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No CS Workers</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first customer service worker.</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add CS Worker
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            {/* Performance Metrics - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Automatically distributed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Worker Performance - Mobile Optimized */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mobile Layout */}
                  <div className="block md:hidden space-y-3">
                    {workers.map((worker) => (
                      <div key={worker.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{worker.full_name}</p>
                            <p className="text-sm text-gray-500">{worker.email}</p>
                          </div>
                          <Badge className={getStatusColor(worker.status)} variant="secondary">
                            {worker.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white p-2 rounded border">
                            <p className="font-semibold text-lg">0</p>
                            <p className="text-xs text-gray-500">Assigned</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <p className="font-semibold text-lg">0</p>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <p className="font-semibold text-lg">-</p>
                            <p className="text-xs text-gray-500">Avg Time</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden md:block space-y-4">
                  {workers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{worker.full_name}</p>
                          <p className="text-sm text-gray-500">{worker.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">0</p>
                          <p className="text-gray-500">Assigned</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">0</p>
                          <p className="text-gray-500">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">-</p>
                          <p className="text-gray-500">Avg Time</p>
                        </div>
                        <Badge className={getStatusColor(worker.status)} variant="secondary">
                          {worker.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  </div>
                  
                  {workers.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No workers to show performance data for</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        

      </Tabs>

      {/* Password Display Dialog */}
      {showPassword && generatedPassword && (
        <Dialog open={showPassword} onOpenChange={setShowPassword}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle>CS Worker Created Successfully</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  ⚠️ Save this password securely. It will not be shown again.
                </p>
              </div>
              
              <div>
                <Label>Generated Password</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="text"
                    value={generatedPassword}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPassword)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button onClick={() => setShowPassword(false)} className="w-full">
                I've Saved the Password
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChangeDialog} onOpenChange={setShowPasswordChangeDialog}>
        <DialogContent className="mx-4">
          <DialogHeader>
            <DialogTitle>Change CS Worker Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Worker</Label>
              <div className="text-sm text-gray-600">
                {selectedWorkerForPasswordChange?.full_name} ({selectedWorkerForPasswordChange?.email})
              </div>
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handlePasswordChange} className="flex-1">
                Update Password
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordChangeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
