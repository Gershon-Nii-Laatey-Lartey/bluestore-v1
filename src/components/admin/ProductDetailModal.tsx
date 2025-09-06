
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { ProductSubmission } from "@/services/dataService";
import { formatPrice } from "@/utils/formatters";
import { DocumentImage } from "./DocumentImage";
import { ProductImages } from "@/components/product/ProductImages";
import { ProductRejectionModal } from "./ProductRejectionModal";
import { ProductSuggestionModal } from "./ProductSuggestionModal";
import { useState } from "react";

interface ProductDetailModalProps {
  product: ProductSubmission;
  onApproval: (submissionId: string, approved: boolean, rejectionReason?: string, suggestions?: string) => void;
}

export const ProductDetailModal = ({ product, onApproval }: ProductDetailModalProps) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDirectApprove = async () => {
    setIsSubmitting(true);
    await onApproval(product.id, true);
    setIsSubmitting(false);
  };

  const handleSuggestionSubmit = async (suggestion: string) => {
    setIsSubmitting(true);
    await onApproval(product.id, true, undefined, suggestion);
    setIsSubmitting(false);
    setShowSuggestionModal(false);
  };

  const handleSkipSuggestion = async () => {
    setIsSubmitting(true);
    await onApproval(product.id, true);
    setIsSubmitting(false);
    setShowSuggestionModal(false);
  };

  const handleReject = async (reason: string) => {
    setIsSubmitting(true);
    await onApproval(product.id, false, reason);
    setIsSubmitting(false);
    setShowRejectionModal(false);
  };

  return (
    <>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl pr-8">{product.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Product Image */}
          <div className="space-y-4 order-1">
            <ProductImages 
              images={product.images || []} 
              title={product.title} 
              mainImageIndex={product.main_image_index}
            />
          </div>
          
          {/* Product Details */}
          <div className="space-y-4 order-2">
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3">Product Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground">{product.category}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-medium text-foreground">{product.condition}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatPrice(product.price)}</span>
                </div>
                {product.originalPrice && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-muted-foreground">Original Price:</span>
                    <span className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">{product.location}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{product.phone}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-muted-foreground">Negotiable:</span>
                  <span className="font-medium text-foreground">{product.negotiable ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                onClick={handleDirectApprove}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? "Approving..." : "Quick Approve"}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/20 w-full sm:w-auto"
                onClick={() => setShowSuggestionModal(true)}
                disabled={isSubmitting}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggest & Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => setShowRejectionModal(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <ProductRejectionModal
          productTitle={product.title}
          onReject={handleReject}
          onCancel={() => setShowRejectionModal(false)}
          isSubmitting={isSubmitting}
        />
      </Dialog>

      <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
        <ProductSuggestionModal
          productTitle={product.title}
          onSuggestion={handleSuggestionSubmit}
          onSkip={handleSkipSuggestion}
          onCancel={() => setShowSuggestionModal(false)}
          isSubmitting={isSubmitting}
        />
      </Dialog>
    </>
  );
};
