
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Shield, CheckCircle, Phone, User, MapPin, Store } from "lucide-react";

const KYC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    storeName: '',
    storeDescription: '',
    productCategory: '',
    location: '',
    idDocument: null as File | null,
    idDocumentBack: null as File | null,
    selfieWithId: null as File | null,
    agreeTerms: false,
    confirmInfo: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (checked: boolean, field: string) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store KYC submission
    const kycSubmission = {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    localStorage.setItem('kycSubmission', JSON.stringify(kycSubmission));
    
    toast({
      title: "KYC Submitted",
      description: "Your verification documents have been submitted for review. You'll be notified within 24-48 hours."
    });
    
    navigate('/my-vendor-profile');
  };

  const productCategories = [
    'Fashion',
    'Electronics',
    'Groceries',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Services'
  ];

  const idTypes = [
    'National ID',
    'Voter\'s ID',
    'Driver\'s License',
    'Passport'
  ];

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-1">Simple verification to become a trusted seller</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 text-blue-600">
              <Shield className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Why verify your account?</h3>
                <p className="text-sm text-gray-600">Verified sellers get more trust from customers and access to premium features.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name (as on ID) *</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Phone number (OTP verification required)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address (optional but recommended)</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Residential Address *</Label>
                <Textarea 
                  id="address" 
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* ID Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                ID Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Valid ID Document (Front) *</Label>
                <p className="text-sm text-gray-500 mb-2">Choose one: National ID / Voter's ID / Driver's License / Passport</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="idDocument"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'idDocument')}
                    className="hidden"
                    required
                  />
                  <label htmlFor="idDocument" className="cursor-pointer flex items-center justify-center space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {formData.idDocument ? formData.idDocument.name : 'Upload ID Document (Front)'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Valid ID Document (Back) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="idDocumentBack"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'idDocumentBack')}
                    className="hidden"
                    required
                  />
                  <label htmlFor="idDocumentBack" className="cursor-pointer flex items-center justify-center space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {formData.idDocumentBack ? formData.idDocumentBack.name : 'Upload ID Document (Back)'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Selfie with ID *</Label>
                <p className="text-sm text-gray-500 mb-2">Take a selfie holding your ID to verify it's real</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="selfieWithId"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'selfieWithId')}
                    className="hidden"
                    required
                  />
                  <label htmlFor="selfieWithId" className="cursor-pointer flex items-center justify-center space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {formData.selfieWithId ? formData.selfieWithId.name : 'Upload Selfie with ID'}
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name / Brand Name *</Label>
                <Input 
                  id="storeName" 
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="storeDescription">Short Store Description *</Label>
                <Textarea 
                  id="storeDescription" 
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  placeholder="What do you sell? Example: Kids wear & accessories"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Main Product Category *</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'productCategory')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location (City/Town) *</Label>
                  <Input 
                    id="location" 
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent */}
          <Card>
            <CardHeader>
              <CardTitle>Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="confirmInfo" 
                  checked={formData.confirmInfo}
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'confirmInfo')}
                  required
                />
                <Label htmlFor="confirmInfo" className="text-sm">
                  I confirm the information provided is correct
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="agreeTerms" 
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, 'agreeTerms')}
                  required
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  I agree to the Terms and Conditions
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!formData.confirmInfo || !formData.agreeTerms}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit for Verification
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default KYC;
