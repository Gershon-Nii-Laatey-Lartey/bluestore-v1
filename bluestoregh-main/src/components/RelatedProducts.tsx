
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { productService, RelatedProduct } from "@/services/productService";
import { useAddToFavorites, useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
  categoryName?: string;
}

export const RelatedProducts = ({ currentProductId, categoryId, categoryName }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const addToFavorites = useAddToFavorites();
  const { data: userFavorites = [] } = useFavorites();

  useEffect(() => {
    loadRelatedProducts();
  }, [currentProductId, categoryId]);

  const loadRelatedProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getRelatedProducts(currentProductId, categoryId, 4);
      setRelatedProducts(products);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add products to favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      await addToFavorites.mutateAsync(productId);
      toast({
        title: "Added to Favorites",
        description: "Product has been added to your favorites"
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add product to favorites",
        variant: "destructive"
      });
    }
  };

  const isFavorite = (productId: string) => {
    return userFavorites.some(fav => fav.product_id === productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getMainImage = (images?: string[]) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Products
          {categoryName && <span className="text-lg font-normal text-gray-600"> in {categoryName}</span>}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Related Products
        {categoryName && <span className="text-lg font-normal text-gray-600"> in {categoryName}</span>}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => {
          const mainImage = getMainImage(product.images);
          const hasDiscount = product.original_price && product.original_price > product.price;
          
          return (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3 group-hover:bg-gray-200 transition-colors">
                    {mainImage ? (
                      <img 
                        src={mainImage} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">📦</div>
                    )}
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price!)}
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => handleAddToFavorites(e, product.id)}
                    className={isFavorite(product.id) ? 'text-red-500 hover:text-red-600' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                {product.vendor && (
                  <div className="mt-2 text-sm text-gray-500">
                    by {product.vendor.full_name || product.vendor.username}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
