import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  query?: string;
  category?: string;
  condition?: string;
  priceRange?: [number, number];
  location?: string;
  negotiable?: boolean | null;
  dateRange?: string;
  sortBy?: string;
}

export interface Product {
  id: string;
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
  vendor_id: string;
  // Joined data
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
}

export class SearchService {
  static async searchProducts(filters: SearchFilters = {}): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        location:locations(id, city, state_province, country)
      `)
      .eq('is_available', true);

    // Apply filters
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%,model.ilike.%${filters.query}%`);
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category);
    }

    if (filters.condition && filters.condition !== 'all') {
      query = query.eq('condition', filters.condition);
    }

    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }

    if (filters.location) {
      query = query.ilike('location.city', `%${filters.location}%`);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most-viewed':
        query = query.order('view_count', { ascending: false });
        break;
      case 'name':
        query = query.order('title', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    return data || [];
  }

  static async getCategories(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Categories error:', error);
      throw error;
    }

    return data || [];
  }

  static async getLocations(): Promise<{ id: string; city: string; state_province: string; country: string }[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('id, city, state_province, country')
      .order('city');

    if (error) {
      console.error('Locations error:', error);
      throw error;
    }

    return data || [];
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        location:locations(id, city, state_province, country)
      `)
      .eq('is_available', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Featured products error:', error);
      throw error;
    }

    return data || [];
  }
}
