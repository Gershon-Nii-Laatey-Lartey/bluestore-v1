import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserRoles {
  isAdmin: boolean;
  isCSWorker: boolean;
  loading: boolean;
}

export const useUserRoles = (): UserRoles => {
  const { user } = useAuth();

  const {
    data: roles = { isAdmin: false, isCSWorker: false },
    isLoading
  } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) {
        return { isAdmin: false, isCSWorker: false };
      }

      try {
        // Get all roles for the user
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const isAdmin = userRoles?.some(r => r.role === 'admin') || false;
        const isCSWorker = userRoles?.some(r => r.role === 'moderator') || false;

        return {
          isAdmin,
          isCSWorker
        };
      } catch (error) {
        console.error('Error checking user roles:', error);
        return { isAdmin: false, isCSWorker: false };
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 15 * 60 * 1000, // Cache for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });

  return {
    isAdmin: roles.isAdmin,
    isCSWorker: roles.isCSWorker,
    loading: isLoading
  };
};
