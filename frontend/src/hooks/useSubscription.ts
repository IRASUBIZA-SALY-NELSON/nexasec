import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function useSubscription() {
  const queryClient = useQueryClient();
  
  // Get available plans
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => api.subscriptions.getPlans(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Get current subscription
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: () => api.subscriptions.getCurrentSubscription(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Subscribe to plan mutation
  const subscribe = useMutation({
    mutationFn: ({ planId, paymentMethod }: { planId: string; paymentMethod: string }) => 
      api.subscriptions.subscribe(planId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      toast.success('Subscription successful');
    },
  });
  
  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: () => api.subscriptions.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      toast.success('Subscription cancelled');
    },
  });
  
  return {
    plans,
    currentSubscription,
    isLoading: isLoadingPlans || isLoadingSubscription,
    subscribe,
    cancelSubscription,
  };
} 