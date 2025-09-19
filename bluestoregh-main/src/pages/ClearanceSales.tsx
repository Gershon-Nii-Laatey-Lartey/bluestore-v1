
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share, Filter, SlidersHorizontal, Percent, DollarSign, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { EmergingModal } from "@/components/ui/EmergingModal";
import { useAddToFavorites, useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

// Memoized FilterDialog component
const FilterDialog = memo(({ 
  showFilters, 
  setShowFilters, 
  activeFilters, 
  filters, 
  setFilters, 
  clearFilters,
  sortOptions,
  dateRanges 
}: {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilters: string[];
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  sortOptions: any[];
  dateRanges: any[];
}) => {
  const isMobile = useIsMobile();
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setShowFilters(false);
      }, 0);
    } else {
      setShowFilters(true);
    }
  };

  return (
    <>
      {/* Mobile Bottom Sheet */}
      {isMobile ? (
        <div className={`fixed inset-0 z-[60] transition-all duration-300 ease-out ${
          showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Bottom Sheet */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
            showFilters ? 'translate-y-0' : 'translate-y-full'
          }`} style={{ maxHeight: '92vh' }}>
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Clearance Filters
                </h2>
                <div className="flex items-center gap-2">
                  {activeFilters.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 120px)' }}>
              {/* Sort Options */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Sort By</h3>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Range */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Discount Range</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Min Discount %</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.discountRange?.[0] || 0}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        discountRange: [parseInt(e.target.value) || 0, prev.discountRange?.[1] || 100] as [number, number]
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Max Discount %</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={filters.discountRange?.[1] || 100}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        discountRange: [prev.discountRange?.[0] || 0, parseInt(e.target.value) || 100] as [number, number]
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Min Price</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.priceRange?.[0] || 0}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        priceRange: [parseInt(e.target.value) || 0, prev.priceRange?.[1] || 1000000] as [number, number]
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Max Price</Label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={filters.priceRange?.[1] || 1000000}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        priceRange: [prev.priceRange?.[0] || 0, parseInt(e.target.value) || 1000000] as [number, number]
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Modal */
        <EmergingModal open={showFilters} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" className="hidden">
              Open Filters
            </Button>
          </DialogTrigger>
          <DialogDescription className="sr-only">
            Filter clearance products
          </DialogDescription>
        </EmergingModal>
      )}
    </>
  );
});

FilterDialog.displayName = 'FilterDialog';

const ClearanceSales = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const addToFavorites = useAddToFavorites();
  const { data: userFavorites = [] } = useFavorites();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [addingToFavorites, setAddingToFavorites] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    searchQuery: "",
    sortBy: "discount-high",
    discountRange: [0, 100] as [number, number],
    priceRange: [0, 1000000] as [number, number],
    dateRange: "all"
  });

  const sortOptions = [
    { value: "discount-high", label: "Highest Discount" },
    { value: "discount-low", label: "Lowest Discount" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" }
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  // Fetch clearance products (products with original_price > price)
  const { data: clearanceProducts = [], isLoading, error } = useQuery({
    queryKey: ['clearance-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name),
          location:locations(id, city, state_province, country)
        `)
        .eq('is_available', true)
        .not('original_price', 'is', null);

      // Apply filters
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,brand.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%`);
      }

      if (filters.priceRange) {
        query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
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
        case 'discount-high':
          // Sort by discount percentage (highest first)
          query = query.order('original_price', { ascending: false });
          break;
        case 'discount-low':
          // Sort by discount percentage (lowest first)
          query = query.order('original_price', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Clearance products error:', queryError);
        throw queryError;
      }

      // Filter by discount range and clearance logic on the client side
      let filteredData = data || [];
      
      // First filter for clearance products (original_price > price)
      filteredData = filteredData.filter(product => {
        if (!product.original_price) return false;
        return product.original_price > product.price;
      });
      
      // Then filter by discount range
      if (filters.discountRange) {
        filteredData = filteredData.filter(product => {
          if (!product.original_price) return false;
          const discount = ((product.original_price - product.price) / product.original_price) * 100;
          return discount >= filters.discountRange[0] && discount <= filters.discountRange[1];
        });
      }

      return filteredData;
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    updateActiveFilters();
  }, [filters]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading clearance products",
        description: "Failed to load clearance products. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.searchQuery) active.push(`Search: ${filters.searchQuery}`);
    if (filters.discountRange[0] > 0 || filters.discountRange[1] < 100) {
      active.push(`Discount: ${filters.discountRange[0]}% - ${filters.discountRange[1]}%`);
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(`Price: GHS ${filters.priceRange[0]} - GHS ${filters.priceRange[1]}`);
    }
    if (filters.dateRange !== 'all') active.push(`Date: ${filters.dateRange}`);
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      sortBy: "discount-high",
      discountRange: [0, 100],
      priceRange: [0, 1000000],
      dateRange: "all"
    });
  };

  const handleAddToFavorites = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add products to favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingToFavorites(productId);
      await addToFavorites.mutateAsync(productId);
      toast({
        title: "Added to favorites",
        description: "Product has been added to your favorites",
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add product to favorites",
        variant: "destructive",
      });
    } finally {
      setAddingToFavorites(null);
    }
  };

  const isFavorite = (productId: string) => {
    return userFavorites.some(fav => fav.id === productId);
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const formatPrice = (price: number): string => {
    return `GHS ${price.toLocaleString()}`;
  };

  const getMainImage = (images: string[] = []): string => {
    return images[0] || '';
  };

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clearance Sale</h1>
            <p className="text-gray-600 mt-1">Amazing deals on discounted products</p>
          </div>
          {/* Desktop filter/sort buttons */}
          {!isMobile && (
            <div className="flex items-center space-x-3">
              <FilterDialog 
                showFilters={showFilters} 
                setShowFilters={setShowFilters} 
                activeFilters={activeFilters} 
                filters={filters} 
                setFilters={setFilters} 
                clearFilters={clearFilters}
                sortOptions={sortOptions}
                dateRanges={dateRanges}
              />
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden md:inline">Sort</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        {isMobile && (
          <div className="md:hidden">
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {clearanceProducts.length} discounted products found
              {filters.searchQuery && ` for "${filters.searchQuery}"`}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : clearanceProducts.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clearance items found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new deals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {clearanceProducts.map((product) => {
                const discount = calculateDiscount(product.original_price!, product.price);
                
                return (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="product-card group transition-all duration-300 cursor-pointer relative">
                      <CardContent className="p-4">
                        <div className="product-image-container aspect-square mb-4 relative">
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-4xl overflow-hidden">
                            {getMainImage(product.images || []) ? (
                              <img 
                                src={getMainImage(product.images || [])} 
                                alt={product.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-3xl">📱</span>
                            )}
                          </div>
                          {/* Discount Badge */}
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                            -{discount}%
                          </Badge>
                          {/* Heart button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 ${
                              isFavorite(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                            }`}
                            onClick={(e) => handleAddToFavorites(e, product.id)}
                            disabled={addingToFavorites === product.id}
                          >
                            <Heart 
                              className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} 
                            />
                          </Button>
                        </div>
                        <h4 className="product-title text-card-foreground mb-3 text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                          {product.title}
                        </h4>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="product-price text-lg text-red-600 dark:text-red-500">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm line-through text-muted-foreground">
                              {formatPrice(product.original_price!)}
                            </span>
                          </div>
                        </div>
                        <div className="product-location text-xs text-muted-foreground">
                          Location
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
                            Limited Time Offer
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Filter Modal (rendered once at the end) */}
      <FilterDialog
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFilters={activeFilters}
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        sortOptions={sortOptions}
        dateRanges={dateRanges}
      />
    </Layout>
  );
};

export default ClearanceSales;
