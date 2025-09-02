
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Smartphone, Link, MessageSquare } from "lucide-react";
import { shareProduct, canShare, copyToClipboard } from "@/utils/shareUtils";

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
      const success = await copyToClipboard(productUrl);
      if (success) {
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Product link has been copied to clipboard"
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link. Please manually select and copy the URL above.",
        variant: "destructive"
      });
    }
  };

  const handleCopyText = async () => {
    try {
      const shareText = `Check out this product: ${productTitle}\n${productUrl}`;
      const success = await copyToClipboard(shareText);
      if (success) {
        toast({
          title: "Text copied!",
          description: "Product information has been copied to clipboard"
        });
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      console.error('Error copying text:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy text. Please try copying the link instead.",
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
        console.error('Share error:', error);
        // Don't show error toast, just fall back to copy options
      }
    );

    if (!success) {
      // Fallback: copy to clipboard
      await handleCopyLink();
    }
  };

  const isSharingSupported = canShare();

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
          
          <div className="space-y-3">
            {isSharingSupported ? (
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
                  Native sharing not available
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use the copy options below
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-2"
              >
                <Link className="h-4 w-4" />
                <span>Copy Link</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCopyText}
                className="flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Copy Text</span>
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              {isSharingSupported 
                ? "Tap to open your device's native sharing options"
                : "Copy the link or text to share manually"
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
