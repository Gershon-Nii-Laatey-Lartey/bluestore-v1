import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { AdPackage } from '@/types/adPackage';
import { PromoCodeField } from './PromoCodeField';
import { usePaymentProcessor } from './PaymentProcessor';

interface PackageReviewProps {
  selectedPackage: AdPackage;
  onBack: () => void;
  onPaymentSuccess: () => void;
  userActiveAds?: number;
  freeAdsCount?: number;
}

export const PackageReview: React.FC<PackageReviewProps> = ({
  selectedPackage,
  onBack,
  onPaymentSuccess,
  userActiveAds = 0,
  freeAdsCount = 0
}) => {
  const [showPromoField, setShowPromoField] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(selectedPackage.price);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Ensure scroll reset when entering the review screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const { processPayment, processingPayment } = usePaymentProcessor({ 
    onPublishNow: onPaymentSuccess 
  });

  const handlePromoCodeApplied = (discount: number, final: number, promoCode: string) => {
    setDiscountAmount(discount);
    setFinalAmount(final);
    setAppliedPromoCode(promoCode);
  };

  const handlePromoCodeRemoved = () => {
    setDiscountAmount(0);
    setFinalAmount(selectedPackage.price);
    setAppliedPromoCode(null);
  };

  const handlePayment = async () => {
    await processPayment(selectedPackage, finalAmount);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(price);
  };

  const getDiscountDisplay = () => {
    if (discountAmount === 0) return '';
    const percentage = Math.round((discountAmount / selectedPackage.price) * 100);
    return `${percentage}% OFF`;
  };

  const isFreePackage = selectedPackage.price === 0;
  const isFreeLimitReached = isFreePackage && freeAdsCount >= (selectedPackage.adsAllowed || 0);

  const features = selectedPackage.features || [];
  const visibleFeatures = useMemo(() => (showAllFeatures ? features : features.slice(0, 4)), [features, showAllFeatures]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Compact header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-sm font-medium text-foreground/80">Review your selection</div>
      </div>

      {/* Package Summary Card */}
      <Card className="transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl font-semibold">
                {selectedPackage.name}
              </CardTitle>
              {selectedPackage.recommended && (
                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                  Recommended
                </Badge>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-primary leading-none">
                {formatPrice(finalAmount)}
              </div>
              {discountAmount > 0 && (
                <div className="text-xs text-muted-foreground line-through mt-1">
                  {formatPrice(selectedPackage.price)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Package Details - compact grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="text-muted-foreground">Ads Allowed</div>
            <div className="font-medium text-right">{selectedPackage.adsAllowed}</div>
            <div className="text-muted-foreground">Duration</div>
            <div className="font-medium text-right">{selectedPackage.duration}</div>
            <div className="text-muted-foreground">Plan Type</div>
            <div className="font-medium text-right capitalize">
              {selectedPackage.plan_type === 'subscription' ? 'Monthly Subscription' : 'One-time Payment'}
            </div>
          </div>

          {/* Features - collapsed by default to reduce noise */}
          {features.length > 0 && (
            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">Features</div>
              <ul className="space-y-2">
                {visibleFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
              {features.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllFeatures((v) => !v)}
                  className="mt-2 text-[13px] text-primary underline hover:no-underline"
                >
                  {showAllFeatures ? 'Show less' : `Show all ${features.length} features`}
                </button>
              )}
            </div>
          )}

          {/* Price Breakdown */}
          {discountAmount > 0 && (
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Price</span>
                <span className="line-through">{formatPrice(selectedPackage.price)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({getDiscountDisplay()})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(finalAmount)}</span>
              </div>
            </div>
          )}

          {/* Promo Code Section - always show input when not applied */}
          <div className="border-t pt-4">
            {!appliedPromoCode ? (
              <PromoCodeField
                originalAmount={selectedPackage.price}
                onPromoCodeApplied={handlePromoCodeApplied}
                onPromoCodeRemoved={handlePromoCodeRemoved}
              />
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Promo code applied: {appliedPromoCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePromoCodeRemoved}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <div className="space-y-4">
        {isFreeLimitReached ? (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">
              You've reached the limit for free ads. Please select a paid package.
            </p>
          </div>
        ) : (
          <Button
            onClick={handlePayment}
            disabled={processingPayment}
            className="w-full"
            size="lg"
          >
            {processingPayment ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {finalAmount === 0 ? 'Continue for Free' : `Pay ${formatPrice(finalAmount)}`}
              </>
            )}
          </Button>
        )}

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          {selectedPackage.plan_type === 'subscription' && (
            <span className="block mt-1">
              This is a recurring subscription that will renew automatically.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
