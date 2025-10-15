"use client"
import { useState, useEffect } from "react";
import { fetchVulnerabilities, updateVulnerabilityStatus, runVulnerabilityScan } from "@/services/vulnerabilityService";
import { Vulnerability } from "@/types";
import SummaryCards from "@/components/dashboard/SummaryCards";
import FilterTabs from "@/components/dashboard/FilterTabs";
import SearchBar from "@/components/dashboard/SearchBar";
import ActionButtons from "@/components/dashboard/ActionButtons";
import { toast } from "react-hot-toast";

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [filteredVulnerabilities, setFilteredVulnerabilities] = useState<Vulnerability[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isScanRunning, setIsScanRunning] = useState(false);

  // Fetch vulnerabilities on component mount
  useEffect(() => {
    const getVulnerabilities = async () => {
      try {
        setIsLoading(true);
        const data = await fetchVulnerabilities();
        setVulnerabilities(data);
        setFilteredVulnerabilities(data);
      } catch (error) {
        console.error("Error fetching vulnerabilities:", error);
        toast.error("Failed to load vulnerabilities");
      } finally {
        setIsLoading(false);
      }
    };

    getVulnerabilities();
  }, []);

  // Filter vulnerabilities based on active tab and search query
  useEffect(() => {
    let result = vulnerabilities;

    // Apply tab filter
    if (activeTab !== "all") {
      result = result.filter(vuln => vuln.status === activeTab);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        vuln =>
          vuln.name.toLowerCase().includes(query) ||
          vuln.description.toLowerCase().includes(query) ||
          vuln.affected.toLowerCase().includes(query) ||
          vuln.id.toLowerCase().includes(query)
      );
    }

    setFilteredVulnerabilities(result);
  }, [activeTab, searchQuery, vulnerabilities]);

  // Calculate summary metrics
  const summaryItems = [
    {
      title: "Critical",
      count: vulnerabilities.filter(v => v.severity === "critical").length,
      color: "red" as const,
      description: "Vulnerabilities requiring immediate attention"
    },
    {
      title: "High",
      count: vulnerabilities.filter(v => v.severity === "high").length,
      color: "orange" as const,
      description: "Serious vulnerabilities to address soon"
    },
    {
      title: "Medium",
      count: vulnerabilities.filter(v => v.severity === "medium").length,
      color: "yellow" as const,
      description: "Moderate risk vulnerabilities"
    },
    {
      title: "Low",
      count: vulnerabilities.filter(v => v.severity === "low").length,
      color: "green" as const,
      description: "Low risk vulnerabilities"
    }
  ];

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateVulnerabilityStatus(id, newStatus);
      
      // Update local state
      const updatedVulnerabilities = vulnerabilities.map(vuln => 
        vuln.id === id ? { ...vuln, status: newStatus as "open" | "in_progress" | "resolved" } : vuln
      );
      
      setVulnerabilities(updatedVulnerabilities);
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating vulnerability status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleRunScan = async () => {
    try {
      setIsScanRunning(true);
      toast.loading("Initiating vulnerability scan...");
      
      const result = await runVulnerabilityScan();
      
      if (result.success) {
        toast.success(result.message || "Scan completed successfully");
        // Refresh vulnerabilities after scan
        const data = await fetchVulnerabilities();
        setVulnerabilities(data);
        setFilteredVulnerabilities(data);
      } else {
        toast.error(result.message || "Scan failed");
      }
    } catch (error) {
      console.error("Error running vulnerability scan:", error);
      toast.error("Failed to run vulnerability scan");
    } finally {
      setIsScanRunning(false);
    }
  };

  const filterTabs = [
    { id: "all", label: "All Vulnerabilities" },
    { id: "open", label: "Open" },
    { id: "in_progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Vulnerabilities</h1>
        <ActionButtons 
          primaryAction={{
            label: isScanRunning ? "Scanning..." : "Run Scan",
            onClick: handleRunScan
          }}
          secondaryAction={{
            label: "Export Report",
            onClick: () => toast.success("Report exported successfully")
          }}
        />
      </div>

      <SummaryCards items={summaryItems} />

      <FilterTabs 
        tabs={filterTabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <SearchBar 
        placeholder="Search vulnerabilities..." 
        value={searchQuery} 
        onChange={setSearchQuery} 
      />

      {isLoading ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-gray-400">Loading vulnerabilities...</p>
          </div>
        </div>
      ) : filteredVulnerabilities.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6 text-center">
          <p className="text-gray-400">No vulnerabilities found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Affected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Discovered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredVulnerabilities.map((vuln) => (
                  <tr key={vuln.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {vuln.id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{vuln.name}</p>
                        <p className="text-gray-400 text-xs mt-1">{vuln.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vuln.severity === 'critical' ? "bg-red-900/30 text-red-400" : 
                        vuln.severity === 'high' ? "bg-orange-900/30 text-orange-400" : 
                        vuln.severity === 'medium' ? "bg-yellow-900/30 text-yellow-400" : 
                        "bg-green-900/30 text-green-400"
                      }`}>
                        {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {vuln.affected}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {vuln.discovered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vuln.status === 'open' ? "bg-blue-900/30 text-blue-400" : 
                        vuln.status === 'in_progress' ? "bg-purple-900/30 text-purple-400" : 
                        "bg-green-900/30 text-green-400"
                      }`}>
                        {vuln.status === 'in_progress' ? 'In Progress' : 
                          vuln.status.charAt(0).toUpperCase() + vuln.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={vuln.status}
                        onChange={(e) => handleStatusChange(vuln.id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 