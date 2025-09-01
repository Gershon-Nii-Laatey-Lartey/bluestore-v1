import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    if (!user) return [];

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return notifications || [];
  }, [user]);

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: fetchNotifications,
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Function to manually refresh data
  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries(['notifications', user?.id]);
  }, [queryClient, user?.id]);

  return {
    notifications,
    isLoading,
    error,
    isFetching,
    refetch: refreshNotifications,
  };
};
