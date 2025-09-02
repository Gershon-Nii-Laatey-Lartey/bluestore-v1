
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { formatPrice } from "@/utils/formatters";
import { ProductSubmission } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Phone, LogIn } from "lucide-react";

interface ProductInfoProps {
  product: ProductSubmission;
  vendorName: string;
  vendorId?: string;
}

export const ProductInfo = ({ product, vendorName, vendorId }: ProductInfoProps) => {
  const { user } = useAuth();
  
  if (!product) {
    return <div>Loading product information...</div>;
  }

  // Check if the product has price changes for clearance display
  const hasPriceReduction = product.edited && product.previous_price && 
    parseFloat(product.previous_price) > parseFloat(product.price);

  const VendorLink = ({ children }: { children: React.ReactNode }) => {
    if (vendorId) {
      return (
        <Link to={`/vendor/${vendorId}`} className="hover:text-blue-700 transition-colors">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{product.title}</h1>
      
      <div className="space-y-4">
        <VendorLink>
          <div className="flex items-center space-x-2 text-blue-600 font-medium cursor-pointer">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                {vendorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>by {vendorName}</span>
          </div>
        </VendorLink>

        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            
            {/* Show previous price if it's a price reduction */}
            {hasPriceReduction && (
              <span className="text-lg text-red-500 line-through">
                {formatPrice(product.previous_price!)}
              </span>
            )}
            
            {/* Show original price if different and not a price reduction */}
            {!hasPriceReduction && product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {product.negotiable && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Negotiable
              </span>
            )}
            
            {hasPriceReduction && (
              <span className="inline-block bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                Price Reduced!
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Condition:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{product.condition}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Location:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{product.location}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Category:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{product.category}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
            {user ? (
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{product.phone}</span>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Login to view</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => window.location.href = '/auth'}
                >
                  <LogIn className="h-3 w-3 mr-1" />
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>

        {product.status !== 'approved' && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <span className="text-yellow-800 dark:text-yellow-400 text-sm font-medium">
              Status: {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
