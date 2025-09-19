import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { User, Settings, Plus, Bell, HelpCircle, LogOut, Package, ShoppingBag, Store, Edit, Calendar, MapPin, Phone, Mail, BarChart3, Shield, Users, MessageSquare, Crown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStats } from "@/hooks/useProfileStats";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const { publishedAds, favorites, loading: statsLoading } = useProfileStats();
  const { isAdmin, isCSWorker, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  const menuItems = [
    { icon: Wallet, label: "Wallet", href: "/wallet", description: "Manage your wallet and transactions" },
    { icon: ShoppingBag, label: "My Ads", href: "/my-ads", description: "Manage your published advertisements" },
    { icon: Bell, label: "Notifications", href: "/notifications", description: "View your notifications and alerts" },
    { icon: Settings, label: "Settings", href: "/settings", description: "Manage your account settings" },
    { icon: HelpCircle, label: "Help & Support", href: "/support", description: "Get help and contact support" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email || "User";
  const initials = profile?.full_name ? getInitials(profile.full_name) : (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Dashboard links based on user type
  const getDashboardLinks = () => {
    const baseLinks = [
      { icon: Plus, label: "Publish Ad", href: "/publish", description: "Create and publish new product listings", bgColor: "bg-blue-600/10", color: "text-blue-600" },
    ];

    // Add vendor-specific links
    if (profile?.user_type === 'vendor') {
      baseLinks.push(
        { icon: Store, label: "My Vendor Profile", href: "/my-vendor-profile", description: "View and edit your vendor profile", bgColor: "bg-purple-600/10", color: "text-purple-600" },
        { icon: Package, label: "Package Selection", href: "/package-selection", description: "Choose subscription packages", bgColor: "bg-orange-600/10", color: "text-orange-600" }
      );
    }

    // Add admin links
    if (isAdmin) {
      baseLinks.push(
        { icon: Shield, label: "Admin Dashboard", href: "/admin", description: "Access admin controls and management", bgColor: "bg-red-600/10", color: "text-red-600" },
        { icon: Users, label: "User Management", href: "/admin/users", description: "Manage users and permissions", bgColor: "bg-red-600/10", color: "text-red-600" }
      );
    }

    // Add CS Worker links
    if (isCSWorker) {
      baseLinks.push(
        { icon: MessageSquare, label: "Customer Service", href: "/customer-service", description: "Customer support management", bgColor: "bg-teal-600/10", color: "text-teal-600" }
      );
    }

    return baseLinks;
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your profile</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
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
      
      {isMobile ? (
        // Mobile Layout
        <div className="animate-fade-in px-4 pb-20">
          {/* Profile Header */}
          <Card className="mb-6 w-full bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-blue-100 dark:bg-primary/10 text-blue-600 dark:text-primary text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-card-foreground truncate">{displayName}</h2>
                  <p className="text-muted-foreground truncate">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(profile?.created_at || user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="shrink-0"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8 w-full">
            <Card className="w-full bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-primary">
                  {statsLoading ? "..." : publishedAds}
                </div>
                <div className="text-sm text-muted-foreground">Published Ads</div>
              </CardContent>
            </Card>
            <Card className="w-full bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statsLoading ? "..." : favorites}
                </div>
                <div className="text-sm text-muted-foreground">Favorites</div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Links */}
          {!rolesLoading && getDashboardLinks().length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Dashboard Access</h3>
              <div className="space-y-4">
                {getDashboardLinks().map((link) => (
                  <Link key={link.href} to={link.href}>
                    <Card className="w-full hover:shadow-md transition-shadow cursor-pointer border-2 border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 ${link.bgColor} rounded-lg`}>
                            <link.icon className={`h-5 w-5 ${link.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-card-foreground">{link.label}</h3>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                          </div>
                          <div className="text-muted-foreground">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Account</h3>
            <div className="grid gap-y-3">
              {menuItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Card className="w-full hover:shadow-md transition-shadow cursor-pointer bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-card-foreground">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-muted-foreground">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

      ) : (
        // Desktop Layout
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-blue-600/10 text-blue-600 text-2xl font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-card-foreground mb-1">{displayName}</h2>
                    <p className="text-muted-foreground mb-2">{user?.email}</p>
                    <Badge variant="secondary" className="mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Member since {new Date(profile?.created_at || user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Badge>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/settings')}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 border-t pt-6">
                    {profile?.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {profile.phone}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </div>
                    {profile?.bio && (
                      <div className="text-sm text-muted-foreground">
                        {profile.bio}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Dashboard */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Published Ads</p>
                            <p className="text-2xl font-bold text-blue-600">{publishedAds}</p>
                          </div>
                          <ShoppingBag className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                            <p className="text-2xl font-bold text-green-600">{favorites}</p>
                          </div>
                          <User className="h-8 w-8 text-green-600" />
                        </div>
            </CardContent>
          </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getDashboardLinks().slice(0, 4).map((item) => (
                        <Link key={item.label} to={item.href}>
                          <Button variant="outline" className="w-full h-auto p-4 justify-start">
                            <item.icon className="h-5 w-5 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                          </Button>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Activity tracking coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
        </div>
      </div>
      )}
    </Layout>
  );
};

export default Profile;
