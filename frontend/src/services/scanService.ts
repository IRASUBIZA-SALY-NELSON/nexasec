import { api } from './api';
import type { ScanResult } from '@/types';
import { API_URL } from '@/lib/api';
import { } from './api';

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
        
        const response = await api.post('/scans/start', formData);
        return response;
      }
      
      // Regular JSON request without file
      const response = await api.post('/scans/start', config);
      return response;
    } catch (error) {
      console.error('Error starting scan:', error);
      throw new Error('Failed to start scan. Please try again.');
    }
  },

  getScanStatus: async (scanId: string): Promise<ScanResult> => {
    try {
      const response = await api.get(`/scans/${scanId}/status`);
      return response;
    } catch (error) {
      console.error('Error getting scan status:', error);
      throw new Error('Failed to get scan status');
    }
  },

  getScanResults: async (id: string): Promise<ScanResult> => {
    const response = await api.get(`/scans/${id}/results`);
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
    const endpoint = params.toString() ? `/scans?${params.toString()}` : `/scans`;
    const response = await api.get(endpoint);
    return response;
  },

  getScansPage: async (options: { skip?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (options.skip !== undefined) params.append('skip', String(options.skip));
    if (options.limit !== undefined) params.append('limit', String(options.limit));
    const url = `${API_URL}/scans${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(typeof window !== 'undefined' && document.cookie ? {} : {}),
      }
    });
    if (!res.ok) throw new Error('Failed to list scans');
    const totalStr = res.headers.get('X-Total-Count');
    const total = totalStr ? Number(totalStr) : undefined;
    const items = await res.json();
    return { items, total };
  },

  downloadResults: async (id: string): Promise<Blob> => {
    const res = await fetch(`${API_URL}/scans/${id}/download`, { credentials: 'include' });
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