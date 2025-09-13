
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MapPin, ExternalLink, Phone, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { CallButton } from "./CallButton";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface VendorInfoProps {
  vendorName: string;
  vendorId?: string;
  vendorPhone?: string;
  productId?: string;
  vendorCreatedAt?: string;
}

export const VendorInfo = ({ vendorName, vendorId, vendorPhone, productId, vendorCreatedAt }: VendorInfoProps) => {
  const { user } = useAuth();
  
  if (!vendorName) {
    return null;
  }

  const content = (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center justify-between">
          Seller Information
          {vendorId && (
            <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </h3>
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{vendorName}</p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Verified Seller</span>
            </div>
            {vendorCreatedAt && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Member since {new Date(vendorCreatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        {vendorPhone && (
          <div className="border-t pt-3">
            {user ? (
              // Show contact info for authenticated users
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>Contact Seller</span>
                </div>
                {productId && (
                  <CallButton phoneNumber={vendorPhone} productId={productId} />
                )}
              </div>
            ) : (
              // Show login prompt for non-authenticated users
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Lock className="h-4 w-4" />
                  <span>Contact information hidden</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/auth'}
                  className="text-sm"
                >
                  Login to View
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // If we have a vendor ID, make it clickable
  if (vendorId) {
    return (
      <Link to={`/vendor/${vendorId}`} className="block hover:shadow-md transition-shadow">
        {content}
      </Link>
    );
  }

  return content;
};
