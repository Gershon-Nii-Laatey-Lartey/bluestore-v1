import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Filter, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataService, ProductSubmission } from "@/services/dataService";
import { Link } from "react-router-dom";
import { formatPrice } from "@/utils/formatters";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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

export const ProductCatalogTab = () => {
  const [products, setProducts] = useState<ProductSubmission[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await dataService.getProductSubmissions();
      setProducts(data);
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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (product: ProductSubmission) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      // Call the delete service method
      await dataService.deleteProduct(productToDelete.id);
      
      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Product Catalog</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Browse and manage all products in the marketplace</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                Total Products: {products.length}
              </Badge>
              <Button onClick={loadProducts} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Package className="h-5 w-5" />
              <span>All Products</span>
            </CardTitle>
            <div className={cn(
              "flex flex-col gap-4",
              isMobile ? "space-y-3" : "sm:flex-row sm:space-y-0"
            )}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(
                  "w-full",
                  isMobile ? "w-full" : "w-40"
                )}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={cn(
                  "w-full",
                  isMobile ? "w-full" : "w-40"
                )}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Grid */}
            {isMobile ? (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="product-card border transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {product.images && product.images.length > 0 && (
                          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            <img 
                              src={getMainImageWithFallback(product.images, product.main_image_index)} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                              {product.title}
                            </h3>
                            <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                              {product.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-base text-green-600 dark:text-green-400">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-xs text-muted-foreground">{product.category}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>{formatDate(product.submittedAt)}</span>
                            <span>{product.location}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" asChild>
                              <Link to={`/product/${product.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteProduct(product)}
                              className="px-3"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Desktop Grid */
              <div className="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="product-card border transition-all duration-300">
                    <CardContent className="p-0">
                      {product.images && product.images.length > 0 && (
                        <div className="product-image-container aspect-square mb-4">
                          <img 
                            src={getMainImageWithFallback(product.images, product.main_image_index)} 
                            alt={product.title}
                            className="product-image"
                          />
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="product-title text-foreground text-sm line-clamp-2">
                            {product.title}
                          </h3>
                          <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="product-price text-lg text-green-600 dark:text-green-400">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(product.submittedAt)}</span>
                          <span>{product.location}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link to={`/product/${product.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Delete Product</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
