import { supabase } from "@/integrations/supabase/client";

export interface ProductDetail {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string;
  location_id?: string;
  condition: string;
  brand?: string;
  model?: string;
  images?: string[];
  features?: string[];
  specifications?: Record<string, any>;
  is_featured: boolean;
  is_available: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    city: string;
    state_province: string;
    country: string;
  };
  vendor?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    is_verified: boolean;
  };
}

export interface RelatedProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  images?: string[];
  vendor_id: string;
  vendor?: {
    username: string;
    full_name: string;
  };
}

class ProductService {
  // Get product by ID with all related data
  async getProductById(productId: string): Promise<ProductDetail | null> {
    try {
      // First get the product with category and location
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name),
          location:locations(id, city, state_province, country)
        `)
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        return null;
      }

      if (!productData) return null;

      // Get vendor information separately
      const { data: vendorData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, phone, is_verified')
        .eq('user_id', productData.vendor_id)
        .single();

      // Increment view count
      await supabase
        .from('products')
        .update({ view_count: productData.view_count + 1 })
        .eq('id', productId);

      return {
        ...productData,
        vendor: vendorData || null
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Get related products by category
  async getRelatedProducts(productId: string, categoryId?: string, limit = 4): Promise<RelatedProduct[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          original_price,
          images,
          vendor_id
        `)
        .eq('is_available', true)
        .neq('id', productId);

      // If category is provided, filter by category
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching related products:', error);
        return [];
      }

      // Get vendor information separately for each product
      const productsWithVendors = await Promise.all(
        (data || []).map(async (product) => {
          const { data: vendorData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', product.vendor_id)
            .single();
          
          return {
            ...product,
            vendor: vendorData || null
          };
        })
      );

      return productsWithVendors;
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId: string, limit = 20): Promise<RelatedProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          original_price,
          images,
          vendor_id
        `)
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching products by category:', error);
        return [];
      }

      // Get vendor information separately for each product
      const productsWithVendors = await Promise.all(
        (data || []).map(async (product) => {
          const { data: vendorData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', product.vendor_id)
            .single();
          
          return {
            ...product,
            vendor: vendorData || null
          };
        })
      );

      return productsWithVendors;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Get all products for search/listing
  async getAllProducts(page = 1, limit = 20): Promise<{ products: RelatedProduct[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          original_price,
          images,
          vendor_id
        `, { count: 'exact' })
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching products:', error);
        return { products: [], total: 0 };
      }

      // Get vendor information separately for each product
      const productsWithVendors = await Promise.all(
        (data || []).map(async (product) => {
          const { data: vendorData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', product.vendor_id)
            .single();
          
          return {
            ...product,
            vendor: vendorData || null
          };
        })
      );

      return {
        products: productsWithVendors,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [], total: 0 };
    }
  }
}

export const productService = new ProductService();
