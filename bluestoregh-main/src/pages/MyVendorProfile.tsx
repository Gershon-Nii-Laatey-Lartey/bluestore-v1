
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Calendar, Package, MessageCircle, Edit, Shield, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const MyVendorProfile = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<any>(null);

  useEffect(() => {
    // Load vendor profile from localStorage
    const profile = localStorage.getItem('vendorProfile');
    const kyc = localStorage.getItem('kycSubmission');
    
    if (profile) {
      setVendorProfile(JSON.parse(profile));
    }
    
    if (kyc) {
      setKycStatus(JSON.parse(kyc));
    }
  }, []);

  // Mock products from this vendor
  const vendorProducts = [
    {
      id: 1,
      name: "Xbox Series X",
      price: 570.00,
      image: "🎮",
      category: "Gaming"
    },
    {
      id: 2,
      name: "Wireless Controller", 
      price: 77.90,
      image: "🎮",
      category: "Gaming"
    },
    {
      id: 3,
      name: "iPhone 15 Pro",
      price: 999.00,
      image: "📱",
      category: "Phones"
    },
    {
      id: 4,
      name: "MacBook Air M2",
      price: 1299.00,
      image: "💻",
      category: "Computers"
    },
    {
      id: 5,
      name: "AirPods Pro",
      price: 249.00,
      image: "🎧",
      category: "Electronics"
    },
    {
      id: 6,
      name: "iPad Air",
      price: 599.00,
      image: "📱",
      category: "Electronics"
    }
  ];

  if (!vendorProfile) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="animate-fade-in max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Vendor Profile</h2>
              <p className="text-gray-600 mb-4">You haven't created a vendor profile yet. Create one to start selling your products.</p>
              <Button onClick={() => navigate('/create-vendor-profile')} className="bg-blue-600 hover:bg-blue-700">
                Create Vendor Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getVerificationBadge = () => {
    if (kycStatus?.status === 'approved' || vendorProfile.verified) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    if (kycStatus?.status === 'pending') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Verification Pending
        </Badge>
      );
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/kyc')}
        className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
      >
        <Shield className="h-3 w-3 mr-1" />
        Verify Account
      </Button>
    );
  };

  // Helper function to safely get profile image URL
  const getProfileImageUrl = () => {
    if (vendorProfile.profileImage && vendorProfile.profileImage instanceof File) {
      return URL.createObjectURL(vendorProfile.profileImage);
    }
    return "/placeholder.svg";
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Business information and products</p>
        </div>
        
        {/* Vendor Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={getProfileImageUrl()} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {vendorProfile.businessName?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{vendorProfile.businessName}</h2>
                  {getVerificationBadge()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{vendorProfile.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Joined {new Date(vendorProfile.createdAt).toLocaleDateString()}</span>
                  </div>
                  {showContact && (
                    <>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{vendorProfile.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{vendorProfile.phone}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowContact(!showContact)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {showContact ? 'Hide Contact' : 'Contact Vendor'}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{vendorProfile.totalProducts || 0}</div>
              <div className="text-sm text-gray-500">Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{vendorProfile.categories?.length || 0}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* About & Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{vendorProfile.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendorProfile.categories?.map((category: string) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Products */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Our Products ({vendorProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vendorProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-3xl mb-3 group-hover:bg-gray-200 transition-colors">
                        {product.image}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          ${product.price.toFixed(2)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Store Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Shipping Policy
              </h4>
              <p className="text-gray-600 text-sm">{vendorProfile.shippingPolicy || 'No shipping policy specified'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Return Policy</h4>
              <p className="text-gray-600 text-sm">{vendorProfile.returnPolicy || 'No return policy specified'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Warranty Information</h4>
              <p className="text-gray-600 text-sm">{vendorProfile.warrantyInfo || 'No warranty information specified'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MyVendorProfile;
