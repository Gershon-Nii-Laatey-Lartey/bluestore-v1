
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission } from "@/types/product";
import { transformProductData } from "./productTransforms";

export class PublicProductService {
  async getFeaturedProducts(): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .order('boost_level', { ascending: false }) // This will order: none, boost, 2x_boost (alphabetically)
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    // Manually sort to prioritize boosted products
    const sortedData = (data || []).sort((a, b) => {
      // Define boost priority order
      const boostPriority = { '2x_boost': 3, 'boost': 2, 'none': 1 };
      const aPriority = boostPriority[a.boost_level as keyof typeof boostPriority] || 1;
      const bPriority = boostPriority[b.boost_level as keyof typeof boostPriority] || 1;
      
      // First sort by boost level (descending)
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by package price (descending)
      const aPrice = parseFloat(a.package_price || '0');
      const bPrice = parseFloat(b.package_price || '0');
      if (aPrice !== bPrice) {
        return bPrice - aPrice;
      }
      
      // Finally by creation date (descending - newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sortedData.map(transformProductData);
  }

  async getProductsByCategory(category: string): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .eq('category', category)
      .order('boost_level', { ascending: false })
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    // Manually sort to prioritize boosted products
    const sortedData = (data || []).sort((a, b) => {
      // Define boost priority order
      const boostPriority = { '2x_boost': 3, 'boost': 2, 'none': 1 };
      const aPriority = boostPriority[a.boost_level as keyof typeof boostPriority] || 1;
      const bPriority = boostPriority[b.boost_level as keyof typeof boostPriority] || 1;
      
      // First sort by boost level (descending)
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by package price (descending)
      const aPrice = parseFloat(a.package_price || '0');
      const bPrice = parseFloat(b.package_price || '0');
      if (aPrice !== bPrice) {
        return bPrice - aPrice;
      }
      
      // Finally by creation date (descending - newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sortedData.map(transformProductData);
  }

  async getProductById(id: string): Promise<ProductSubmission | null> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching product by ID:', error);
      throw error;
    }

    return transformProductData(data);
  }
}
