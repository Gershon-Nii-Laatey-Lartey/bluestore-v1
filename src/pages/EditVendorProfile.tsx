import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VendorProfile } from '@/types/vendor';
import { Layout } from '@/components/Layout';
import { MobileHeader } from '@/components/MobileHeader';

export default function EditVendorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    website: '',
    social_media: '',
    warranty_info: '',
    return_policy: '',
    business_hours: '',
    payment_methods: '',
    delivery_info: '',
    additional_info: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchVendorProfile();
  }, [user, navigate]);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching vendor profile:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor profile. Please try again.",
          variant: "destructive",
        });
        navigate('/my-vendor-profile');
        return;
      }

      if (data) {
        setVendorProfile(data);
        setFormData({
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          description: data.description || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          website: data.website || '',
          social_media: data.social_media || '',
          warranty_info: data.warranty_info || '',
          return_policy: data.return_policy || '',
          business_hours: data.business_hours || '',
          payment_methods: data.payment_methods || '',
          delivery_info: data.delivery_info || '',
          additional_info: data.additional_info || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !vendorProfile) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorProfile.id);

      if (error) {
        console.error('Error updating vendor profile:', error);
        toast({
          title: "Error",
          description: "Failed to update vendor profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Your vendor profile has been updated successfully.",
      });
      
      navigate('/my-vendor-profile');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading vendor profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!vendorProfile) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p>Vendor profile not found.</p>
            <Button onClick={() => navigate('/my-vendor-profile')} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/my-vendor-profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Edit Vendor Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Update your business information and settings
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    value={formData.business_type}
                    onChange={(e) => handleInputChange('business_type', e.target.value)}
                    placeholder="e.g., Electronics Store, Online Retailer"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell customers about your business..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How customers can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card>
            <CardHeader>
              <CardTitle>Online Presence</CardTitle>
              <CardDescription>
                Your website and social media links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="social_media">Social Media</Label>
                  <Input
                    id="social_media"
                    value={formData.social_media}
                    onChange={(e) => handleInputChange('social_media', e.target.value)}
                    placeholder="Facebook, Instagram, Twitter handles"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Business Policies</CardTitle>
              <CardDescription>
                Important information for your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="warranty_info">Warranty Information</Label>
                <Textarea
                  id="warranty_info"
                  value={formData.warranty_info}
                  onChange={(e) => handleInputChange('warranty_info', e.target.value)}
                  placeholder="Describe your warranty policy..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="return_policy">Return Policy</Label>
                <Textarea
                  id="return_policy"
                  value={formData.return_policy}
                  onChange={(e) => handleInputChange('return_policy', e.target.value)}
                  placeholder="Describe your return and refund policy..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Extra details about your business operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="business_hours">Business Hours</Label>
                <Input
                  id="business_hours"
                  value={formData.business_hours}
                  onChange={(e) => handleInputChange('business_hours', e.target.value)}
                  placeholder="e.g., Mon-Fri 9AM-6PM, Sat 10AM-4PM"
                />
              </div>
              
              <div>
                <Label htmlFor="payment_methods">Payment Methods</Label>
                <Input
                  id="payment_methods"
                  value={formData.payment_methods}
                  onChange={(e) => handleInputChange('payment_methods', e.target.value)}
                  placeholder="e.g., Cash, Mobile Money, Bank Transfer"
                />
              </div>
              
              <div>
                <Label htmlFor="delivery_info">Delivery Information</Label>
                <Textarea
                  id="delivery_info"
                  value={formData.delivery_info}
                  onChange={(e) => handleInputChange('delivery_info', e.target.value)}
                  placeholder="Describe your delivery options and fees..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="additional_info">Additional Information</Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  placeholder="Any other important information for customers..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

