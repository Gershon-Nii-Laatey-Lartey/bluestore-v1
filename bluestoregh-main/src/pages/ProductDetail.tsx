
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { RelatedProducts } from "@/components/RelatedProducts";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share, MessageCircle, Phone, ArrowLeft, MapPin, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { productService, ProductDetail } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAddToFavorites, useFavorites } from "@/hooks/useFavorites";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const addToFavorites = useAddToFavorites();
  const { data: userFavorites = [] } = useFavorites();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(id!);
      if (productData) {
        setProduct(productData);
      } else {
        toast({
          title: "Product Not Found",
          description: "The product you're looking for doesn't exist.",
          variant: "destructive"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add products to favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      setAddingToFavorites(true);
      await addToFavorites.mutateAsync(product!.id);
      toast({
        title: "Added to Favorites",
        description: "Product has been added to your favorites"
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add product to favorites",
        variant: "destructive"
      });
    } finally {
      setAddingToFavorites(false);
    }
  };

  const isFavorite = (productId: string) => {
    return userFavorites.some(fav => fav.product_id === productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMainImage = (images?: string[]) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return null;
  };

  const getDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to clipboard"
      });
    }
  };

  const CallButton = () => {
    if (!product?.vendor?.phone) return null;

    if (isMobile) {
      return (
        <Button asChild variant="outline" className="flex-1">
          <a href={`tel:${product.vendor.phone}`} className="flex items-center justify-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Call Vendor</span>
          </a>
        </Button>
      );
    }

    return (
      <Button variant="outline" className="flex-1 flex items-center justify-center space-x-2">
        <Phone className="h-4 w-4" />
        <span>{product.vendor.phone}</span>
      </Button>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  const mainImage = getMainImage(product.images);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount ? getDiscountPercentage(product.original_price!, product.price) : 0;

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-7xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl text-gray-400">📦</div>
              )}
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors ${
                      selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <Link to={`/vendor/${product.vendor_id}`} className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700 transition-colors w-fit">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={product.vendor?.avatar_url} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {product.vendor?.full_name?.charAt(0) || product.vendor?.username?.charAt(0) || 'V'}
                    </AvatarFallback>
                  </Avatar>
                  <span>by {product.vendor?.full_name || product.vendor?.username || 'Unknown Vendor'}</span>
                  {product.vendor?.is_verified && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </Link>
              </div>
              
              {/* Product Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                {product.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{product.location.city}, {product.location.state_province}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDate(product.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.view_count} views</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.original_price!)}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    Save {formatPrice(product.original_price! - product.price)}
                  </Badge>
                </>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Condition:</span>
                <Badge variant="outline" className="capitalize">
                  {product.condition.replace('_', ' ')}
                </Badge>
              </div>
              {product.brand && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Brand:</span>
                  <span className="text-sm">{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Model:</span>
                  <span className="text-sm">{product.model}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat with Vendor</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleAddToFavorites}
                disabled={addingToFavorites}
                className={isFavorite(product.id) ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share className="h-4 w-4" />
              </Button>
            </div>

            {/* Call Button */}
            {product.vendor?.phone && (
              <div className="flex space-x-3">
                <CallButton />
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                {product.features && product.features.length > 0 && (
                  <>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          currentProductId={product.id} 
          categoryId={product.category_id}
          categoryName={product.category?.name}
        />
      </div>
    </Layout>
  );
};

export default ProductDetail;
