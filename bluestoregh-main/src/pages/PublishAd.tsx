
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";

interface ProductSubmission {
  id: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  price: string;
  originalPrice: string;
  negotiable: boolean;
  phone: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  images: File[];
}

const PublishAd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
    price: '',
    originalPrice: '',
    negotiable: false,
    phone: '',
    location: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images",
        variant: "destructive"
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.category || !formData.condition || !formData.description || !formData.price || !formData.phone || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }

    // Create product submission
    const submission: ProductSubmission = {
      id: Date.now().toString(),
      ...formData,
      images,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Store in localStorage
    const existingSubmissions = JSON.parse(localStorage.getItem('productSubmissions') || '[]');
    existingSubmissions.push(submission);
    localStorage.setItem('productSubmissions', JSON.stringify(existingSubmissions));

    // Show toast notification
    toast({
      title: "Success",
      description: "Product details saved. Choose a package to publish."
    });

    // Navigate to package selection page
    navigate('/package-selection');
  };

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Publish Your Product</h1>
          <p className="text-gray-600 mt-1">Create a new listing for your product</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter product title" 
                  className="mt-1" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <select 
                    id="condition" 
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Condition</option>
                    <option value="new">New</option>
                    <option value="used-excellent">Used - Excellent</option>
                    <option value="used-good">Used - Good</option>
                    <option value="used-fair">Used - Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea 
                  id="description" 
                  rows={4} 
                  placeholder="Describe your product..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (GHS) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    className="mt-1"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input 
                    id="originalPrice" 
                    type="number" 
                    placeholder="0.00" 
                    className="mt-1"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="negotiable" 
                  className="w-4 h-4"
                  checked={formData.negotiable}
                  onChange={handleInputChange}
                />
                <Label htmlFor="negotiable">Price is negotiable</Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
                  <p className="text-gray-500 mb-4">Add up to 10 images of your product ({images.length}/10)</p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={images.length >= 10}
                  />
                  <label htmlFor="image-upload">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center space-x-2"
                      disabled={images.length >= 10}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                        <span>Choose Files</span>
                      </span>
                    </Button>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImagePreview(image)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? 'Main' : `${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    placeholder="+233 XX XXX XXXX" 
                    className="mt-1"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location" 
                    placeholder="City, Region" 
                    className="mt-1"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex space-x-4">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Publish Product
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Save as Draft
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PublishAd;
