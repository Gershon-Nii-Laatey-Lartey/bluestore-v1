import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProductSubmission } from "@/types/product";
import { optimizedProductService } from "./optimizedProductService";

// Helper: compute expiry date based on package id and submission time
const computeExpiryDate = (product: ProductSubmission): Date | null => {
  // Do not compute for already terminal states
  if (product.status === 'expired' || product.status === 'closed' || product.status === 'rejected') {
    return null;
  }

  const submittedAt = product.submittedAt || product.created_at;
  if (!submittedAt) return null;

  const createdDate = new Date(submittedAt);
  if (isNaN(createdDate.getTime())) return null;

  const packageId = (product.package as any)?.id as string | undefined;

  switch (packageId) {
    case 'free':
      return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'starter':
      return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'standard':
      return new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'rising':
      return new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    case 'pro':
      return new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'business':
      return new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    case 'premium':
      return null; // Unlimited
    default:
      // No package or unknown → treat like free
      return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
};

export const incrementUserAdsUsed = async (userId: string) => {
  try {
    console.log('Attempting to increment ads used for user:', userId);
    
    // Use the improved database function that finds the first available subscription
    const { error } = await supabase.rpc('increment_user_ads_used', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('Database function error:', error);
      throw new Error(`Failed to increment ads used: ${error.message}`);
    }
    
    console.log('Successfully incremented ads used via database function');
  } catch (error) {
    console.error('Failed to increment user ads used:', error);
    throw error;
  }
};

// Transform database product to frontend format
const transformProductData = (data: any): ProductSubmission => {
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    category: data.category,
    condition: data.condition,
    description: data.description,
    price: data.price.toString(),
    originalPrice: data.original_price?.toString(),
    negotiable: data.negotiable || false,
    phone: data.phone,
    location: data.location,
    images: data.images || [],
    main_image_index: data.main_image_index || 0,
    package: data.package,
    packagePrice: data.package_price || 0,
    status: data.status,
    submittedAt: data.created_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    rejection_reason: data.rejection_reason,
    suggestions: data.suggestions,
    edited: data.edited || false,
    boost_level: data.boost_level
  };
};

// Helper function to convert ProductSubmission to database format
const convertToDbFormat = (updates: Partial<ProductSubmission>) => {
  const dbUpdates: any = { ...updates };
  
  // Convert frontend property names to database column names
  if (updates.originalPrice !== undefined) {
    dbUpdates.original_price = updates.originalPrice ? parseFloat(updates.originalPrice) : null;
    delete dbUpdates.originalPrice;
  }
  
  if (updates.main_image_index !== undefined) {
    dbUpdates.main_image_index = updates.main_image_index;
  }
  
  if (updates.price !== undefined) {
    dbUpdates.price = parseFloat(updates.price);
  }
  
  // Convert package to JSON format for database storage
  if (updates.package !== undefined) {
    dbUpdates.package = updates.package ? JSON.parse(JSON.stringify(updates.package)) : null;
  }
  
  // Handle boost_level
  if (updates.boost_level !== undefined) {
    dbUpdates.boost_level = updates.boost_level;
  }
  
  // Remove frontend-only properties
  delete dbUpdates.submittedAt;
  delete dbUpdates.packagePrice;
  delete dbUpdates.created_at;
  delete dbUpdates.updated_at;
  
  return dbUpdates;
};

class ProductService {
  // Search products by query (public)
  async searchProducts(query: string): Promise<ProductSubmission[]> {
    if (!query.trim()) {
      return this.getFeaturedProducts();
    }

    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('status', 'approved')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('boost_level', { ascending: false })
      .order('package_price', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
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

  // Get featured products (public)
  async getFeaturedProducts(): Promise<ProductSubmission[]> {
    return optimizedProductService.getFeaturedProducts();
  }

  // Get products by category (public)
  async getProductsByCategory(category: string): Promise<ProductSubmission[]> {
    return optimizedProductService.getProductsByCategory(category);
  }

  // Get single product by ID (public)
  async getProductById(id: string): Promise<ProductSubmission | null> {
    return optimizedProductService.getProductById(id);
  }

  // Get all product submissions (authenticated - for admin/user management)
  async getProductSubmissions(): Promise<ProductSubmission[]> {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product submissions:', error);
      throw error;
    }

    const products = (data || []).map(transformProductData);

    // Locally mark as expired if past computed expiry
    const now = Date.now();
    const productsWithLocalExpiry = products.map((p) => {
      if (p.status !== 'approved') return p;
      const expiry = computeExpiryDate(p);
      if (expiry && now >= expiry.getTime()) {
        return { ...p, status: 'expired' as const };
      }
      return p;
    });

    return productsWithLocalExpiry;
  }

  // Update product submission (authenticated)
  async updateProductSubmission(id: string, updates: Partial<ProductSubmission>) {
    const dbUpdates = convertToDbFormat(updates);
    
    const { data, error } = await supabase
      .from('product_submissions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // Edit product submission (authenticated)
  async editProductSubmission(id: string, updates: Partial<ProductSubmission>) {
    // Mark as edited and set status to pending for review
    const editUpdates: Partial<ProductSubmission> = {
      ...updates,
      edited: true,
      status: 'pending' as const
    };

    const dbUpdates = convertToDbFormat(editUpdates);

    const { data, error } = await supabase
      .from('product_submissions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error editing product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // Reactivate product submission (authenticated)
  async reactivateProductSubmission(id: string) {
    const { data, error } = await supabase
      .from('product_submissions')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error reactivating product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // Delete product submission (authenticated)
  async deleteProductSubmission(id: string) {
    const { error } = await supabase
      .from('product_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product submission:', error);
      throw error;
    }
  }

  // Boost product submission (authenticated)
  async boostProductSubmission(id: string, boostLevel: 'boost' | '2x_boost') {
    const { data, error } = await supabase
      .from('product_submissions')
      .update({ 
        boost_level: boostLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error boosting product submission:', error);
      throw error;
    }

    return transformProductData(data);
  }

  // New: Expire approved ads for a specific user directly in the database
  async expireApprovedAdsForUser(userId: string): Promise<number> {
    try {
      if (!userId) return 0;

      // Fetch this user's approved ads
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching approved ads for expiry:', error);
        return 0;
      }

      const list = (data || []).map(transformProductData);
      const now = Date.now();

      // Determine which ones are actually expired
      const expiredIds: string[] = [];
      for (const p of list) {
        const expiry = computeExpiryDate(p);
        if (expiry && now >= expiry.getTime()) {
          expiredIds.push(p.id);
        }
      }

      if (expiredIds.length === 0) return 0;

      // Update in chunks to avoid payload limits
      const chunkSize = 50;
      let updatedCount = 0;
      for (let i = 0; i < expiredIds.length; i += chunkSize) {
        const chunk = expiredIds.slice(i, i + chunkSize);
        const { error: updateError, count } = await supabase
          .from('product_submissions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .in('id', chunk)
          .select('id', { count: 'exact' });

        if (updateError) {
          console.error('Error updating expired ads chunk:', updateError);
          // continue with others
          continue;
        }
        updatedCount += typeof count === 'number' ? count : chunk.length;
      }

      return updatedCount;
    } catch (e) {
      console.error('Unexpected error expiring ads for user:', e);
      return 0;
    }
  }

  // New: Expire all approved ads in the database (admin function)
  async expireAllApprovedAds(): Promise<number> {
    try {
      // Fetch all approved ads
      const { data, error } = await supabase
        .from('product_submissions')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching all approved ads for expiry:', error);
        return 0;
      }

      const list = (data || []).map(transformProductData);
      const now = Date.now();

      // Determine which ones are actually expired
      const expiredIds: string[] = [];
      for (const p of list) {
        const expiry = computeExpiryDate(p);
        if (expiry && now >= expiry.getTime()) {
          expiredIds.push(p.id);
        }
      }

      if (expiredIds.length === 0) return 0;

      // Update in chunks to avoid payload limits
      const chunkSize = 50;
      let updatedCount = 0;
      for (let i = 0; i < expiredIds.length; i += chunkSize) {
        const chunk = expiredIds.slice(i, i + chunkSize);
        const { error: updateError, count } = await supabase
          .from('product_submissions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .in('id', chunk)
          .select('id', { count: 'exact' });

        if (updateError) {
          console.error('Error updating expired ads chunk:', updateError);
          // continue with others
          continue;
        }
        updatedCount += typeof count === 'number' ? count : chunk.length;
      }

      console.log(`Admin expiry sync: marked ${updatedCount} ads as expired`);
      return updatedCount;
    } catch (e) {
      console.error('Unexpected error expiring all ads:', e);
      return 0;
    }
  }
}

// Export the service instance
export const productService = new ProductService();
