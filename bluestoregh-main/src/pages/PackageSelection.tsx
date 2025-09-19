
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Check, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdPackage {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  recommended: boolean;
}

const adPackages: AdPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    duration: 7,
    features: [
      "7 days listing",
      "Standard visibility",
      "Max 5 photos"
    ],
    recommended: false
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    duration: 30,
    features: [
      "30 days listing",
      "Featured on category page",
      "Max 15 photos",
      "Highlighted listing"
    ],
    recommended: true
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    price: 19.99,
    duration: 60,
    features: [
      "60 days listing",
      "Featured on homepage",
      "Unlimited photos",
      "Highlighted listing",
      "Priority support"
    ],
    recommended: false
  }
];

const PackageSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string>(adPackages.find(pkg => pkg.recommended)?.id || adPackages[0].id);

  const handleContinue = () => {
    // Get the product submission from localStorage
    const submissions = JSON.parse(localStorage.getItem('productSubmissions') || '[]');
    if (submissions.length > 0) {
      // Get the last submission
      const lastSubmission = submissions[submissions.length - 1];
      // Add the selected package info to it
      lastSubmission.package = adPackages.find(pkg => pkg.id === selectedPackage);
      // Update in localStorage
      localStorage.setItem('productSubmissions', JSON.stringify(submissions));
      
      // Show toast notification
      toast({
        title: "Success!",
        description: "Your ad has been published successfully.",
      });
      
      // Navigate to my ads page
      navigate('/my-ads');
    } else {
      // If there's no submission (weird case), go back to publish page
      navigate('/publish');
    }
  };

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Choose Your Package</h1>
          <p className="text-gray-600 mt-1">Select the best option to promote your ad effectively</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {adPackages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative cursor-pointer ${
                selectedPackage === pkg.id 
                  ? 'border-blue-600 shadow-md' 
                  : 'border-gray-200 hover:border-blue-400'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-center">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  {pkg.price > 0 && <span className="text-gray-500 ml-1">/ {pkg.duration} days</span>}
                  {pkg.price === 0 && <span className="text-gray-500 ml-1">Free</span>}
                </div>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${selectedPackage === pkg.id ? 'bg-blue-600' : 'bg-gray-100 text-gray-700'}`}
                  variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                >
                  {selectedPackage === pkg.id ? 'Selected' : 'Select'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Did you know?</p>
            <p className="text-sm text-blue-700">Premium listings get up to 5x more views and sell 70% faster than basic listings.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 px-6" 
            onClick={handleContinue}
          >
            Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PackageSelection;
