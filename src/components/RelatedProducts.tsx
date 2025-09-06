
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import { ProductSubmission } from "@/types/product";
import { formatPrice } from "@/utils/formatters";
import { getMainImageWithFallback } from "@/utils/imageUtils";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
}

export const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await productService.getFeaturedProducts();
        
        // Filter out current product and get products from same category (if specified)
        let filtered = allProducts.filter(product => product.id !== currentProductId);
        
        if (category) {
          const sameCategory = filtered.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
          );
          
          // If we have products in the same category, use them, otherwise use all products
          if (sameCategory.length > 0) {
            filtered = sameCategory;
          }
        }
        
        // Get up to 4 random products
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Related Products</h2>
        <div className="product-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="product-card animate-pulse">
              <CardContent className="p-0">
                <div className="product-image-container aspect-square mb-4">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Related Products</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No related products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Related Products</h2>
      <div className="product-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <Card key={product.id} className="product-card group transition-all duration-300">
            <CardContent className="p-0">
              <Link to={`/product/${product.id}`} className="block">
                <div className="product-image-container aspect-square mb-4">
                  <OptimizedImage
                    src={getMainImageWithFallback(product.images || [], product.main_image_index)}
                    alt={product.title}
                    aspectRatio="square"
                    className="product-image"
                    fallback={
                      <div className="product-image-placeholder text-3xl">📱</div>
                    }
                  />
                </div>
                <h3 className="product-title text-card-foreground mb-3 text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <span className="product-price text-lg text-blue-600 dark:text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                  <span className="price-reduced-badge text-xs px-2 py-1">
                    Sale
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
