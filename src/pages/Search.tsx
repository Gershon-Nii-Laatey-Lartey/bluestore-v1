
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Filter, SlidersHorizontal, X, ChevronDown, MapPin, DollarSign, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { useState, useEffect, memo } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearchParams } from "react-router-dom";
import { searchService } from "@/services/searchService";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from "@/hooks/useAnalytics";
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
  categories: string[];
  conditions: string[];
  dateRanges: any[];
}) => {
  const isMobile = useIsMobile();
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Ensure focus is properly managed when closing
      setTimeout(() => {
        setShowFilters(false);
      }, 0);
    } else {
      setShowFilters(true);
    }
  };

  return (
    <Dialog open={showFilters} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={
          isMobile
            ? "dialog-slide-in-up bg-background z-50 rounded-2xl mt-4 mb-4 mx-auto max-w-[calc(100vw-1rem)]"
            : "max-w-md max-h-[80vh] overflow-y-auto"
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filters & Sort</span>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Filter and sort search results to find exactly what you're looking for.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sort Options */}
          <div>
            <Label className="text-sm font-medium">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
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

          {/* Category Filter */}
          <div>
            <Label className="text-sm font-medium">Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Filter */}
          <div>
            <Label className="text-sm font-medium">Condition</Label>
            <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={1000000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>₵{filters.priceRange[0].toLocaleString()}</span>
                <span>₵{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <Label className="text-sm font-medium">Location</Label>
            <Input
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* Negotiable Filter */}
          <div>
            <Label className="text-sm font-medium">Negotiable</Label>
            <Select value={filters.negotiable === null ? "all" : filters.negotiable ? "yes" : "no"} onValueChange={(value) => {
              const negotiableValue = value === "all" ? null : value === "yes";
              setFilters(prev => ({ ...prev, negotiable: negotiableValue }));
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="yes">Negotiable Only</SelectItem>
                <SelectItem value="no">Fixed Price Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-sm font-medium">Date Posted</Label>
            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

FilterDialog.displayName = 'FilterDialog';

const Search = () => {
  const [searchResults, setSearchResults] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();
  const location = useLocation();
  const { userLocation } = useUserLocation();
  const isMobile = useIsMobile();
  const { trackSearch, trackCategoryView } = useAnalytics();

  // Filter states
  const [filters, setFilters] = useState({
    category: "all",
    condition: "all",
    priceRange: [0, 1000000],
    location: "",
    negotiable: null as boolean | null,
    sortBy: "relevance",
    dateRange: "all"
  });

  const categories = [
    "Electronics", "Fashion", "Home & Garden", "Automotive", "Sports", 
    "Books", "Health & Beauty", "Toys & Games", "Pets", "Services",
    "Real Estate", "Jobs", "Education", "Entertainment", "Other"
  ];

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
      console.log('Search: Loading search results...');
      setLoading(true);
      
      // Get search query from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const query = urlParams.get('q') || '';
      setSearchQuery(query);

      // Use the new search service for both empty and non-empty queries
      const searchResults = await searchService.searchProducts(query, userLocation, filters);
      
      console.log(`Search: Found ${searchResults.totalCount} products for query: "${query}" in location: "${userLocation}"`);
      
      // Track search analytics
      trackSearch(query, searchResults.totalCount);
      
      setSearchResults(searchResults.products);
    } catch (error) {
      console.error('Search: Error loading search results:', error);
      toast({
        title: "Error",
        description: "Failed to load search results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.category) active.push(`Category: ${filters.category}`);
    if (filters.condition) active.push(`Condition: ${filters.condition}`);
    if (filters.location) active.push(`Location: ${filters.location}`);
    if (filters.negotiable !== null) active.push(`Negotiable: ${filters.negotiable ? 'Yes' : 'No'}`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
      active.push(`Price: ₵${filters.priceRange[0].toLocaleString()} - ₵${filters.priceRange[1].toLocaleString()}`);
    }
    if (filters.dateRange !== "all") {
      const dateLabel = dateRanges.find(d => d.value === filters.dateRange)?.label;
      if (dateLabel) active.push(`Date: ${dateLabel}`);
    }
    if (filters.sortBy !== "relevance") {
      const sortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label;
      if (sortLabel) active.push(`Sort: ${sortLabel}`);
    }
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      condition: "",
      priceRange: [0, 1000000],
      location: "",
      negotiable: null,
      sortBy: "relevance",
      dateRange: "all"
    });
  };

  const getLocationDisplayText = () => {
    if (userLocation && userLocation !== "Accra, Greater Accra Region") {
      return ` in ${userLocation}`;
    }
    return "";
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        {/* Mobile Filters */}
        <div className="md:hidden px-4 mb-4">
          <div className="flex items-center space-x-3">
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
          
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-red-600">
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Desktop Filters */}
        {!isMobile && (
          <div className="max-w-7xl mx-auto px-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters & Sort</span>
                  {activeFilters.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Sort */}
                  <div>
                    <Label className="text-sm font-medium">Sort</Label>
                    <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
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

                  {/* Category */}
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition */}
                  <div>
                    <Label className="text-sm font-medium">Condition</Label>
                    <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium">Price Range</Label>
                    <div className="mt-1 flex space-x-2">
                      <Input
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                        }))}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000000] 
                        }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <Input
                      placeholder="Location..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <Label className="text-sm font-medium">Date Posted</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </Layout>
  );
};

export default Search;
