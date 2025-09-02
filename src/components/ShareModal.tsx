
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Smartphone } from "lucide-react";
import { shareProduct, isWebShareSupported } from "@/utils/shareUtils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productUrl: string;
}

export const ShareModal = ({ isOpen, onClose, productTitle, productUrl }: ShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    const success = await shareProduct(
      productTitle,
      productUrl,
      () => {
        // Close modal after successful share
        onClose();
      },
      (error) => {
        toast({
          title: "Error",
          description: "Failed to share. Please try again.",
          variant: "destructive"
        });
      }
    );

    if (!success) {
      // Fallback for browsers that don't support Web Share API
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support native sharing. Use the copy link option instead.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={productUrl} readOnly className="flex-1" />
            <Button size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          
          <div className="space-y-2">
            {isWebShareSupported() ? (
              <Button 
                onClick={handleNativeShare} 
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Share2 className="h-4 w-4" />
                <span>Share via...</span>
              </Button>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Native sharing is not supported in your browser.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use the copy link option above to share manually.
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center">
              {isWebShareSupported() 
                ? "Tap to open your device's native sharing options"
                : "Copy the link above to share manually"
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
