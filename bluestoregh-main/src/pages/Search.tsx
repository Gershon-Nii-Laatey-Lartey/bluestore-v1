import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Filter, SlidersHorizontal, X, ChevronDown, MapPin, DollarSign, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { useState, useEffect, memo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearchParams } from "react-router-dom";
import { SearchService } from "@/services/searchService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { EmergingModal } from "@/components/ui/EmergingModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/useCategories";
import { SortDialog } from "@/components/SortDialog";

// Memoized FilterDialog component to prevent re-renders
const FilterDialog = memo(({ 
  showFilters, 
  setShowFilters, 
  activeFilters, 
  filters, 
  setFilters, 
  clearFilters,
  sortOptions,
  categories,
  conditions,
  dateRanges
}: {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilters: string[];
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  sortOptions: any[];
  categories: { id: string; name: string }[];
  conditions: string[];
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
                  Filters & Sort
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
              {/* Sort */}
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

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={filters.category === 'all'}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={filters.category === category.id}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
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
        
              {/* Condition */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Condition</h3>
        <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value="all"
                      checked={filters.condition === 'all'}
                      onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">All Conditions</span>
                  </label>
                  {conditions.map((condition) => (
                    <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value={condition.toLowerCase()}
                        checked={filters.condition === condition.toLowerCase()}
                        onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Modal */
        <EmergingModal 
          open={showFilters} 
          onOpenChange={handleOpenChange} 
          title="Filters & Sort"
          headerAction={activeFilters.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          ) : undefined}
          trigger={(
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          )}
        >
          <div className="space-y-6">
            {/* Sort */}
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

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={filters.category === 'all'}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">All Categories</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={filters.category === category.id}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
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
          
            {/* Condition */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Condition</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="condition"
                    value="all"
                    checked={filters.condition === 'all'}
                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">All Conditions</span>
                </label>
                {conditions.map((condition) => (
                  <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={condition.toLowerCase()}
                      checked={filters.condition === condition.toLowerCase()}
                      onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{condition}</span>
                  </label>
                ))}
              </div>
            </div>
        </div>
        </EmergingModal>
      )}
    </>
  );
});

FilterDialog.displayName = 'FilterDialog';

const Search = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: categories = [] } = useCategories();
  const isMobile = useIsMobile();

  // Filter states
  const [filters, setFilters] = useState({
    category: "all",
    condition: "all",
    priceRange: [0, 1000000] as [number, number],
    location: "",
    negotiable: null as boolean | null,
    sortBy: "relevance",
    dateRange: "all"
  });

  const conditions = ["New", "Like New", "Good", "Fair", "Used"];
  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "location", label: "Nearest First" }
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  useEffect(() => {
    loadSearchResults();
  }, [location.search, filters]);

  useEffect(() => {
    updateActiveFilters();
  }, [filters]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      const query = searchParams.get('q') || '';
      setSearchQuery(query);
      
      const searchFilters = {
        query,
        category: filters.category === 'all' ? undefined : filters.category,
        condition: filters.condition === 'all' ? undefined : filters.condition,
        priceRange: filters.priceRange,
        location: filters.location || undefined,
        negotiable: filters.negotiable,
        sortBy: filters.sortBy,
        dateRange: filters.dateRange === 'all' ? undefined : filters.dateRange
      };

      const results = await SearchService.searchProducts(searchFilters);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to load search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.category !== 'all') active.push(`Category: ${filters.category}`);
    if (filters.condition !== 'all') active.push(`Condition: ${filters.condition}`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(`Price: GHS ${filters.priceRange[0]} - GHS ${filters.priceRange[1]}`);
    }
    if (filters.location) active.push(`Location: ${filters.location}`);
    if (filters.negotiable !== null) active.push(`Negotiable: ${filters.negotiable ? 'Yes' : 'No'}`);
    if (filters.dateRange !== 'all') active.push(`Date: ${filters.dateRange}`);
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      condition: "all",
      priceRange: [0, 1000000],
      location: "",
      negotiable: null,
      sortBy: "relevance",
      dateRange: "all"
    });
  };

  const getLocationDisplayText = () => {
    return filters.location ? ` in ${filters.location}` : '';
  };

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        {/* Search Header */}
        <div className="px-4 md:px-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Products</h1>
              <p className="text-gray-600">Find exactly what you're looking for</p>
            </div>
            </div>

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
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden mb-4 px-4">
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

        {/* Desktop Filters */}
        {!isMobile && (
          <div className="max-w-7xl mx-auto px-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Filter Button */}
                <FilterDialog 
                  showFilters={showFilters} 
                  setShowFilters={setShowFilters} 
                  activeFilters={activeFilters} 
                  filters={filters} 
                  setFilters={setFilters} 
                  clearFilters={clearFilters}
                  sortOptions={sortOptions}
                  categories={categories}
                  conditions={conditions}
                  dateRanges={dateRanges}
                />
                <SortDialog 
                  sortBy={filters.sortBy}
                  onSortChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  sortOptions={sortOptions}
                    />
                  </div>
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Clear All
                </Button>
              )}
                  </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
                </div>
            )}
          </div>
        )}

          {/* Search Results */}
        <div className="px-4 md:px-0">
          <div className="mb-4">
            {searchQuery ? (
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-600">
                  {searchResults.length} products found{getLocationDisplayText()}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                Showing all products ({searchResults.length} found){getLocationDisplayText()}
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <FeaturedProducts products={searchResults} />
          ) : searchQuery ? (
              <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms{getLocationDisplayText() ? ' or search in a different location' : ' or browse our categories'}.
              </p>
              </div>
          ) : (
            <FeaturedProducts products={searchResults} />
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
        categories={categories}
        conditions={conditions}
        dateRanges={dateRanges}
      />
    </Layout>
  );
};

export default Search;