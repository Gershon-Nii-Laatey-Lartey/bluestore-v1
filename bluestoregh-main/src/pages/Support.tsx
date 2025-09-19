
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageCircle, Mail, Phone, Book, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Support = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How do I publish an ad?",
      answer: "Click on the 'Publish Ad' button in your profile or use the main navigation. Fill in all required details about your product including photos, description, and price."
    },
    {
      question: "How can I contact a seller?",
      answer: "Click on the 'Contact Vendor' button on any product page or vendor profile to reveal their contact information including phone and email."
    },
    {
      question: "What payment methods are accepted?",
      answer: "Payment methods vary by seller. Most accept mobile money, bank transfers, and cash on delivery. Check with the seller for their preferred payment options."
    },
    {
      question: "How do I edit my profile?",
      answer: "Go to your profile page and click the 'Edit' button. You can update your personal information, contact details, and profile picture."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take privacy seriously. Your contact information is only shared when you choose to contact a seller or when someone contacts you about your ads."
    }
  ];

  const handleLiveChat = () => {
    navigate("/chat?support=true");
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-1">Get help with using BlueStore</p>
        </div>

        {/* Live Chat Button */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Need immediate help?</h3>
                  <p className="text-gray-600">Chat with our customer service team in real-time</p>
                </div>
              </div>
              <Button 
                onClick={handleLiveChat}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Book className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
              <p className="text-sm text-gray-600">Learn how to use all features</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-sm text-gray-600">Join our user community</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleLiveChat}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600">Chat with our support team</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                <p className="text-gray-600 text-sm">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What do you need help with?" />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or question in detail..." 
                  className="min-h-[120px]"
                />
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700">Send Message</Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Other Ways to Reach Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Email Support</div>
                  <div className="text-sm text-gray-600">support@bluestore.com</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Phone Support</div>
                  <div className="text-sm text-gray-600">+233 30 123 4567</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (GMT)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Support;
