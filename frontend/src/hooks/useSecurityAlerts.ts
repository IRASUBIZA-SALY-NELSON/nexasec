import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSecurityAlerts(params?: { page?: number; limit?: number; severity?: string }) {
  const queryClient = useQueryClient();
  
  // Get alerts
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['security-alerts', params],
    queryFn: () => api.securityAlerts.getAlerts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mark alert as read mutation
  const markAlertAsRead = useMutation({
    mutationFn: (alertId: string) => api.securityAlerts.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
    },
  });
  
  return {
    alerts,
    isLoading,
    error,
    markAlertAsRead,
  };
}

// Dedicated hook to fetch an alert by id (valid hook usage)
export function useAlertById(alertId: string) {
  return useQuery({
    queryKey: ['security-alert', alertId],
    queryFn: () => api.securityAlerts.getAlertById(alertId),
    enabled: !!alertId,
  });
}