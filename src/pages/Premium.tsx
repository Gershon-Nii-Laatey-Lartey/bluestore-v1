import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const Premium = () => {
  const premiumFeatures = [
    {
      icon: Zap,
      title: "Priority Listing",
      description: "Your ads appear at the top of search results and category pages",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: Eye,
      title: "Enhanced Visibility",
      description: "Get 3x more views and engagement on your listings",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Detailed insights into your ad performance and customer behavior",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: MessageSquare,
      title: "Priority Support",
      description: "Get faster response times and dedicated customer support",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Shield,
      title: "Verified Badge",
      description: "Build trust with customers through verified seller status",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      icon: Target,
      title: "Targeted Promotion",
      description: "Reach your ideal customers with advanced targeting options",
      color: "text-pink-600",
      bgColor: "bg-pink-100"
    }
  ];

  const benefits = [
    "Unlimited ad postings",
    "Advanced search filters",
    "Custom ad templates",
    "Bulk upload tools",
    "Email marketing integration",
    "Social media promotion",
    "Detailed performance reports",
    "24/7 premium support"
  ];

  return (
    <Layout>
      <div className="md:hidden w-full">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in w-full">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Crown className="h-16 w-16 text-yellow-300" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Unlock Premium Features
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-purple-100">
                Take your business to the next level with our premium tools and features
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Star className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  View Pricing Plans
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Premium Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the powerful tools and features that will help you sell more and grow your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-full ${feature.bgColor} mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose Premium?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Join thousands of successful sellers who have transformed their business with our premium features.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                    <div className="text-4xl font-bold text-purple-600 mb-4">
                      GHS 99<span className="text-lg text-gray-500">/month</span>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Everything you need to maximize your sales and grow your business
                    </p>
                    <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Success Stories
              </h2>
              <p className="text-xl text-gray-300">
                See how premium features have helped our users achieve their goals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
                <div className="text-gray-300">Active Premium Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">3x</div>
                <div className="text-gray-300">More Sales on Average</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-gray-300">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-gray-300">Premium Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Start your premium journey today and unlock the full potential of your listings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
