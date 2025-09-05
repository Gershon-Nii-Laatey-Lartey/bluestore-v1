
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Settings as SettingsIcon, Shield, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { OnlineStatusSettings } from "@/components/OnlineStatusSettings";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: ""
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load vendor profile to get the most up-to-date phone number
        const { data: vendorProfile } = await supabase
          .from('vendor_profiles')
          .select('phone, location')
          .eq('user_id', user.id)
          .single();

        setFormData({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: vendorProfile?.phone || user.user_metadata?.phone || "",
          location: vendorProfile?.location || user.user_metadata?.location || ""
        });
      } catch (error) {
        console.error('Error loading vendor profile:', error);
        // Fallback to user metadata if vendor profile not found
        setFormData({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          location: user.user_metadata?.location || ""
        });
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update user metadata
      const { error: userError } = await user.update({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location
        }
      });

      if (userError) throw userError;

      // Update vendor profile if it exists
      try {
        const { error: vendorError } = await supabase
          .from('vendor_profiles')
          .update({
            phone: formData.phone,
            location: formData.location
          })
          .eq('user_id', user.id);

        if (vendorError) {
          console.warn('Could not update vendor profile:', vendorError);
        }
      } catch (vendorError) {
        console.warn('Vendor profile update failed:', vendorError);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">Please log in</h2>
          <p className="text-gray-600 dark:text-gray-400">You need to be logged in to access settings.</p>
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
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and settings</p>
        </div>
        
        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                  {getInitials(formData.full_name || user.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" disabled>
                  Change Photo
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Photo upload coming soon</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications on your device</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive promotional and marketing emails</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Updates</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about order status changes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Button variant="outline" className="w-full" disabled>
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Online Status Settings */}
        <OnlineStatusSettings />

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save Drafts</Label>
                <p className="text-sm text-muted-foreground">Automatically save ad drafts</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Product Recommendations</Label>
                <p className="text-sm text-muted-foreground">Get personalized product suggestions</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Location Services</Label>
                <p className="text-sm text-muted-foreground">Use your location for better recommendations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
