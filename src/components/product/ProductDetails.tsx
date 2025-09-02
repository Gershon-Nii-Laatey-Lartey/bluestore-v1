
import { Card, CardContent } from "@/components/ui/card";
import { ProductSubmission } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface ProductDetailsProps {
  product: ProductSubmission;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { user } = useAuth();
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3">Product Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Condition:</span>
            <span className="font-medium">{product.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{product.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            {user ? (
              <span className="font-medium">{product.phone}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Login to view</span>
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
          {product.negotiable && (
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-green-600">Negotiable</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
