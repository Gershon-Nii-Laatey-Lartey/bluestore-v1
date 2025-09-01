
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductGrid } from "@/components/ProductGrid";
import { BackgroundLoadingIndicator } from "@/components/ui/background-loading-indicator";

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, isLoading, isFetching } = useFavorites();

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
            {isFetching && " (updating...)"}
          </span>
        </div>

        <BackgroundLoadingIndicator isFetching={isFetching} />
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
          <ProductGrid products={favorites} loading={false} />
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
