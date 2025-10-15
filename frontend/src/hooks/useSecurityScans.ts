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

  return {
    scanHistory,
    isLoadingScanHistory,
    startScan,
  };
}

// Minimal status typing from API for refetch logic
type ScanStatus = {
  status?: 'in_progress' | 'completed' | 'failed' | string;
};

export function useScanStatus(scanId: string) {
  return useQuery<ScanStatus>({
    queryKey: ['scan-status', scanId],
    queryFn: () => api.securityScans.getScanStatus(scanId),
    enabled: !!scanId,
    refetchInterval: (data) => {
      // Refetch every 5 seconds until scan is complete
      return data?.status === 'completed' || data?.status === 'failed' ? false : 5000;
    },
  });
}

export function useScanResults(scanId: string) {
  return useQuery({
    queryKey: ['scan-results', scanId],
    queryFn: () => api.securityScans.getScanResults(scanId),
    enabled: !!scanId,
  });
}