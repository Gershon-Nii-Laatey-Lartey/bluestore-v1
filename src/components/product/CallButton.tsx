import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { adAnalyticsService } from "@/services/adAnalyticsService";

interface CallButtonProps {
  phoneNumber: string;
  productId: string;
  className?: string;
}

export const CallButton = ({ phoneNumber, productId, className = "" }: CallButtonProps) => {
  const [showNumber, setShowNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleClick = async () => {
    if (!showNumber) {
      // First click: reveal number and copy to clipboard
      try {
        await navigator.clipboard.writeText(phoneNumber);
        setCopied(true);
        setShowNumber(true);
        
        // Track call button click for analytics
        adAnalyticsService.trackClick(productId).catch(error => {
          console.error('Error tracking call button click:', error);
        });
        
        toast({
          title: "Phone number copied!",
          description: "Seller's phone number has been copied to clipboard",
        });

        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy phone number to clipboard",
          variant: "destructive"
        });
      }
    } else if (isMobile) {
      // Second click on mobile: make phone call
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // Second click on desktop: hide number
      setShowNumber(false);
    }
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main button click
    
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      
      toast({
        title: "Phone number copied!",
        description: "Seller's phone number has been copied to clipboard",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy phone number to clipboard",
        variant: "destructive"
      });
    }
  };

  if (!phoneNumber) {
    return null;
  }

  if (!showNumber) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClick}
        className={`flex items-center gap-1 ${className}`}
      >
        <Phone className="h-4 w-4" />
        Call
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleClick}
        className={`flex items-center gap-1 ${className}`}
      >
        <Phone className="h-4 w-4" />
        {isMobile ? "Call Now" : "Hide"}
      </Button>
      
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <span className="text-sm font-mono text-gray-700">{phoneNumber}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyClick}
          className="h-6 w-6 p-0 hover:bg-gray-200"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-gray-600" />
          )}
        </Button>
      </div>
    </div>
  );
};
