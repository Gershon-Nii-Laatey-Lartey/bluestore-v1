
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useParams } from "react-router-dom";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";

const CategoryPage = () => {
  const { category } = useParams();
  const { data: categories = [] } = useCategories();
  const [sortBy, setSortBy] = useState("newest");
  
  // Find the category by slug (created from name)
  const currentCategory = categories.find(cat => {
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return slug === category;
  });
  
  const categoryName = currentCategory?.name || category?.replace('-', ' ') || 'Category';
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  // Fetch products for this category
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['category-products', category, currentCategory?.id],
    queryFn: async () => {
      if (!currentCategory) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', currentCategory.id)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCategory,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle sorting
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{formattedCategory}</h1>
            <p className="text-gray-600 mt-1">
              {isLoading ? "Loading products..." : `${products.length} products available`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filter</span>
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <FeaturedProducts products={sortedProducts} loading={isLoading} />
        
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading products</h3>
            <p className="text-gray-600">Please try again later</p>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">No products available in this category yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
