import { supabase } from "@/integrations/supabase/client";
import { optimizedProductService } from "./optimizedProductService";
import { QueryClient } from "@tanstack/react-query";

class CacheInvalidationService {
  /**
   * Invalidate all caches related to a specific product
   */
  async invalidateProductCache(productId: string, queryClient?: QueryClient): Promise<void> {
    try {
      // Invalidate optimized product service cache
      if (optimizedProductService && typeof optimizedProductService.invalidateCache === 'function') {
        optimizedProductService.invalidateCache('getProductById', { id: productId });
        optimizedProductService.invalidateCache('getFeaturedProducts');
        optimizedProductService.invalidateCache('getProductsByCategory');
      }

      // Invalidate Supabase cache by making a small query
      // This forces Supabase to refresh its internal cache
      await supabase
        .from('product_submissions')
        .select('id')
        .eq('id', productId)
        .limit(1);

      // Invalidate React Query caches if queryClient is provided
      if (queryClient) {
        queryClient.invalidateQueries(['featured-products']);
        queryClient.invalidateQueries(['my-ads']);
        queryClient.invalidateQueries(['favorites']);
        queryClient.invalidateQueries(['search-results']);
      }

    } catch (error) {
      console.error('Error invalidating product cache:', error);
    }
  }

  /**
   * Invalidate all product-related caches
   */
  async invalidateAllProductCaches(queryClient?: QueryClient): Promise<void> {
    try {
      // Invalidate all optimized product service caches
      if (optimizedProductService && typeof optimizedProductService.invalidateCache === 'function') {
        optimizedProductService.invalidateCache();
      }
      
      // Force refresh of featured products
      await supabase
        .from('product_submissions')
        .select('id')
        .eq('status', 'approved')
        .limit(1);

      // Invalidate React Query caches if queryClient is provided
      if (queryClient) {
        queryClient.invalidateQueries(['featured-products']);
        queryClient.invalidateQueries(['my-ads']);
        queryClient.invalidateQueries(['favorites']);
        queryClient.invalidateQueries(['search-results']);
      }

    } catch (error) {
      console.error('Error invalidating all product caches:', error);
    }
  }

  /**
   * Invalidate user-specific caches
   */
  async invalidateUserCaches(userId: string): Promise<void> {
    try {
      // Invalidate user's ads cache
      await supabase
        .from('product_submissions')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      // Invalidate user's favorites cache
      await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

    } catch (error) {
      console.error('Error invalidating user caches:', error);
    }
  }
}

export const cacheInvalidationService = new CacheInvalidationService();
