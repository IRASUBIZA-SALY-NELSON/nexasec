import { api } from './api';
import { 
  DashboardOverview, 
  SecurityScore, 
  RecentActivity, 
  TrendsData 
} from '@/types/dashboard';

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    try {
      return await api.get('/dashboard/overview');
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return {
        total_scans: 0,
        total_pentests: 0,
        active_scans: 0,
        active_pentests: 0,
        vulnerability_statistics: {},
        finding_statistics: {}
      };
    }
  },

  getTrends: async (days = 30): Promise<TrendsData> => {
    try {
      return await api.get(`/dashboard/trends?days=${days}`);
    } catch (error) {
      console.error('Error fetching dashboard trends:', error);
      return {
        vulnerability_trends: [],
        finding_trends: []
      };
    }
  },

  getRecentActivity: async (limit = 10): Promise<RecentActivity> => {
    try {
      return await api.get(`/dashboard/recent-activity?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        recent_scans: [],
        recent_pentests: [],
        recent_vulnerabilities: [],
        recent_findings: []
      };
    }
  },

  getMonthlyReport: async (year: number, month: number) => {
    try {
      return await api.get(`/dashboard/monthly-summary?year=${year}&month=${month}`);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      return {
        period: { year, month },
        scan_statistics: { total: 0, completed: 0, failed: 0, success_rate: 0 },
        pentest_statistics: { total: 0, completed: 0, failed: 0, success_rate: 0 },
        vulnerability_distribution: {},
        finding_distribution: {}
      };
    }
  },

  getSecurityScore: async (): Promise<SecurityScore> => {
    try {
      return await api.get('/dashboard/security-score');
    } catch (error) {
      console.error('Error fetching security score:', error);
      return {
        security_score: 0,
        risk_level: 'Unknown',
        vulnerability_counts: {},
        finding_counts: {},
        recommendations: []
      };
    }
  }
};