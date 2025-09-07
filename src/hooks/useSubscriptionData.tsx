import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";
import { useCallback } from "react";

interface SubscriptionStats {
  activePlans: number;
  totalSpent: number;
  nextBillingDate: string | null;
  loading: boolean;
}

export const useSubscriptionData = () => {
  const { user } = useAuth();

  const fetchSubscriptionStats = useCallback(async (): Promise<SubscriptionStats> => {
    if (!user) {
      return {
        activePlans: 0,
        totalSpent: 0,
        nextBillingDate: null,
        loading: false
      };
    }

    try {
      // Get active subscriptions
      const activeSubscriptions = await paymentService.getActiveSubscriptions(user.id);
      
      // Get payment history to calculate total spent
      const paymentHistory = await paymentService.getPaymentHistory(user.id);
      
      // Calculate total spent from successful payments
      const totalSpent = paymentHistory
        .filter(payment => payment.status === 'succeeded')
        .reduce((total, payment) => total + (payment.amount || 0), 0);
      
      // Find the next billing date from active subscriptions
      const nextBillingDate = activeSubscriptions.length > 0 
        ? activeSubscriptions
            .map(sub => new Date(sub.current_period_end))
            .sort((a, b) => a.getTime() - b.getTime())[0]
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;

      return {
        activePlans: activeSubscriptions.length,
        totalSpent: totalSpent / 100, // Convert from cents to main currency unit
        nextBillingDate,
        loading: false
      };
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      return {
        activePlans: 0,
        totalSpent: 0,
        nextBillingDate: null,
        loading: false
      };
    }
  }, [user]);

  const {
    data: stats = {
      activePlans: 0,
      totalSpent: 0,
      nextBillingDate: null,
      loading: true
    },
    isLoading,
    error
  } = useQuery({
    queryKey: ['subscription-stats', user?.id],
    queryFn: fetchSubscriptionStats,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...stats,
    loading: isLoading,
    error
  };
};
