"use client"
import { useState, useEffect } from "react";
import { Alert } from "../../types/index";

interface DataFetcherProps<T> {
  title: string;
  fetchData: () => Promise<T>;
  interval?: number;
}

// Add this interface to define the system health data structure
interface SystemHealthData {
  server_status: string;
  // Add other properties that might be in the response
  security?: string | number;
  uptime?: string | number;
}

export default function DataFetcher<T>({
  title,
  fetchData,
  interval = 60000 // Default to 1 minute
}: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const fetchDataAndUpdateState = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching data for ${title}...`);
        const result = await fetchData();
        console.log(`Data received for ${title}:`, result);
        setData(result);
        setError(null);
      } catch (err) {
        console.error(`Error fetching data for ${title}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDataAndUpdateState();
    if (interval > 0) {
      const intervalId = setInterval(fetchDataAndUpdateState, interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, title, interval]);
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg p-6">
      <h2 className="text-xl font-medium mb-4">{title}</h2>
      
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent"></div>
        </div>
      )}
      
      {error && (
        <div className="text-red-400 p-4 border border-red-800 rounded bg-red-900/20">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}
      
      {!isLoading && !error && data && (
        <div>
          {title === "System Health" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-800 rounded">
                <h3 className="text-lg font-medium">Server Status</h3>
                <p className="text-2xl font-bold text-green-400">
                  {(data as unknown as SystemHealthData).server_status}
                </p>
              </div>
              <div className="p-4 border border-gray-800 rounded">
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-2xl font-bold text-yellow-400">{(data as unknown as SystemHealthData).security}</p>  
              </div>
              <div className="p-4 border border-gray-800 rounded">
                <h3 className="text-lg font-medium">Uptime</h3>
                <p className="text-2xl font-bold text-cyan-400">{(data as unknown as SystemHealthData).uptime}</p>
              </div>
            </div>
          )}
          
          {title === "Recent Alerts" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Source</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {(data as unknown as Alert[]).map((alert, index) => ( 
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{alert.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{alert.source}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                          High Risk
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">Login Attempt</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">10.0.0.15</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                        Medium Risk
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 