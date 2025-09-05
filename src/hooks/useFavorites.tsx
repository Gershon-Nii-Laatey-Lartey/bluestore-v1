
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useState } from "react";
import { ProductSubmission } from "@/types/product";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async (): Promise<ProductSubmission[]> => {
    if (!user) return [];

    // Get user's favorite product IDs
    const { data: favorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('product_id')
      .eq('user_id', user.id);

    if (favoritesError) throw favoritesError;

    if (!favorites || favorites.length === 0) {
      return [];
    }

    // Get the actual product data for favorite products
    const productIds = favorites.map(fav => fav.product_id);
    const { data: products, error: productsError } = await supabase
      .from('product_submissions')
      .select('*')
      .in('id', productIds)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    return products || [];
  }, [user]);

  const {
    data: favorites = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: fetchFavorites,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });

  // Function to manually refresh data
  const refreshFavorites = useCallback(() => {
    queryClient.invalidateQueries(['favorites', user?.id]);
  }, [queryClient, user?.id]);

  // Add to favorites function
  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) {
      throw new Error('User must be logged in to add favorites');
    }

    if (pendingOperations.has(productId)) {
      return; // Prevent duplicate operations
    }

    // Add to pending operations
    setPendingOperations(prev => new Set(prev).add(productId));

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the favorites list
      refreshFavorites();
      return data;
    } finally {
      // Remove from pending operations
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [user, refreshFavorites, pendingOperations]);

  // Remove from favorites function
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) {
      throw new Error('User must be logged in to remove favorites');
    }

    if (pendingOperations.has(productId)) {
      return; // Prevent duplicate operations
    }

    // Add to pending operations
    setPendingOperations(prev => new Set(prev).add(productId));

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      // Refresh the favorites list
      refreshFavorites();
    } finally {
      // Remove from pending operations
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [user, refreshFavorites, pendingOperations]);

  // Check if product is favorite
  const isFavorite = useCallback((productId: string) => {
    return favorites.some(fav => fav.id === productId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Check if operation is pending for a specific product
  const isPending = useCallback((productId: string) => {
    return pendingOperations.has(productId);
  }, [pendingOperations]);

  return {
    favorites,
    isLoading,
    error,
    isFetching,
    refetch: refreshFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isPending,
  };
};
