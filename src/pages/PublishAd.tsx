import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
 
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { productService } from "@/services/productService";
import { vendorService } from "@/services/vendorService";
import { dataService } from "@/services/dataService";
import { imageService } from "@/services/imageService";
import { paymentService } from "@/services/paymentService";
import { packageService } from "@/services/packageService";
import { notificationService } from "@/services/notificationService";
 
import { adPackages } from "@/types/adPackage";
import { BasicInformationForm } from "@/components/publish-ad/BasicInformationForm";
import { PricingForm } from "@/components/publish-ad/PricingForm";
import { ImageUploadForm } from "@/components/publish-ad/ImageUploadForm";
import { ContactInformationForm } from "@/components/publish-ad/ContactInformationForm";
import { PackageSelection } from "@/components/publish-ad/PackageSelection";
import { PublishAdProgress } from "@/components/publish-ad/PublishAdProgress";
import { supabase } from "@/integrations/supabase/client";

const PublishAd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
    price: '',
    originalPrice: '',
    negotiable: false,
    phone: '',
    location: '',
    specificLocation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<string>('free');
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [freeAdsCount, setFreeAdsCount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  
  // Promo code removed from publish form – handled in review step

  // Form persistence - save form data to localStorage
  const saveFormData = () => {
    const dataToSave = {
      formData,
      images: images.map(img => ({ name: img.name, size: img.size, type: img.type })),
      mainImageIndex,
      selectedPackage,
      currentStep,
      
    };
    localStorage.setItem('publishAdFormData', JSON.stringify(dataToSave));
  };

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('publishAdFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || formData);
        setMainImageIndex(parsed.mainImageIndex || 0);
        setSelectedPackage(parsed.selectedPackage || 'free');
        setCurrentStep(parsed.currentStep || 1);
        
        console.log('Restored form data from localStorage');
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    saveFormData();
  }, [formData, images, mainImageIndex, selectedPackage, currentStep]);

  // Handle payment success callback
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const reference = searchParams.get('reference');
    
    if (paymentStatus === 'success' && reference) {
      handlePaymentSuccess(reference);
    }
  }, [searchParams]);

  // Check for active subscription
  useEffect(() => {
    const checkActiveSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: subscriptions, error: subscriptionError } = await supabase
          .from('user_plan_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('end_date', new Date().toISOString())
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        setHasActiveSubscription(!!subscriptions);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkActiveSubscription();
  }, []);

  // Load vendor profile and free ads count
  useEffect(() => {
    const loadVendorProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load vendor profile
        const { data: profile } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setVendorProfile(profile);

        // Update form data with vendor profile information
        if (profile) {
          setFormData(prev => ({
            ...prev,
            phone: profile.phone || '',
            location: profile.location || prev.location
          }));
        }

        // Load free ads count
        const { data: freeAds } = await supabase
          .from('product_submissions')
          .select('id')
          .eq('user_id', user.id)
          .or('package->>id.eq.free,package.is.null')
          .eq('status', 'approved');

        setFreeAdsCount(freeAds?.length || 0);
      } catch (error) {
        console.error('Error loading vendor profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadVendorProfile();
  }, []);

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const { data, error } = await paymentService.verifyPayment(reference);
      if (error) throw error;

      if (data.status) {
        toast({
          title: "Payment Successful!",
          description: "Your ad will now be published.",
        });
        navigate('/my-ads');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if your payment was successful.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleLocationChange = (location: string) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleImageUpload = (files: File[]) => {
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Adjust mainImageIndex when an image is removed
    if (mainImageIndex === index) {
      // If the main image is being removed, set it to the first image (index 0)
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      // If the removed image comes before the main image, decrement the main image index
      setMainImageIndex(prev => prev - 1);
    }
    // If the removed image comes after the main image, no adjustment needed
  };

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };


  // Promo code logic moved to review step

  const handleContinueToPackageSelection = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has a vendor profile
    if (!vendorProfile) {
      toast({
        title: "Vendor Profile Required",
        description: "You must create a vendor profile before publishing ads. Please create your vendor profile first.",
        variant: "destructive"
      });
      navigate('/create-vendor-profile');
      return;
    }
    
    // Go to package selection
    setCurrentStep(2);
  };

  const handlePublishNow = (packageId: string) => {
    setSelectedPackage(packageId);
    handleCreateProduct();
  };

  const handleCreateProduct = async () => {
    if (submitting) {
      console.log('Submission already in progress, ignoring submit');
      return;
    }

    // Check if user has a vendor profile
    if (!vendorProfile) {
      toast({
        title: "Vendor Profile Required",
        description: "You must create a vendor profile before publishing ads. Please create your vendor profile first.",
        variant: "destructive"
      });
      navigate('/create-vendor-profile');
      return;
    }

    let submissionCreated = false;
    let createdProductId: string | null = null;
    try {
      setSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the selected package from database
      const packages = await packageService.getPackages();
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);

      // Create the location string with specific location if provided
      const fullLocation = formData.specificLocation 
        ? `${formData.location} - ${formData.specificLocation}`
        : formData.location;

      // Create product submission with pending status for admin review (both free and paid)
      const productId = await dataService.createProductSubmission({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        images: [], // Start with empty array
        location: fullLocation,
        phone: formData.phone,
        negotiable: formData.negotiable,
        status: 'pending' as const, // Always set to pending for admin review
        package: selectedPkg,
        main_image_index: mainImageIndex
      });
      submissionCreated = true;
      createdProductId = productId;

      // Upload images using the product ID (non-fatal)
      try {
        const imageUrls = await imageService.uploadImages(images, productId);
        // Update the product submission with the uploaded image URLs
        await dataService.updateProductSubmission(productId, {
          images: imageUrls
        });
      } catch (imageError) {
        console.error('Error uploading images or updating submission:', imageError);
        toast({
          title: 'Ad created with warnings',
          description: 'Your ad is pending review, but there was an issue uploading images. You can edit the ad to retry image upload.',
          variant: 'destructive'
        });
      }

      // Notify admins about the new ad submission
      try {
        await notificationService.notifyAdminsForAdSubmission(user.id, formData.title);
      } catch (notificationError) {
        console.error('Error notifying admins:', notificationError);
        // Don't fail the submission if notification fails
      }

      // For paid packages, increment the subscription usage AFTER successful product creation
      if (selectedPkg && selectedPkg.price > 0) {
        try {
          console.log('Incrementing ads used for paid package:', selectedPkg.id);
          const { error: incrementError } = await supabase.rpc('increment_user_ads_used', {
            user_uuid: user.id
          });
          
          if (incrementError) {
            console.error('Error incrementing ads used:', incrementError);
            toast({
              title: "Warning",
              description: "Ad was created but there was an issue tracking usage. Please contact support if you see billing issues.",
              variant: "destructive",
            });
          } else {
            console.log('Ads usage incremented successfully');
          }
        } catch (incrementErr) {
          console.error('Increment function call failed:', incrementErr);
        }
      }
      
      const packageMessage = selectedPkg?.price === 0
        ? "Your ad has been submitted and is pending review."
        : "Your paid ad has been submitted and is pending review. This ad has been counted towards your subscription usage.";
      
      toast({
        title: "Success!",
        description: `${packageMessage} You'll be notified once it's approved.`,
      });
      
      // Clear saved form data after successful submission
      localStorage.removeItem('publishAdFormData');
      
      navigate('/my-ads');
    } catch (error) {
      console.error('Error creating product:', error);
      if (!submissionCreated) {
        toast({
          title: 'Error',
          description: 'Failed to create product. Please try again.',
          variant: 'destructive'
        });
      } else {
        // Submission exists but a later step failed
        toast({
          title: 'Ad created with warnings',
          description: 'Your ad is pending review, but some finalization steps failed. You can manage your ad from My Ads.',
          variant: 'destructive'
        });
        // Best-effort navigation to My Ads so user sees the created item
        navigate('/my-ads');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (processingPayment) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Processing your payment...</p>
            <p className="text-gray-600">Please wait while we verify your transaction.</p>
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
        
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {currentStep === 1 && 'Publish Your Product'}
            {currentStep === 2 && 'Choose Your Package'}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentStep === 1 && 'Create a new listing for your product'}
            {currentStep === 2 && 'Select a package to promote your ad effectively'}
          </p>
        </div>

        {currentStep === 1 && (
          <div>
            {!vendorProfile && !loadingProfile && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Vendor Profile Required
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You need to create a vendor profile before publishing ads. 
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-yellow-700 underline hover:text-yellow-800 ml-1"
                        onClick={() => navigate('/create-vendor-profile')}
                      >
                        Create your vendor profile now
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleContinueToPackageSelection} className="space-y-6">
            <BasicInformationForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />
            
            <PricingForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />

            <ImageUploadForm
              images={images}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
              getImagePreview={getImagePreview}
              mainImageIndex={mainImageIndex}
              onSetMainImage={handleSetMainImage}
            />

            <ContactInformationForm
              formData={formData}
              onInputChange={handleInputChange}
              onLocationChange={handleLocationChange}
              loadingProfile={loadingProfile}
            />

            {/* Promo code moved to the review step to reduce clutter */}

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 px-8"
                disabled={submitting || loadingProfile || !vendorProfile}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
                      </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <PackageSelection
              selectedPackage={selectedPackage}
              onSelectPackage={setSelectedPackage}
              onPublishNow={handlePublishNow}
              freeAdsCount={freeAdsCount}
              hasActiveSubscription={hasActiveSubscription}
            />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                disabled={submitting}
              >
                Back to Product Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PublishAd;
