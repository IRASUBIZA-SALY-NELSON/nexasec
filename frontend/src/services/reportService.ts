import { Report } from "@/types";

// Base API URL - would come from environment variables in a real app
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Common fetch options
const fetchOptions = {
  credentials: 'include' as RequestCredentials,
  mode: 'cors' as RequestMode,
  headers: {
    'Content-Type': 'application/json',
    ...(typeof window !== 'undefined' && localStorage.getItem('token') 
      ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      : {})
  }
};

// Fetch all reports
export const fetchReports = async (): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_URL}/reports`, {
      ...fetchOptions
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

// Generate a new report
export const generateReport = async (options: {
  type: string;
  target?: string;
  includeRemediation?: boolean;
}): Promise<Report> => {
  try {
    const response = await fetch(`${API_URL}/reports/generate`, {
      method: 'POST',
      ...fetchOptions,
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

export async function getReportDetails(id: string): Promise<Report> {
  try {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      ...fetchOptions
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch report details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching report details:', error);
    throw error;
  }
}

export async function downloadReport(id: string): Promise<Blob> {
  try {
    const response = await fetch(`${API_URL}/reports/${id}/download`, {
      ...fetchOptions
    });
    
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
} 