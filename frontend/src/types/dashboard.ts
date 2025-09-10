// Dashboard data types
export interface VulnerabilityStatistics {
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  info?: number;
  [key: string]: number | undefined;
}

export interface FindingStatistics {
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  info?: number;
  [key: string]: number | undefined;
}

export interface DashboardOverview {
  total_scans: number;
  total_pentests: number;
  active_scans: number;
  active_pentests: number;
  vulnerability_statistics: VulnerabilityStatistics;
  finding_statistics: FindingStatistics;
}

export interface SecurityScore {
  security_score: number;
  risk_level: string;
  vulnerability_counts: VulnerabilityStatistics;
  finding_counts: FindingStatistics;
  recommendations: string[];
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: string;
  created_at: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: string;
  created_at: string;
}

export interface Scan {
  id: string;
  target: string;
  status: string;
  created_at: string;
}

export interface Pentest {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export interface RecentActivity {
  recent_scans: Scan[];
  recent_pentests: Pentest[];
  recent_vulnerabilities: Vulnerability[];
  recent_findings: Finding[];
}

export interface TrendDataPoint {
  date: string;
  severity: string;
  count: number;
}

export interface TrendsData {
  vulnerability_trends: TrendDataPoint[];
  finding_trends: TrendDataPoint[];
}