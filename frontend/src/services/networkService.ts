import { fetchConfig, API_URL } from '@/lib/api';
import { api } from './api';

export interface NetworkNode {
  id: string;
  name: string;
  type: string;
  status: string;
  ip?: string;
  mac?: string;
  vendor?: string;
  open_ports?: number[];
}

export interface NetworkConnection {
  source: string;
  target: string;
  type: 'direct' | 'indirect';
}

export interface NetworkMap {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}

export interface DiscoveredDevice {
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  device_type: string;
  open_ports: number[];
  last_seen: string;
  first_seen: string;
  status: 'online' | 'offline';
}

export interface DevicesResponse {
  devices: DiscoveredDevice[];
  total: number;
  online: number;
  offline: number;
}

export interface ServiceInfo {
  name: string;
  port: number;
  status: string;
  version?: string;
}

export interface HostDetails {
  ip: string;
  mac?: string;
  services: ServiceInfo[];
  nmap_error?: string;
}

export interface HostDetailsOptions {
  profile?: 'top-100' | 'top-1000' | 'full';
}

export const networkApi = {
  // Get all discovered devices from background service
  getDiscoveredDevices: async (options?: { includeVulns?: boolean }): Promise<DevicesResponse> => {
    try {
      const qs = options?.includeVulns ? '?include_vulns=true' : '';
      const response = await api.get(`/network/devices${qs}`);
      return response;
    } catch (error) {
      console.error('Error fetching discovered devices:', error);
      return { devices: [], total: 0, online: 0, offline: 0 };
    }
  },

  // Get specific device details
  getDeviceDetails: async (ip: string): Promise<DiscoveredDevice> => {
    const response = await fetch(`${API_URL}/network/devices/${ip}`, {
      ...fetchConfig
    });

    if (!response.ok) throw new Error('Failed to get device details');
    return response.json();
  },

  // Get network map (enhanced with discovery service data)
  getNetworkMap: async (): Promise<NetworkMap> => {
    try {
      const response = await api.get('/network/map');
      return response || { nodes: [], connections: [] };
    } catch (error) {
      console.error('Error fetching network map:', error);
      return { nodes: [], connections: [] };
    }
  },

  // Discovery service controls
  startDiscovery: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/network/discovery/start', {});
      return response;
    } catch (error) {
      console.error('Error starting discovery:', error);
      throw error;
    }
  },

  stopDiscovery: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/network/discovery/stop', {});
      return response;
    } catch (error) {
      console.error('Error stopping discovery:', error);
      throw error;
    }
  },

  getDiscoveryStatus: async (): Promise<{
    running: boolean;
    discovered_devices_count: number;
    scan_interval: number;
    quick_scan_interval: number;
  }> => {
    try {
      const response = await api.get('/network/discovery/status');
      return response;
    } catch (error) {
      console.error('Error getting discovery status:', error);
      return {
        running: false,
        discovered_devices_count: 0,
        scan_interval: 300,
        quick_scan_interval: 60
      };
    }
  },

  // Legacy methods for backward compatibility
  discoverDevices: async () => {
    return networkApi.getDiscoveredDevices();
  }
};

export const networkInfoApi = {
  getArp: async (): Promise<{ items: { ip: string; mac?: string; state?: string }[] }> => {
    const response = await fetch(`${API_URL}/network/arp`, { ...fetchConfig });
    if (!response.ok) throw new Error('Failed to load ARP table');
    return response.json();
  },
  getInfo: async (): Promise<{ gateway?: string; dns?: string; dhcp?: string }> => {
    const response = await fetch(`${API_URL}/network/info`, { ...fetchConfig });
    if (!response.ok) throw new Error('Failed to load network info');
    return response.json();
  },
  getHostDetails: async (ip: string, options?: HostDetailsOptions): Promise<HostDetails> => {
    const params = new URLSearchParams({ ip });
    if (options?.profile) params.append('profile', options.profile);
    const response = await fetch(`${API_URL}/network/host?${params.toString()}`, { ...fetchConfig });
    if (!response.ok) throw new Error('Failed to load host details');
    return response.json();
  }
};