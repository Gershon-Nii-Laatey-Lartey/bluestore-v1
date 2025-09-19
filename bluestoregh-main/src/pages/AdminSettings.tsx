
import { useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Globe, Bell, Shield, Database } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "BlueStore",
    siteDescription: "Ghana's Premier Marketplace",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveAds: false,
    maxAdImages: "5",
    adDuration: "30",
    commission: "2.5"
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Here you would save settings to backend
    toast({
      title: "Settings Saved",
      description: "Platform settings have been updated successfully.",
    });
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="p-8 pt-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
              <p className="text-gray-600">Configure platform settings and preferences.</p>
            </div>

            <div className="space-y-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>General Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Enable maintenance mode to prevent user access</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={() => handleToggle('maintenanceMode')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* User Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>User Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Registration</Label>
                      <p className="text-sm text-gray-500">Allow new users to register</p>
                    </div>
                    <Switch
                      checked={settings.userRegistration}
                      onCheckedChange={() => handleToggle('userRegistration')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={() => handleToggle('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Send SMS notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={() => handleToggle('smsNotifications')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ad Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Advertisement Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve Ads</Label>
                      <p className="text-sm text-gray-500">Automatically approve new advertisements</p>
                    </div>
                    <Switch
                      checked={settings.autoApproveAds}
                      onCheckedChange={() => handleToggle('autoApproveAds')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAdImages">Max Images per Ad</Label>
                      <Input
                        id="maxAdImages"
                        type="number"
                        value={settings.maxAdImages}
                        onChange={(e) => handleInputChange('maxAdImages', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adDuration">Ad Duration (days)</Label>
                      <Input
                        id="adDuration"
                        type="number"
                        value={settings.adDuration}
                        onChange={(e) => handleInputChange('adDuration', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission">Commission (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        step="0.1"
                        value={settings.commission}
                        onChange={(e) => handleInputChange('commission', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="px-8">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminSettings;
