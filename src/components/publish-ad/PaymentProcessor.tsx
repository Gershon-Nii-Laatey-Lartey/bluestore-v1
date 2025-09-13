
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import { AdPackage } from "@/types/adPackage";
import { PromoCodeField } from "./PromoCodeField";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaymentProcessorProps {
  onPublishNow: (packageId: string) => void;
}

export const usePaymentProcessor = ({ onPublishNow }: PaymentProcessorProps) => {
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load Paystack inline script
    if (!document.querySelector('script[src*="paystack"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded successfully');
        setPaystackLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        toast({
          title: "Script Load Error",
          description: "Failed to load payment system. Please refresh and try again.",
          variant: "destructive"
        });
      };
      document.body.appendChild(script);
    } else {
      setPaystackLoaded(true);
    }
  }, []);

  const handlePromoCodeApplied = (discount: number, final: number, promoCode: string) => {
    setDiscountAmount(discount);
    setFinalAmount(final);
  };

  const handlePromoCodeRemoved = () => {
    setDiscountAmount(0);
    setFinalAmount(0);
  };

  const processPayment = async (selectedPkg: AdPackage, overrideAmount?: number) => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment.",
        variant: "destructive"
      });
      return;
    }

    // Calculate the actual amount to charge (considering promo codes)
    const amountToCharge = overrideAmount !== undefined
      ? overrideAmount
      : (finalAmount > 0 ? finalAmount : selectedPkg.price);

    // If package is free or promo code makes it free, handle directly
    if (selectedPkg.price === 0 || amountToCharge === 0) {
      onPublishNow(selectedPkg.id);
      return;
    }

    if (!paystackLoaded) {
      toast({
        title: "Payment System Not Ready",
        description: "Payment system is still loading. Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    if (!window.PaystackPop) {
      toast({
        title: "Payment System Error",
        description: "Payment system not available. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setProcessingPayment(true);

    try {
      console.log('🎯 Initializing payment for package:', selectedPkg);
      console.log('💰 Amount:', amountToCharge);
      console.log('🆔 Package ID being sent:', selectedPkg.id);
      
      const paymentData = {
        email: user.email,
        amount: amountToCharge,
        currency: 'GHS',
        metadata: {
          plan_id: selectedPkg.id,
          plan_name: selectedPkg.name,
          user_id: user.id,
          original_amount: selectedPkg.price,
          discount_amount: discountAmount,
          final_amount: amountToCharge
        }
      };

      console.log('📤 Payment data being sent:', paymentData);

      const response = await paymentService.initializePayment(paymentData);
      console.log('Payment initialization response:', response);

      if (!response.status) {
        throw new Error(response.message || 'Failed to initialize payment');
      }

      const handler = window.PaystackPop.setup({
        key: response.data.public_key || 'pk_test_0d4e4b6c6b82e5e72cfe9cf92d6f5e6c5f7a2c3d',
        email: user.email,
        amount: amountToCharge * 100, // Paystack expects amount in kobo
        currency: 'GHS',
        ref: response.data.reference,
        callback: function(response: any) {
          console.log('🎉 Paystack callback received:', response);
          if (response.status === 'success') {
            console.log('✅ Payment successful, calling verifyPayment...');
            // Handle successful payment
            paymentService.verifyPayment(response.reference)
              .then((verifyResult) => {
                console.log('✅ Payment verification successful:', verifyResult);
                toast({
                  title: "Payment Successful!",
                  description: "Your payment has been processed successfully.",
                });
                onPublishNow(selectedPkg.id);
              })
              .catch((verifyError) => {
                console.error('❌ Payment verification failed:', verifyError);
                toast({
                  title: "Payment Verification Failed",
                  description: "Please contact support if you were charged.",
                  variant: "destructive"
                });
              })
              .finally(() => {
                setProcessingPayment(false);
              });
          } else {
            toast({
              title: "Payment Failed",
              description: "Payment was not completed. Please try again.",
              variant: "destructive"
            });
            setProcessingPayment(false);
          }
        },
        onClose: function() {
          console.log('Paystack popup closed');
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again anytime.",
          });
          setProcessingPayment(false);
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setProcessingPayment(false);
    }
  };

  return {
    processPayment,
    processingPayment,
    discountAmount,
    finalAmount,
    handlePromoCodeApplied,
    handlePromoCodeRemoved,
    PromoCodeField: ({ originalAmount }: { originalAmount: number }) => (
      <PromoCodeField
        originalAmount={originalAmount}
        onPromoCodeApplied={handlePromoCodeApplied}
        onPromoCodeRemoved={handlePromoCodeRemoved}
      />
    )
  };
};
