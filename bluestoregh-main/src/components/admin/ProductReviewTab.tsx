import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService, Product } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Star, StarOff, Search, Filter } from "lucide-react";

interface ProductReviewTabProps {
  onRefresh?: () => void;
}

export const ProductReviewTab = ({ onRefresh }: ProductReviewTabProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { products: fetchedProducts } = await adminService.getProducts(1, 100);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await adminService.updateProductAvailability(productId, !currentStatus);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_available: !currentStatus } : p
      ));
      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast({
        title: "Error",
        description: "Failed to update product availability",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      await adminService.updateProductFeatured(productId, !currentStatus);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_featured: !currentStatus } : p
      ));
      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`
      });
    } catch (error) {
      console.error('Error updating product featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update product featured status",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterAvailable === null || product.is_available === filterAvailable;
    
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Management</span>
            <Badge variant="outline">
              {filteredProducts.length} products
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by title, description, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter">Filter by availability</Label>
              <select
                id="filter"
                value={filterAvailable === null ? 'all' : filterAvailable.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterAvailable(value === 'all' ? null : value === 'true');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images[0]}
                              alt={product.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand && product.model ? `${product.brand} ${product.model}` : product.brand || 'No brand'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Created {formatDate(product.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      {product.original_price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">
                        {product.category?.name || 'No category'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.vendor?.full_name || product.vendor?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Badge variant={product.is_available ? "default" : "secondary"}>
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        {product.is_featured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAvailability(product.id, product.is_available)}
                          className="h-8 w-8 p-0"
                        >
                          {product.is_available ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                          className="h-8 w-8 p-0"
                        >
                          {product.is_featured ? (
                            <Star className="h-4 w-4 text-yellow-600 fill-current" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms' : 'No products available'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
