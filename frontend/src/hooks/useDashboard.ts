import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDashboard() {
  // Get dashboard summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.dashboard.getSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Get security score
  const { data: securityScore, isLoading: isLoadingSecurityScore } = useQuery({
    queryKey: ['security-score'],
    queryFn: () => api.dashboard.getSecurityScore(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Get recent activity
  const { data: recentActivity, isLoading: isLoadingRecentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.dashboard.getRecentActivity(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return {
    summary,
    securityScore,
    recentActivity,
    isLoading: isLoadingSummary || isLoadingSecurityScore || isLoadingRecentActivity,
  };
} 