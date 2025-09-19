import { supabase } from "@/integrations/supabase/client";

export interface Product {
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
  };
}

export interface User {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  user_type: 'buyer' | 'vendor' | 'admin';
  phone?: string;
  location_id?: string;
  bio?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  location?: {
    id: string;
    city: string;
    state_province: string;
    country: string;
  };
  roles?: {
    role: 'admin' | 'moderator' | 'user';
  }[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  country: string;
  state_province?: string;
  city?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'product' | 'order' | 'system' | 'promotion';
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalLocations: number;
  pendingProducts: number;
  verifiedUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

class AdminService {
  // Get admin dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const [
        usersResult,
        productsResult,
        categoriesResult,
        locationsResult,
        verifiedUsersResult,
        walletResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' }),
        supabase.from('locations').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_verified', true),
        supabase.from('user_wallet').select('total_earned')
      ]);

      const totalUsers = usersResult.count || 0;
      const totalProducts = productsResult.count || 0;
      const totalCategories = categoriesResult.count || 0;
      const totalLocations = locationsResult.count || 0;
      const verifiedUsers = verifiedUsersResult.count || 0;
      
      // Calculate total revenue from wallet data
      const totalRevenue = walletResult.data?.reduce((sum, wallet) => sum + (wallet.total_earned || 0), 0) || 0;

      return {
        totalUsers,
        totalProducts,
        totalCategories,
        totalLocations,
        pendingProducts: 0, // No pending products in current schema
        verifiedUsers,
        totalRevenue,
        monthlyGrowth: 12.5 // Mock data for now
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // Get all products with pagination
  async getProducts(page = 1, limit = 20): Promise<{ products: Product[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name),
          location:locations(id, city, state_province, country)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get vendor information separately since there's no direct foreign key
      const productsWithVendors = await Promise.all(
        (data || []).map(async (product) => {
          const { data: vendorData } = await supabase
            .from('profiles')
            .select('id, username, full_name')
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
      throw error;
    }
  }

  // Get all users with pagination
  async getUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('profiles')
        .select(`
          *,
          location:locations(id, city, state_province, country)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get user roles separately since there's no direct foreign key
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.user_id);
          
          return {
            ...user,
            roles: rolesData || []
          };
        })
      );

      return {
        users: usersWithRoles,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get all locations
  async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('country, state_province, city');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        notifications: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Update product availability
  async updateProductAvailability(productId: string, isAvailable: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: isAvailable })
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating product availability:', error);
      throw error;
    }
  }

  // Update product featured status
  async updateProductFeatured(productId: string, isFeatured: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating product featured status:', error);
      throw error;
    }
  }

  // Update user verification status
  async updateUserVerification(userId: string, isVerified: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user verification:', error);
      throw error;
    }
  }

  // Add new category
  async addCategory(name: string, description?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name, description });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Update category
  async updateCategory(categoryId: string, name: string, description?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name, description })
        .eq('id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Add new location
  async addLocation(country: string, stateProvince?: string, city?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .insert({ country, state_province: stateProvince, city });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  }

  // Update location
  async updateLocation(locationId: string, country: string, stateProvince?: string, city?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ country, state_province: stateProvince, city })
        .eq('id', locationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Delete location
  async deleteLocation(locationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
