
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductSubmission } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, isLoading, removeFromFavorites } = useFavorites();
  const { toast } = useToast();
  const [productToRemove, setProductToRemove] = useState<ProductSubmission | null>(null);

  const handleRemoveFromFavorites = async (product: ProductSubmission) => {
    setProductToRemove(product);
  };

  const confirmRemove = async () => {
    if (!productToRemove) return;

    try {
      await removeFromFavorites(productToRemove.id);
      toast({
        title: "Removed from Favorites",
        description: `${productToRemove.title} has been removed from your favorites`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProductToRemove(null);
    }
  };

  return (
    <Layout>
      <div className="md:hidden">
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
          <ProductGrid products={[]} loading={true} />
        ) : favorites.length === 0 ? (
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
        ) : (
          <ProductGrid 
            products={favorites} 
            loading={false} 
            showRemoveFromFavorites={true}
            onRemoveFromFavorites={handleRemoveFromFavorites}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!productToRemove} onOpenChange={() => setProductToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{productToRemove?.title}" from your favorites? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Favorites;
