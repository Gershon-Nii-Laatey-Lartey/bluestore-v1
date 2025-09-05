import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { dataService } from '@/services/dataService';
import { csService } from '@/services/csService';

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
        const [adminStatus, csWorkerStatus] = await Promise.all([
          dataService.isAdmin(),
          csService.isCSWorker()
        ]);
        
        return {
          isAdmin: adminStatus,
          isCSWorker: csWorkerStatus
        };
      } catch (error) {
        console.error('Error checking user roles:', error);
        return { isAdmin: false, isCSWorker: false };
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    cacheTime: 15 * 60 * 1000, // Cache for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });

  return {
    isAdmin: roles.isAdmin,
    isCSWorker: roles.isCSWorker,
    loading: isLoading
  };
};
