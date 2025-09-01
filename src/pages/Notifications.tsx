
// Updated to use React Query hooks - cache busting
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, CheckCheck, Trash2, Filter, Search, Loader2 } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { BackgroundLoadingIndicator } from "@/components/ui/background-loading-indicator";

const Notifications = () => {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { notifications, isLoading: loading, isFetching, refetch } = useNotifications();

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id, user?.id);
      // Refetch notifications to get updated state
      refetch();
      toast({
        title: "Success",
        description: "Notification marked as read"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id);
      // Refetch notifications to get updated state
      refetch();
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id, user?.id);
      // Refetch notifications to get updated state
      refetch();
      toast({
        title: "Success",
        description: "Notification deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Please sign in to view your notifications.</p>
        </div>
      </Layout>
    );
  }

  if (isMobile) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">Stay updated with your latest activities</p>
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{unreadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex space-x-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Mobile Notifications List */}
          <BackgroundLoadingIndicator isFetching={isFetching} />
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredNotifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notifications found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery || filterType !== 'all' 
                      ? "Try adjusting your search or filter criteria."
                      : "You're all caught up! Check back later for new updates."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <div key={notification.id}>
                  <Card className={`${!notification.read ? 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-700' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <Badge className="h-2 w-2 bg-blue-600 rounded-full p-0"></Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            <div className="flex space-x-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
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
      
      <div className="animate-fade-in">
        {isMobile ? (
          // Mobile layout handled above
          null
        ) : (
          // Desktop Layout
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400">Stay updated with your latest activities and platform updates</p>
            </div>

            {/* Desktop Stats and Controls */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{unreadCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalCount - unreadCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Filtered</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{filteredNotifications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            </div>

            {/* Desktop Notifications Grid */}
            <BackgroundLoadingIndicator isFetching={isFetching} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredNotifications.length === 0 ? (
                <div className="col-span-1 lg:col-span-2">
                  <Card className="text-center py-12">
                    <CardContent>
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notifications found</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery || filterType !== 'all' 
                          ? "Try adjusting your search or filter criteria."
                          : "You're all caught up! Check back later for new updates."
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div key={notification.id}>
                    <Card className={`${!notification.read ? 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-700' : ''} hover:shadow-md transition-shadow`}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={getTypeColor(notification.type)}>
                                  {notification.type}
                                </Badge>
                                {!notification.read && (
                                  <Badge className="h-2 w-2 bg-blue-600 rounded-full p-0"></Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400 dark:text-gray-500">
                                {formatDate(notification.created_at)}
                              </span>
                              <div className="flex space-x-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark Read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
