
import { supabase } from "@/integrations/supabase/client";

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  location?: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  topSearchTerms: Array<{ query: string; count: number }>;
  searchesByLocation: Array<{ location: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
}

class SearchService {
  private readonly STORAGE_KEY = 'bluestore_search_history';
  private readonly MAX_MOBILE_HISTORY = 4;
  private readonly MAX_DESKTOP_HISTORY = 10;

  // Get search history from localStorage (for quick access)
  getSearchHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const history: SearchHistoryItem[] = JSON.parse(stored);
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Add search query to both localStorage and database
  async addToHistory(query: string, location?: string): Promise<void> {
    if (!query.trim()) return;

    try {
      // Add to localStorage for quick access
      const history = this.getSearchHistory();
      const existingIndex = history.findIndex(item => 
        item.query.toLowerCase() === query.toLowerCase()
      );

      // Remove existing entry if found
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }

      // Add new entry at the beginning
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
        location
      };

      history.unshift(newItem);

      // Limit history size based on screen size
      const maxHistory = window.innerWidth < 768 ? this.MAX_MOBILE_HISTORY : this.MAX_DESKTOP_HISTORY;
      const trimmedHistory = history.slice(0, maxHistory);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));

      // Also store in database for analytics
      await this.storeSearchInDatabase(query, location);
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  // Store search in database for analytics
  private async storeSearchInDatabase(query: string, location?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: user?.id || null,
          search_query: query.trim(),
          location: location || null,
          results_count: 0 // This will be updated when we get search results
        });

      if (error) {
        console.error('Error storing search in database:', error);
      }
    } catch (error) {
      console.error('Error storing search in database:', error);
    }
  }

  // Remove item from search history
  removeFromHistory(id: string): void {
    try {
      const history = this.getSearchHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  // Clear all search history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Get search analytics for admin
  async getSearchAnalytics(days: number = 30): Promise<SearchAnalytics> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const searches = data || [];
      
      // Calculate analytics
      const totalSearches = searches.length;
      const uniqueQueries = new Set(searches.map(s => s.search_query.toLowerCase())).size;
      
      // Top search terms
      const queryCount = searches.reduce((acc, search) => {
        const query = search.search_query.toLowerCase();
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSearchTerms = Object.entries(queryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // Searches by location
      const locationCount = searches.reduce((acc, search) => {
        if (search.location) {
          acc[search.location] = (acc[search.location] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const searchesByLocation = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }));

      // Search trends (daily)
      const trends = searches.reduce((acc, search) => {
        const date = new Date(search.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const searchTrends = Object.entries(trends)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

      return {
        totalSearches,
        uniqueQueries,
        topSearchTerms,
        searchesByLocation,
        searchTrends
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        topSearchTerms: [],
        searchesByLocation: [],
        searchTrends: []
      };
    }
  }

  // Search products with location filtering
  async searchProducts(query: string, location?: string, filters?: any) {
    try {
      console.log('SearchService: Searching products with query:', query, 'location:', location);
      
      if (!query.trim()) {
        // If no query, return all approved products
        const { data, error } = await supabase
          .from('product_submissions')
          .select('*')
          .eq('status', 'approved')
          .order('boost_level', { ascending: false })
          .order('package_price', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const products = (data || []).map(this.transformProductData);
        const filteredProducts = this.applyLocationFilter(products, location);
        
        // Record search history with results count
        await this.recordSearchWithResults(query, location, filteredProducts.length);
        
        return {
          products: filteredProducts,
          totalCount: filteredProducts.length,
          location: location
        };
      }

      // Build search query with multiple fields
      let searchQuery = supabase
        .from('product_submissions')
        .select('*')
        .eq('status', 'approved');

      // Apply text search across multiple fields
      const searchTerms = query.trim().toLowerCase().split(/\s+/);
      const searchConditions = searchTerms.map(term => 
        `title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
      ).join(',');

      searchQuery = searchQuery.or(searchConditions);

      // Apply additional filters if provided
      if (filters) {
        if (filters.category && filters.category !== 'all') {
          searchQuery = searchQuery.eq('category', filters.category);
        }
        
        if (filters.condition && filters.condition !== 'all') {
          searchQuery = searchQuery.eq('condition', filters.condition);
        }
        
        if (filters.priceRange && filters.priceRange.length === 2) {
          searchQuery = searchQuery
            .gte('price', filters.priceRange[0])
            .lte('price', filters.priceRange[1]);
        }
        
        if (filters.negotiable !== null) {
          searchQuery = searchQuery.eq('negotiable', filters.negotiable);
        }
      }

      // Apply sorting
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            searchQuery = searchQuery.order('created_at', { ascending: false });
            break;
          case 'oldest':
            searchQuery = searchQuery.order('created_at', { ascending: true });
            break;
          case 'price_low':
            searchQuery = searchQuery.order('price', { ascending: true });
            break;
          case 'price_high':
            searchQuery = searchQuery.order('price', { ascending: false });
            break;
          case 'location':
            // For location-based sorting, we'll sort by proximity to user location
            // This is a simplified implementation - in production you'd use PostGIS
            searchQuery = searchQuery.order('location', { ascending: true });
            break;
          default: // 'relevance'
            searchQuery = searchQuery
              .order('boost_level', { ascending: false })
              .order('package_price', { ascending: false })
              .order('created_at', { ascending: false });
        }
      } else {
        // Default sorting: boost level, then package price, then date
        searchQuery = searchQuery
          .order('boost_level', { ascending: false })
          .order('package_price', { ascending: false })
          .order('created_at', { ascending: false });
      }

      // Limit results for performance
      searchQuery = searchQuery.limit(100);

      const { data, error } = await searchQuery;

      if (error) {
        console.error('SearchService: Database error:', error);
        throw error;
      }

      // Transform and filter results
      const products = (data || []).map(this.transformProductData);
      const filteredProducts = this.applyLocationFilter(products, location);
      
      // Apply additional client-side filtering for complex queries
      const finalProducts = this.applyAdvancedFilters(filteredProducts, filters);
      
      console.log(`SearchService: Found ${finalProducts.length} products for query: "${query}"`);
      
      // Record search history with results count
      await this.recordSearchWithResults(query, location, finalProducts.length);
      
      return {
        products: finalProducts,
        totalCount: finalProducts.length,
        location: location
      };
    } catch (error) {
      console.error('SearchService: Error searching products:', error);
      return {
        products: [],
        totalCount: 0,
        location: location
      };
    }
  }

  // Transform database product to frontend format
  private transformProductData = (data: any) => {
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

  // Apply location-based filtering
  private applyLocationFilter(products: any[], location?: string) {
    if (!location || location === 'Accra, Greater Accra Region') {
      return products;
    }

    return products.filter(product => 
      product.location && 
      product.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Apply advanced client-side filters
  private applyAdvancedFilters(products: any[], filters?: any) {
    if (!filters) return products;

    let filtered = [...products];

    // Date range filtering
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter(product => 
        new Date(product.created_at) >= cutoffDate
      );
    }

    return filtered;
  }

  // Record search with results count in one operation
  private async recordSearchWithResults(query: string, location?: string, count: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only record if there's a query (don't record empty searches)
      if (!query.trim()) return;
      
      // Record search history with results count in one operation
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: user?.id || null,
          search_query: query.trim(),
          location: location || null,
          results_count: count
        });

      if (error) {
        console.error('Error recording search with results:', error);
      } else {
        console.log(`SearchService: Recorded search "${query}" with ${count} results`);
      }
    } catch (error) {
      console.error('Error recording search with results:', error);
    }
  }
}

export const searchService = new SearchService();
