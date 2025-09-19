import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  type: 'incoming' | 'outgoing';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const useWallet = () => {
  const { user } = useAuth();

  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError
  } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async (): Promise<WalletData | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_wallet')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching wallet:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Mock transactions for now since there's no transactions table
  const mockTransactions: WalletTransaction[] = [
    {
      id: '1',
      type: 'incoming',
      description: 'Sale: iPhone 15 Pro',
      amount: 1099.00,
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'outgoing',
      description: 'Withdrawal to Bank',
      amount: -500.00,
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      type: 'incoming',
      description: 'Sale: Gaming Headset',
      amount: 89.00,
      date: '2024-01-13',
      status: 'pending'
    },
    {
      id: '4',
      type: 'outgoing',
      description: 'Listing Fee',
      amount: -2.99,
      date: '2024-01-12',
      status: 'completed'
    }
  ];

  return {
    wallet,
    transactions: mockTransactions,
    loading: walletLoading,
    error: walletError
  };
};

