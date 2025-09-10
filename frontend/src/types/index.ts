import { ReactNode } from "react";

export interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
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
  onSubmit?: (formData: Record<string, string>) => Promise<void>;
  isSubmitDisabled?: boolean;
  hideTermsCheckbox?: boolean;
}

export interface HeroProps {
  id?: string;
}

export interface FeaturesProps {
  id: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface PricingProps {
  id: string;
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

export interface ButtonProps {
  children: ReactNode;
  pathname?: string;
  className?: string;
  onClick?: () => void;
}

// Data types
export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: "admin" | "user";
}

export interface SecurityReport {
  id: string;
  date: string;
  threatLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  details: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: "pending" | "completed" | "failed";
  summary: string;
}

export interface Alert {
  type: string;
  source: string;
  severity?: string;
  // Add other properties as needed
}

export interface ScanResult {
  scanId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  findings: any[];
  services?: {
    name: string;
    port: number;
    status: string;
    version?: string;
  }[];
  weakCredentials?: {
    service: string;
    username: string;
    password: string;
  }[];
  vulnerabilities?: {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    service: string;
    host: string;
    description: string;
    cve?: string;
    exploitAvailable?: boolean;
  }[];
}

export interface PentestFinding {
  severity: 'critical' | 'medium' | 'low';
  description: string;
  details?: string;
  remediation?: string;
}

export interface PentestResult {
  id: string;
  target: string;
  date: string;
  type: string;
  status: 'completed' | 'in_progress' | 'failed';
  criticalVulnerabilities?: number;
  mediumVulnerabilities?: number;
  lowVulnerabilities?: number;
  findings?: PentestFinding[];
}

export interface PentestTarget {
  url: string;
  type: string;
  options: {
    portScan: boolean;
    vulnScan: boolean;
    bruteForce: boolean;
    sqlInjection: boolean;
    xss: boolean;
    networkMapping?: boolean;
    osFingerprinting?: boolean;
    serviceDetection?: boolean;
    csrfTesting?: boolean;
    fileUploadTesting?: boolean;
    authenticationBypass?: boolean;
    routerTesting?: boolean;
    firewallTesting?: boolean;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error' | 'unknown';
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  lastUpdate: string;
  error?: string;
} 