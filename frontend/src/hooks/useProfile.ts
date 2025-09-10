import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function useProfile() {
  const queryClient = useQueryClient();
  
  // Get user profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.user.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (userData: any) => api.user.updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.setQueryData(['user'], data);
      toast.success('Profile updated successfully');
    },
  });
  
  // Change password mutation
  const changePassword = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      api.user.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
  });
  
  return {
    profile,
    isLoading,
    error,
    updateProfile,
    changePassword,
  };
} 