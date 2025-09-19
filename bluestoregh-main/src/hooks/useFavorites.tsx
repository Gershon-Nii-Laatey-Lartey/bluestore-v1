import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FavoriteProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  condition: string;
  brand?: string;
  model?: string;
  vendor_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  vendor_name?: string;
  category_name?: string;
  location_name?: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async (): Promise<FavoriteProduct[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          created_at,
          products!inner (
            id,
            title,
            description,
            price,
            original_price,
            images,
            condition,
            brand,
            model,
            vendor_id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to flatten the structure
      return data?.map(fav => ({
        id: fav.products.id,
        title: fav.products.title,
        description: fav.products.description,
        price: fav.products.price,
        original_price: fav.products.original_price,
        images: fav.products.images || [],
        condition: fav.products.condition,
        brand: fav.products.brand,
        model: fav.products.model,
        vendor_id: fav.products.vendor_id,
        created_at: fav.products.created_at,
        updated_at: fav.products.updated_at,
      })) || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAddToFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', user?.id] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', user?.id] });
    },
  });
};
