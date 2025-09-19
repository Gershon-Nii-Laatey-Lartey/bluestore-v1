
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import React from "react";
import { memo } from "react";
import { Heart } from "lucide-react";
import { useAddToFavorites, useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Utility functions
const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `GHS ${numPrice.toLocaleString()}`;
};

const getMainImageWithFallback = (images: string[] = []): string => {
  if (images.length === 0) return '';
  return images[0] || '';
};

export const FeaturedProducts = memo(({ products, loading = false }: FeaturedProductsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const addToFavorites = useAddToFavorites();
  const { data: userFavorites = [] } = useFavorites();
  const [addingToFavorites, setAddingToFavorites] = useState<string | null>(null);

  const handleAddToFavorites = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); // Prevent navigation to product page
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
  const getDisplayPrice = (product: Product) => {
    // Priority 1: Regular sale pricing with original_price
    if (product.original_price && parseFloat(String(product.original_price)) > parseFloat(String(product.price))) {
      return {
        currentPrice: formatPrice(product.price),
        previousPrice: formatPrice(product.original_price),
        showDiscount: false,
        isClearance: false
      };
    }

    // Default: Just show current price
    return {
      currentPrice: formatPrice(product.price),
      previousPrice: null,
      showDiscount: false,
      isClearance: false
    };
  };

  const ProductSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4 px-[10px]">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
      </CardContent>
    </Card>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Featured Products</h3>
        <Link to="/search">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See all →
          </Button>
        </Link>
      </div>
      
      <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : products.length === 0 ? (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 text-muted-foreground">
            No products available. Start by publishing your first ad!
          </div>
        ) : (
          products.map(product => {
            const priceInfo = getDisplayPrice(product);
            
            return (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="product-card group transition-all duration-300 cursor-pointer relative">
                  <CardContent className="p-4">
                    <div className="product-image-container aspect-square mb-4 relative">
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-4xl overflow-hidden">
                        {getMainImageWithFallback(product.images || []) ? (
                          <img 
                            src={getMainImageWithFallback(product.images || [])} 
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-3xl">📱</span>
                        )}
                      </div>
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
                        <span className="product-price text-lg text-blue-600 dark:text-primary">
                          {priceInfo.currentPrice}
                        </span>
                        {priceInfo.previousPrice && (
                          <span className={`text-sm line-through ${priceInfo.isClearance ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {priceInfo.previousPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="product-location text-xs text-muted-foreground">
                      Location
                    </div>
                    {priceInfo.isClearance && (
                      <div className="mt-2">
                        <span className="price-reduced-badge text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                          Price Reduced!
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
});

FeaturedProducts.displayName = 'FeaturedProducts';
