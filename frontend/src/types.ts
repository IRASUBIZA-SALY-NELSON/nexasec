// Existing types
export interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface AuthFormProps {
  type: "login" | "signup";
  title: string;
  description: string;
  fields: FormField[];
  submitText: string;
  alternateLink: string;
  alternateText: string;
  isSubmitDisabled?: boolean;
  onSubmit?: (formData: Record<string, string>) => void;
  hideTermsCheckbox?: boolean;
}

export interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonLink: string;
}

export interface PricingProps {
  id: string;
}

// New types for dashboard components
export interface Vulnerability {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  affected: string;
  discovered: string;
  description: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  networkTarget: string;
  scanType: 'basic' | 'full';
  status: 'in_progress' | 'completed' | 'failed';
  progress: number;
  services: {
    name: string;
    port: number;
    version: string;
    vulnerabilities?: string[];
  }[];
  weakCredentials?: {
    service: string;
    host: string;
    port: number;
    username: string;
    password: string;
  }[];
  vulnerabilities?: {
    host: string;
    service: string;
    cve?: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    exploitAvailable: boolean;
  }[];
  logs: string[];
}

export interface SystemHealth {
  totalThreats: {
    percentage: number;
    count: number;
  };
  defeatedThreats: {
    percentage: number;
    count: number;
  };
  systemHealth: {
    percentage: number;
    status: string;
  };
}

export interface Alert {
  id: string;
  type: string;
  date: string;
  ip: string;
  status: string;
  amount: string;
}

export interface ThreatData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  type: string;
  status: string;
  lastSeen: string;
  vulnerabilities: number;
  manufacturer: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  summary: string;
  findings: number | null;
  criticalFindings: number | null;
}

export interface SummaryCardProps {
  title: string;
  count: number;
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "cyan";
  description: string;
}

export interface FilterTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export interface ActionButtonsProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
  };
} 