"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import FilterTabs from "@/components/dashboard/FilterTabs";
import SearchBar from "@/components/dashboard/SearchBar";
import ActionButtons from "@/components/dashboard/ActionButtons";
import SummaryCards from "@/components/dashboard/SummaryCards";
import { scanService } from "@/services/scanService";
import { networkApi, NetworkMap, DiscoveredDevice } from "@/services/networkService";
import NetworkGraph from '@/components/NetworkGraph';
import CyberLoader from '@/components/ui/CyberLoader';
import * as api from "@/services/api";
import { logsApi } from "@/services/api";

interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  type: string;
  status: string;
  lastSeen: string;
  vulnerabilities: number;
  mac?: string;
  hostname?: string;
  vendor?: string;
  open_ports?: number[];
  first_seen?: string;
}

interface NetworkScan {
  id: string;
  timestamp: string;
  duration: string;
  devicesScanned: number;
  vulnerabilitiesFound: number;
  status: 'completed' | 'in_progress' | 'failed';
}

export default function NetworkPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<NetworkDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<NetworkScan[]>([]);
  const [scanSkip, setScanSkip] = useState(0);
  const [scanLimit] = useState(20);
  const [totalScans, setTotalScans] = useState<number | undefined>(undefined);
  const [networkData, setNetworkData] = useState<NetworkMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [discoveryStatus, setDiscoveryStatus] = useState({ running: false, discovered_devices_count: 0 });
  const [refreshMs, setRefreshMs] = useState(30000);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch discovered devices from the background service
      const devicesResponse = await networkApi.getDiscoveredDevices({ includeVulns: true });
      console.log('Discovered devices:', devicesResponse);

      // Convert discovered devices to NetworkDevice format
      const deviceList: NetworkDevice[] = devicesResponse.devices.map((device: DiscoveredDevice) => ({
        id: device.ip,
        name: device.hostname || device.ip,
        ip: device.ip,
        type: device.device_type,
        status: device.status,
        lastSeen: device.last_seen,
        vulnerabilities: (device as any).vulnerabilities || 0,
        mac: device.mac,
        hostname: device.hostname,
        vendor: device.vendor,
        open_ports: device.open_ports,
        first_seen: device.first_seen
      }));

      // Fetch network map
      const networkMap = await networkApi.getNetworkMap();

      // Fetch discovery status
      const status = await networkApi.getDiscoveryStatus();
      setDiscoveryStatus(status);
      // Auto-start discovery if it is not running
      if (!status.running) {
        try { await networkApi.startDiscovery(); } catch { }
      }

      // Try to fetch scan history
      let scanHistoryData;
      try {
        const page = await scanService.getScansPage({ skip: 0, limit: scanLimit });
        scanHistoryData = page.items;
        setTotalScans(page.total);
        setScanSkip(page.items?.length || 0);
        // Map backend fields to UI expectations
        const mappedHistory: NetworkScan[] = (scanHistoryData || []).map((s: any) => {
          const created = s.created_at ? new Date(s.created_at) : null;
          const updated = s.end_time ? new Date(s.end_time) : (s.updated_at ? new Date(s.updated_at) : null);
          const durationSec = created && updated ? Math.max(0, Math.round((updated.getTime() - created.getTime()) / 1000)) : null;
          const vulnCount = typeof s.vulnerabilities_found === 'number'
            ? s.vulnerabilities_found
            : (s.vulnerability_counts
              ? Object.values(s.vulnerability_counts).reduce((acc: number, val: any) => acc + (typeof val === 'number' ? val : 0), 0)
              : 0);
          const formatDuration = (secs: number) => {
            if (secs < 60) return `${secs}s`;
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            if (m < 60) return `${m}m ${s}s`;
            const h = Math.floor(m / 60);
            const mm = m % 60;
            return `${h}h ${mm}m ${s}s`;
          };
          return {
            id: s.id || s._id || '',
            timestamp: created ? created.toLocaleString() : '',
            duration: durationSec !== null ? formatDuration(durationSec) : '-',
            devicesScanned: typeof s.total_hosts === 'number' ? s.total_hosts : 0,
            vulnerabilitiesFound: vulnCount,
            status: (s.status || 'completed') as NetworkScan['status'],
          };
        });
        setScanHistory(mappedHistory);
      } catch (err) {
        console.error('Error fetching scan history:', err);
        scanHistoryData = [];
      }

      setDevices(deviceList);
      setFilteredDevices(deviceList);
      setNetworkData(networkMap);
      setError(null);

    } catch (err) {
      const msg = (err as any)?.message || 'Failed to load network data';
      setError(msg);
      console.error('Error loading network data:', err);
      if (msg.includes('401')) {
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up periodic refresh respecting current refreshMs
    const interval = setInterval(loadData, refreshMs);

    return () => clearInterval(interval);
  }, [refreshMs]);

  // Adjust refresh interval dynamically depending on discovery running state
  useEffect(() => {
    setRefreshMs(discoveryStatus.running ? 10000 : 30000);
  }, [discoveryStatus.running]);

  const loadMoreScans = async () => {
    try {
      const page = await scanService.getScansPage({ skip: scanSkip, limit: scanLimit });
      const mapped: NetworkScan[] = (page.items || []).map((s: any) => {
        const created = s.created_at ? new Date(s.created_at) : null;
        const updated = s.end_time ? new Date(s.end_time) : (s.updated_at ? new Date(s.updated_at) : null);
        const durationSec = created && updated ? Math.max(0, Math.round((updated.getTime() - created.getTime()) / 1000)) : null;
        const sum = s.vulnerability_counts ? Object.values(s.vulnerability_counts).reduce((a: number, v: any) => a + (typeof v === 'number' ? v : 0), 0) : 0;
        const format = (secs: number) => secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
        return {
          id: s.id || s._id || '',
          timestamp: created ? created.toLocaleString() : '',
          duration: durationSec !== null ? format(durationSec) : '-',
          devicesScanned: typeof s.total_hosts === 'number' ? s.total_hosts : 0,
          vulnerabilitiesFound: typeof s.vulnerabilities_found === 'number' ? s.vulnerabilities_found : sum,
          status: (s.status || 'completed') as NetworkScan['status'],
        };
      });
      setScanHistory(prev => [...prev, ...mapped]);
      setScanSkip(prev => prev + (page.items?.length || 0));
      if (page.total !== undefined) setTotalScans(page.total);
    } catch (e) {
      console.error('Failed to load more scans', e);
    }
  };

  const handleRunScan = async () => {
    try {
      setIsScanning(true);
      toast.loading("Network scan in progress...");

      // Start a new scan
      const scan = await scanService.startScan({
        networkTarget: 'all',
        outputDirectory: 'network_scan',
        scanType: 'network',
        useCustomPasswordList: false
      });

      // Poll for scan completion and tail logs
      const pollInterval = setInterval(async () => {
        const status = await scanService.getScanStatus(scan.scanId);
        // fetch latest logs chunk
        try {
          const logs = await logsApi.list({ limit: 50 });
          const messages = (logs.items || []).slice(0, 50).map((it: any) => `${it.time} ${it.level} ${it.message}`);
          setScanLogs(messages);
        } catch { }
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          setIsScanning(false);
          toast.dismiss();
          toast.success("Network scan completed");

          // Refresh data
          await loadData();
        }
      }, 2000);

    } catch (error) {
      console.error('Error running network scan:', error);
      setIsScanning(false);
      toast.dismiss();
      toast.error('Failed to run network scan');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatPorts = (ports: number[] = []) => {
    if (!ports || ports.length === 0) return 'None';
    if (ports.length <= 3) return ports.join(', ');
    return `${ports.slice(0, 3).join(', ')} +${ports.length - 3} more`;
  };

  if (loading) {
    return <CyberLoader fullScreen text="Mapping your network..." duration={3000} />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Network Security</h1>
          <p className="text-sm text-gray-400">
            Discovery Service: {discoveryStatus.running ?
              <span className="text-green-400">🟢 Running ({discoveryStatus.discovered_devices_count} devices)</span> :
              <span className="text-red-400">🔴 Stopped</span>
            }
          </p>
        </div>
        <ActionButtons
          primaryAction={{
            label: isScanning ? "Scanning..." : "Run Network Scan",
            onClick: handleRunScan
          }}
        />
      </div>

      {/* Network Summary */}
      <div className="mb-6">
        <SummaryCards
          items={[
            {
              title: "Total Devices",
              count: devices.length,
              description: "Devices discovered",
              color: "blue"
            },
            {
              title: "Online Devices",
              count: devices.filter(d => d.status === "online").length,
              description: "Currently active",
              color: "green"
            },
            {
              title: "Offline Devices",
              count: devices.filter(d => d.status === "offline").length,
              description: "Currently inactive",
              color: "red"
            },
            {
              title: "Vulnerable Devices",
              count: devices.filter(d => d.vulnerabilities > 0).length,
              description: "Require attention",
              color: "red"
            }
          ]}
        />
      </div>

      {/* Tabs and Search */}
      <div className="mb-4">
        <FilterTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "online", label: "Online" },
            { id: "offline", label: "Offline" },
            { id: "vulnerable", label: "Vulnerable" }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="Search devices by name, IP, MAC, hostname, or vendor..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Scan progress animation */}
      {isScanning && (
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4 mb-6">
          <div className="typewriter text-cyan-300 text-sm mb-2">[+] Initiating reconnaissance... parsing routes... probing hosts... mapping services...</div>
          <div className="relative h-2 bg-gray-800 rounded overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-cyan-600 scanbar"></div>
          </div>
          <div className="bg-black/40 mt-3 rounded p-3 h-40 overflow-auto font-mono text-xs text-gray-300">
            {scanLogs.map((l, i) => (<div key={i}>{l}</div>))}
          </div>
        </div>
      )}

      {/* Enhanced Devices Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  MAC Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Hostname
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vendor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Open Ports
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Seen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  First Seen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vulnerabilities
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredDevices.map((device) => (
                <tr key={device.id} className={`cursor-pointer hover:bg-gray-800/40 ${isScanning ? 'shimmer' : ''}`} onClick={() => device.ip && router.push(`/dashboard/network/host/${encodeURIComponent(device.ip)}`)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${device.status === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      {device.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {device.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {device.mac || <span className="text-gray-600">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {device.hostname || <span className="text-gray-600">Unknown</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {device.vendor || <span className="text-gray-600">Unknown</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                      {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'online' ? "bg-green-900/30 text-green-400" :
                      "bg-red-900/30 text-red-400"
                      }`}>
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    <span className="text-xs bg-gray-800/60 px-2 py-1 rounded">
                      {formatPorts(device.open_ports)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatTimestamp(device.lastSeen)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {device.first_seen ? formatTimestamp(device.first_seen) : <span className="text-gray-600">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${device.vulnerabilities > 0 ? "text-red-400" : "text-green-400"
                      }`}>
                      {device.vulnerabilities}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show message if no devices found */}
      {filteredDevices.length === 0 && (
        <div className="text-center py-8">
          {devices.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <CyberLoader fullScreen={false} text="Background discovery is scanning your network..." duration={5000} />
              <p className="text-gray-400">No devices discovered yet. Please wait while we enumerate hosts and services.</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="text-gray-400">No devices match your search criteria.</div>
          )}
        </div>
      )}

      {/* Scan History */}
      <div>
        <h2 className="text-xl font-medium mb-4">Scan History</h2>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Devices Scanned
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vulnerabilities
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {scanHistory.map((scan) => (
                  <tr key={scan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {scan.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {scan.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {scan.devicesScanned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`${scan.vulnerabilitiesFound > 0 ? "text-red-400" : "text-green-400"
                        }`}>
                        {scan.vulnerabilitiesFound}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scan.status === 'completed' ? "bg-green-900/30 text-green-400" :
                        scan.status === 'in_progress' ? "bg-blue-900/30 text-blue-400" :
                          "bg-red-900/30 text-red-400"
                        }`}>
                        {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {typeof totalScans === 'number' && scanHistory.length < totalScans && (
          <div className="flex justify-center mt-4">
            <button onClick={loadMoreScans} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md">
              Load more ({scanHistory.length}/{totalScans})
            </button>
          </div>
        )}
      </div>

      {networkData && networkData.nodes.length > 0 ? (
        <div className={`mt-8 ${isScanning ? "glow-cyan rounded-lg" : "rounded-lg"}`}>
          <NetworkGraph data={networkData} />
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          No network data available. The discovery service is mapping your network...
        </div>
      )}
    </div>
  );
}