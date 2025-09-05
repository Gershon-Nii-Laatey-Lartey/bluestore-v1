import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";
import { ProductSubmission } from "@/types/product";

export const useMyAds = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchMyAds = useCallback(async (): Promise<ProductSubmission[]> => {
    if (!user) return [];

    const { data: products, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return products || [];
  }, [user]);

  const {
    data: myAds = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['my-ads', user?.id],
    queryFn: fetchMyAds,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });

  // Function to manually refresh data
  const refreshMyAds = useCallback(() => {
    queryClient.invalidateQueries(['my-ads', user?.id]);
  }, [queryClient, user?.id]);

  return {
    myAds,
    isLoading,
    error,
    isFetching,
    refetch: refreshMyAds,
  };
};
