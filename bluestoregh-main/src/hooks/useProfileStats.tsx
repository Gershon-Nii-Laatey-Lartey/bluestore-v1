import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';

interface ProfileStats {
  publishedAds: number;
  favorites: number;
  loading: boolean;
}

export const useProfileStats = (): ProfileStats => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchStats = useCallback(async () => {
    if (!user) {
      return { publishedAds: 0, favorites: 0 };
    }

    // Fetch published ads count from products table
    const { count: adsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('vendor_id', user.id)
      .eq('is_available', true);

    // Fetch favorites count from user_favorites table
    const { count: favoritesCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return {
      publishedAds: adsCount || 0,
      favorites: favoritesCount || 0
    };
  }, [user]);

  const {
    data: stats = { publishedAds: 0, favorites: 0 },
    isLoading,
    error
  } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: fetchStats,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });

  // Function to manually refresh stats when needed
  const refreshStats = useCallback(() => {
    queryClient.invalidateQueries(['profile-stats', user?.id]);
  }, [queryClient, user?.id]);

  return {
    publishedAds: stats.publishedAds,
    favorites: stats.favorites,
    loading: isLoading
  };
};
