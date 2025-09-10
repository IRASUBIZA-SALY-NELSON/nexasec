import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function useSecurityScans() {
  const queryClient = useQueryClient();
  
  // Get scan history
  const { data: scanHistory, isLoading: isLoadingScanHistory } = useQuery({
    queryKey: ['scan-history'],
    queryFn: () => api.securityScans.getScanHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Start new scan mutation
  const startScan = useMutation({
    mutationFn: ({ target, scanType }: { target: string; scanType: string }) => 
      api.securityScans.startScan(target, scanType),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scan-history'] });
      toast.success('Security scan started');
      return data;
    },
  });
  
  // Get scan status
  const getScanStatus = (scanId: string) => {
    return useQuery({
      queryKey: ['scan-status', scanId],
      queryFn: () => api.securityScans.getScanStatus(scanId),
      enabled: !!scanId,
      refetchInterval: (data) => {
        // Refetch every 5 seconds until scan is complete
        return data?.status === 'completed' || data?.status === 'failed' ? false : 5000;
      },
    });
  };
  
  // Get scan results
  const getScanResults = (scanId: string) => {
    return useQuery({
      queryKey: ['scan-results', scanId],
      queryFn: () => api.securityScans.getScanResults(scanId),
      enabled: !!scanId,
    });
  };
  
  return {
    scanHistory,
    isLoadingScanHistory,
    startScan,
    getScanStatus,
    getScanResults,
  };
} 