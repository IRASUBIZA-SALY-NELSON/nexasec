"use client"
import { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import * as api from "@/services/api";
import DataFetcher from "@/components/dashboard/DataFetcher";
import dynamic from "next/dynamic";
import CyberLoader from "@/components/ui/CyberLoader";
import type { TrendDataPoint } from "@/types/dashboard";

// Lazy load heavy components
const ThreatChart = dynamic(() => import('@/components/dashboard/ThreatChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Disable server-side rendering for this component
});

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [dateRange] = useState("28 Jan - 28 Dec, 2023");
  const [pageLoading, setPageLoading] = useState(true);
  const [threatData, setThreatData] = useState<TrendDataPoint[]>([]);
  const [threatDataLoading, setThreatDataLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    setPageLoading(false);
  }, [isLoading, isAuthenticated, router]);

  // Load threat data for chart
  useEffect(() => {
    const loadThreatData = async () => {
      try {
        setThreatDataLoading(true);
        const data = await api.dashboardApi.getThreatData();
        console.log(data);
        setThreatData(data as TrendDataPoint[]);
      } catch (error) {
        console.error("Error loading threat data:", error);
      } finally {
        setThreatDataLoading(false);
      }
    };

    if (!pageLoading && isAuthenticated) {
      loadThreatData();
    }
  }, [pageLoading, isAuthenticated]);

  // Show loading indicator while authentication is being checked
  if (isLoading || pageLoading) {
    return <CyberLoader text="Loading dashboard..." />;
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">
          Welcome to NexaSec Dashboard
        </h1>
        <div className="relative">
          <button className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 px-4 py-2 rounded-md flex items-center text-sm">
            {dateRange}
            <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="mb-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-800 rounded">
            <h3 className="text-sm font-medium text-gray-400">Email</h3>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
          <div className="p-4 border border-gray-800 rounded">
            <h3 className="text-sm font-medium text-gray-400">Account Status</h3>
            <p className="text-lg font-medium text-green-400">Active</p>
          </div>
          <div className="p-4 border border-gray-800 rounded">
            <h3 className="text-sm font-medium text-gray-400">Subscription</h3>
            <p className="text-lg font-medium text-cyan-400">Basic</p>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DataFetcher
          title="System Health"
          fetchData={api.dashboardApi.getSystemHealth}
          interval={30000}
        />
        <DataFetcher
          title="Recent Alerts"
          fetchData={api.dashboardApi.getAlerts}
          interval={15000}
        />
      </div>

      {/* Threat chart */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Threat Activity</h2>
        <div className="h-80">
          <ThreatChart data={threatData} isLoading={threatDataLoading} />
        </div>
      </div>
    </div>
  );
} 