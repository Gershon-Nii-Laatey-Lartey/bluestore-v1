
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductSubmission } from "@/types/product";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatPrice } from "@/utils/formatters";
import { getMainImageWithFallback } from "@/utils/imageUtils";

interface ProductGridProps {
  products: ProductSubmission[];
  loading?: boolean;
  showEditButtons?: boolean;
  onEdit?: (product: ProductSubmission) => void;
}

export const ProductGrid = ({ products, loading, showEditButtons = false, onEdit }: ProductGridProps) => {
  const calculateDiscount = (currentPrice: string, previousPrice: string) => {
    const current = parseFloat(currentPrice);
    const previous = parseFloat(previousPrice);
    const savings = previous - current;
    const percentage = (savings / previous * 100).toFixed(0);
    return { savings, percentage };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="animate-pulse bg-card border-border">
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 text-muted-foreground">
        No products available in this category yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        // Check if this is a clearance item (edited with price reduction)
        const isClearanceItem = product.edited && product.previous_price && 
          parseFloat(product.previous_price) > parseFloat(product.price);
        
        const discountInfo = isClearanceItem 
          ? calculateDiscount(product.price, product.previous_price!) 
          : null;

        return (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200 relative bg-card border-border">
            {/* Discount Badge for Clearance Items */}
            {isClearanceItem && discountInfo && (
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                <TrendingDown className="h-3 w-3" />
                <span>{discountInfo.percentage}% OFF</span>
              </div>
            )}
            
            <CardContent className="p-4">
              <Link to={`/product/${product.id}`} className="block">
                <OptimizedImage
                  src={getMainImageWithFallback(product.images || [], product.main_image_index)}
                  alt={product.title}
                  aspectRatio="square"
                  className="mb-3 group-hover:scale-105 transition-transform duration-200"
                  fallback={
                    <div className="text-3xl flex items-center justify-center h-full">📱</div>
                  }
                />
                <h4 className="font-medium text-card-foreground mb-2 text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                  {product.title}
                </h4>
              </Link>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-blue-600 dark:text-primary">
                    {formatPrice(product.price)}
                  </span>
                  
                  {/* Show previous price for clearance items */}
                  {isClearanceItem && product.previous_price && (
                    <span className="text-sm text-red-500 line-through">
                      {formatPrice(product.previous_price)}
                    </span>
                  )}
                  
                  {/* Show original price for regular sale items */}
                  {!isClearanceItem && product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Show savings amount for clearance items */}
              {isClearanceItem && discountInfo && (
                <div className="mb-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950 px-2 py-1 rounded-full">
                    Save {formatPrice(discountInfo.savings)}
                  </span>
                </div>
              )}
              
              {/* Show edit button for pending products */}
              {showEditButtons && product.status === 'pending' && onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(product);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
