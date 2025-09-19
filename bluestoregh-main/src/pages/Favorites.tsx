
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Heart, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites, useRemoveFromFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: favorites = [], isLoading, error } = useFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      setRemovingId(productId);
      await removeFromFavorites.mutateAsync(productId);
      toast({
        title: "Removed from favorites",
        description: "Product has been removed from your favorites",
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Failed to remove product from favorites",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleChatWithVendor = (vendorId: string) => {
    navigate(`/chat?vendor=${vendorId}`);
  };

  const getMainImage = (images: string[] = []): string => {
    return images[0] || '';
  };

  const formatPrice = (price: number): string => {
    return `₵${price.toLocaleString()}`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your favorites</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            My Favorites
          </h1>
          <span className="text-sm text-gray-500">
            {isLoading ? "..." : `${favorites.length} items`}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading favorites</h3>
            <p className="text-gray-600">Please try again later</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {getMainImage(item.images) ? (
                        <img 
                          src={getMainImage(item.images)} 
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.brand && item.model ? `${item.brand} ${item.model}` : item.condition}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(item.price)}
                        </p>
                        {item.original_price && item.original_price > item.price && (
                          <p className="text-sm line-through text-gray-500">
                            {formatPrice(item.original_price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveFromFavorites(item.id)}
                        disabled={removingId === item.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                        onClick={() => handleChatWithVendor(item.vendor_id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-4">Start adding products to your favorites</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/')}
            >
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
