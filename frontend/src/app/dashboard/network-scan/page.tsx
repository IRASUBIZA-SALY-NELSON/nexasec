"use client"
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { startNetworkScan, getScanStatus, downloadScanResults, ScanConfig, ScanResult, searchScanResults } from "@/services/scanService";
import { Search, Download, Shield, Terminal, AlertTriangle } from "lucide-react";

export default function NetworkScanPage() {
  const [networkTarget, setNetworkTarget] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");
  const [scanType, setScanType] = useState<"basic" | "full">("basic");
  const [useCustomPasswordList, setUseCustomPasswordList] = useState(false);
  const [customPasswordList, setCustomPasswordList] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<unknown | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for scan status if a scan is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning && scanId) {
      interval = setInterval(async () => {
        try {
          const status = await getScanStatus(scanId);
          setLogs(status.logs);

          if (status.status !== 'in_progress') {
            setIsScanning(false);
            setScanResult(status);
            clearInterval(interval);

            if (status.status === 'completed') {
              toast.success("Network scan completed successfully!");
            } else if (status.status === 'failed') {
              toast.error("Network scan failed. Please check the logs.");
            }
          }
        } catch (error) {
          console.error("Error polling scan status:", error);
          clearInterval(interval);
          setIsScanning(false);
          toast.error("Failed to get scan status");
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, scanId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCustomPasswordList(e.target.files[0]);
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!networkTarget) {
      toast.error("Please enter a network target");
      return;
    }

    if (!outputDirectory) {
      toast.error("Please enter an output directory name");
      return;
    }

    if (useCustomPasswordList && !customPasswordList) {
      toast.error("Please upload a custom password list or disable the option");
      return;
    }

    try {
      setIsScanning(true);
      setLogs([`Starting ${scanType} scan on ${networkTarget}...`]);

      const config: ScanConfig = {
        networkTarget,
        outputDirectory,
        scanType: scanType as 'network' | 'web' | 'full',
        useCustomPasswordList,
        customPasswordList: customPasswordList || undefined
      };

      const result = await startNetworkScan(config);
      setScanId(result.scanId);
      toast.success("Network scan started successfully!");
    } catch (error) {
      console.error("Error starting scan:", error);
      setIsScanning(false);
      toast.error("Failed to start network scan");
    } finally { }
  };

  const handleSearch = async () => {
    if (!scanId || !searchQuery) return;

    try {
      const results = await searchScanResults(scanId);
      // Filter results client-side based on searchQuery
      const filteredResults = filterResultsByQuery(results as unknown, searchQuery);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching results:", error);
      toast.error("Failed to search scan results");
    }
  };

  // Add helper function to filter results
  const filterResultsByQuery = (results: unknown, query: string) => {
    // Implement your search logic here
    try {
      const arr = Array.isArray(results) ? results : [];
      return arr.filter((result) => JSON.stringify(result).toLowerCase().includes(query.toLowerCase()));
    } catch {
      return [] as unknown[];
    }
  };

  const handleDownload = async () => {
    if (!scanId) return;

    try {
      const blob = await downloadScanResults(scanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${outputDirectory || 'scan-results'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Scan results downloaded successfully!");
    } catch (error) {
      console.error("Error downloading results:", error);
      toast.error("Failed to download scan results");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Network Scanner</h1>
      </div>

      {/* Scan Configuration */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">Scan Configuration</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="networkTarget" className="block text-sm font-medium text-gray-300 mb-1">
              Network Target (IP/Range)
            </label>
            <input
              type="text"
              id="networkTarget"
              value={networkTarget}
              onChange={(e) => setNetworkTarget(e.target.value)}
              placeholder="e.g., 192.168.1.0/24"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isScanning}
            />
          </div>

          <div>
            <label htmlFor="outputDirectory" className="block text-sm font-medium text-gray-300 mb-1">
              Output Directory Name
            </label>
            <input
              type="text"
              id="outputDirectory"
              value={outputDirectory}
              onChange={(e) => setOutputDirectory(e.target.value)}
              placeholder="e.g., company_network_scan"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isScanning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scan Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${scanType === 'basic'
                  ? 'bg-cyan-900/20 border-cyan-700'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  }`}
                onClick={() => !isScanning && setScanType('basic')}
              >
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-cyan-400 mr-2" />
                  <h3 className="font-medium">Basic Scan</h3>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Scans the network for TCP and UDP, including service versions and weak passwords
                </p>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${scanType === 'full'
                  ? 'bg-cyan-900/20 border-cyan-700'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  }`}
                onClick={() => !isScanning && setScanType('full')}
              >
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 text-cyan-400 mr-2" />
                  <h3 className="font-medium">Full Scan</h3>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Includes Nmap Scripting Engine (NSE), weak passwords, and vulnerability analysis
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="useCustomPasswordList"
                checked={useCustomPasswordList}
                onChange={(e) => setUseCustomPasswordList(e.target.checked)}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-400 border-gray-600 rounded"
                disabled={isScanning}
              />
              <label htmlFor="useCustomPasswordList" className="ml-2 text-sm text-gray-300">
                Use custom password list
              </label>
            </div>

            {useCustomPasswordList && (
              <div className="mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".txt,.lst"
                  disabled={isScanning}
                />
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isScanning}
                  >
                    Choose File
                  </button>
                  <span className="ml-3 text-sm text-gray-400">
                    {customPasswordList ? customPasswordList.name : "No file chosen"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleStartScan}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Scanning...
                </>
              ) : (
                "Start Network Scan"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scan Progress/Logs */}
      {(isScanning || logs.length > 0) && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">Scan Logs</h2>

          <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-cyan-400">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
            {isScanning && (
              <div className="animate-pulse text-cyan-400">_</div>
            )}
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && scanResult.status === 'completed' && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Scan Results</h2>

            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search results..."
                  className="px-4 py-2 pr-10 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ZIP
              </button>
            </div>
          </div>

          {/* Services Found */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Services Found</h3>
            <div className="bg-gray-800/30 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Port
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Version
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Vulnerabilities
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {scanResult.services.map((service, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {service.port}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {service.version || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {service.vulnerabilities?.length ? (
                            <span className="text-red-400">{service.vulnerabilities.length}</span>
                          ) : (
                            <span className="text-green-400">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Weak Credentials */}
          {scanResult.weakCredentials && scanResult.weakCredentials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Weak Credentials Found</h3>
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-red-800/30">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Host
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Port
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Username
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Password
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-800/30">
                      {scanResult.weakCredentials.map((cred, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {cred.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {cred.host}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {cred.port}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {cred.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {cred.password}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vulnerabilities */}
          {scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Vulnerabilities Found</h3>
              <div className="space-y-4">
                {scanResult.vulnerabilities.map((vuln, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${vuln.severity === 'critical' ? 'bg-red-900/20 border-red-800/50' :
                    vuln.severity === 'high' ? 'bg-orange-900/20 border-orange-800/50' :
                      vuln.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-800/50' :
                        'bg-blue-900/20 border-blue-800/50'
                    }`}>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium flex items-center">
                          <AlertTriangle className={`h-4 w-4 mr-2 ${vuln.severity === 'critical' ? 'text-red-400' :
                            vuln.severity === 'high' ? 'text-orange-400' :
                              vuln.severity === 'medium' ? 'text-yellow-400' :
                                'text-blue-400'
                            }`} />
                          {vuln.cve || `Vulnerability in ${vuln.service}`}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Host: {vuln.host} • Service: {vuln.service}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vuln.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                        vuln.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                          vuln.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-blue-900/30 text-blue-400'
                        }`}>
                        {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{vuln.description}</p>
                    {vuln.exploitAvailable && (
                      <p className="mt-2 text-sm text-red-400">Exploit available</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults !== null && (
            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-3">Search Results for &quot;{searchQuery}&quot;</h3>
              <pre className="bg-black/50 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}