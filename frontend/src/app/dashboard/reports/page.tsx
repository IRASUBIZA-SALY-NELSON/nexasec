"use client"
import { useState, useEffect } from "react";
import { fetchReports, generateReport } from "@/services/reportService";
import { Report } from "@/types";
import FilterTabs from "@/components/dashboard/FilterTabs";
import SearchBar from "@/components/dashboard/SearchBar";
import ActionButtons from "@/components/dashboard/ActionButtons";
import { toast } from "react-hot-toast";
import { FileBarChart, Download, Eye } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch reports on component mount
  useEffect(() => {
    const getReports = async () => {
      try {
        setIsLoading(true);
        const data = await fetchReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };

    getReports();
  }, []);

  // Filter reports based on active tab and search query
  useEffect(() => {
    let result = reports;

    // Apply tab filter
    if (activeTab !== "all") {
      result = result.filter(report => report.type === activeTab);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        report =>
          report.title.toLowerCase().includes(query) ||
          report.summary.toLowerCase().includes(query) ||
          report.id.toLowerCase().includes(query)
      );
    }

    setFilteredReports(result);
  }, [activeTab, searchQuery, reports]);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating new security report...");
      
      const result = await generateReport({
        type: "security",
        includeRemediation: true
      });
      
      toast.success("Report generated successfully");
      
      const data = await fetchReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (id: string) => {
    toast.success(`Viewing report ${id}`);
    // In a real app, this would navigate to a detailed report view
  };

  const handleDownloadReport = (id: string) => {
    toast.success(`Downloading report ${id}`);
    // In a real app, this would trigger a download
  };

  const filterTabs = [
    { id: "all", label: "All Reports" },
    { id: "scheduled", label: "Scheduled" },
    { id: "manual", label: "Manual" },
    { id: "compliance", label: "Compliance" }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Security Reports</h1>
        <ActionButtons 
          primaryAction={{
            label: isGenerating ? "Generating..." : "Generate Report",
            onClick: handleGenerateReport
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-900/30 p-3 rounded-lg mr-4">
              <FileBarChart className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Total Reports</h3>
              <p className="text-3xl font-bold">{reports.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Comprehensive security assessments and findings
          </p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-900/30 p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Critical Findings</h3>
              <p className="text-3xl font-bold">
                {reports.reduce((sum, report) => sum + (report.criticalFindings || 0), 0)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            High-priority security issues requiring attention
          </p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-900/30 p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Compliance Status</h3>
              <p className="text-3xl font-bold">87%</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Overall regulatory compliance score
          </p>
        </div>
      </div>

      <FilterTabs 
        tabs={filterTabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <SearchBar 
        placeholder="Search reports..." 
        value={searchQuery} 
        onChange={setSearchQuery} 
      />

      {isLoading ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-gray-400">Loading reports...</p>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6 text-center">
          <p className="text-gray-400">No reports found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{report.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {report.date} • {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  report.status === 'completed' ? "bg-green-900/30 text-green-400" : 
                  report.status === 'in_progress' ? "bg-blue-900/30 text-blue-400" : 
                  "bg-yellow-900/30 text-yellow-400"
                }`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">{report.summary}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  {report.findings !== null && (
                    <span className="text-sm text-gray-400">
                      {report.findings} findings
                      {report.criticalFindings !== null && report.criticalFindings > 0 && (
                        <span className="text-red-400 ml-2">
                          ({report.criticalFindings} critical)
                        </span>
                      )}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewReport(report.id)}
                    className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                    title="View Report"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDownloadReport(report.id)}
                    className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 