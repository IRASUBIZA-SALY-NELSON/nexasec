import { api } from './api';
import type { ScanResult } from '@/types';
import { API_URL } from '@/lib/api';
import { getCookie } from 'cookies-next';

export interface ScanConfig {
  networkTarget: string;
  outputDirectory: string;
  scanType: 'network' | 'web' | 'full';
  useCustomPasswordList: boolean;
  customPasswordList?: File;
}

export const scanService = {
  startScan: async (config: ScanConfig): Promise<{ scanId: string }> => {
    try {
      // Create FormData if there's a file
      if (config.customPasswordList) {
        const formData = new FormData();
        formData.append('networkTarget', config.networkTarget);
        formData.append('outputDirectory', config.outputDirectory);
        formData.append('scanType', config.scanType);
        formData.append('useCustomPasswordList', String(config.useCustomPasswordList));
        formData.append('customPasswordList', config.customPasswordList);

        const response = await api.post<FormData, { scanId: string }>('/scans/start', formData);
        return response;
      }

      // Regular JSON request without file
      const response = await api.post<ScanConfig, { scanId: string }>('/scans/start', config);
      return response;
    } catch (error) {
      console.error('Error starting scan:', error);
      throw new Error('Failed to start scan. Please try again.');
    }
  },

  getScanStatus: async (scanId: string): Promise<ScanResult> => {
    try {
      const response = await api.get<ScanResult>(`/scans/${scanId}/status`);
      return response;
    } catch (error) {
      console.error('Error getting scan status:', error);
      throw new Error('Failed to get scan status');
    }
  },

  getScanResults: async (id: string): Promise<ScanResult> => {
    const response = await api.get<ScanResult>(`/scans/${id}/results`);
    return response;
  },

  getAllScans: async (scanId?: string, options?: { skip?: number; limit?: number }) => {
    if (scanId) {
      const endpoint = `/scans/${scanId}/status`;
      const response = await api.get(endpoint);
      return response;
    }
    const params = new URLSearchParams();
    if (options?.skip !== undefined) params.append('skip', String(options.skip));
    if (options?.limit !== undefined) params.append('limit', String(options.limit));
    const endpoint = params.toString() ? `/scans/?${params.toString()}` : `/scans/`;
    const response = await api.get(endpoint);
    return response;
  },

  getScansPage: async (options: { skip?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (options.skip !== undefined) params.append('skip', String(options.skip));
    if (options.limit !== undefined) params.append('limit', String(options.limit));
    // Use centralized API client and canonical trailing slash to avoid redirect header loss
    const endpoint = `/scans/${params.toString() ? `?${params.toString()}` : ''}`;
    const items = await api.get(endpoint);
    // If backend returns total count via header in fetch, ensure the API also returns it in body or adapt here.
    // For now, infer total from array length if header is unavailable.
    const total = Array.isArray(items) ? items.length : undefined;
    return { items, total };
  },

  downloadResults: async (id: string): Promise<Blob> => {
    const token = typeof window !== 'undefined'
      ? (getCookie('auth_token') as string) || localStorage.getItem('token') || localStorage.getItem('auth_token') || ''
      : '';
    const res = await fetch(`${API_URL}/scans/${id}/download`, {
      credentials: 'include',
      mode: 'cors',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    });
    if (!res.ok) throw new Error('Failed to download scan results');
    return res.blob();
  }
};

// Export individual functions for backward compatibility
export const startNetworkScan = scanService.startScan;
export const getScanStatus = scanService.getScanStatus;
export const getScanResults = scanService.getScanResults;
export const searchScanResults = scanService.getAllScans;
export const downloadScanResults = scanService.downloadResults;
export type { ScanResult } from '@/types'; 