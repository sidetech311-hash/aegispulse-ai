export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved';

export interface Incident {
  id: string;
  title: string;
  cve?: string;
  severity: Severity;
  status: IncidentStatus;
  timestamp: string;
  targetAsset: string;
  description: string;
  attackVector: string;
  mitigationAvailable: boolean;
}

export interface SecurityHeaders {
  hsts: boolean;
  contentSecurityPolicy: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  referrerPolicy: boolean;
}

export interface ScanResult {
  domain: string;
  ip: string;
  postureScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  sslValid: boolean;
  sslDaysRemaining: number;
  sslIssuer: string;
  headers: SecurityHeaders;
  openPorts: number[];
  detectedRisks: string[];
  recommendations: string[];
  scannedAt: string;
}

export interface AICopilotAnalysis {
  incidentId: string;
  executiveSummary: string;
  technicalImpact: string;
  cvssScore: number;
  remediationCommand: string;
  commandType: 'bash' | 'powershell' | 'waf';
  playbookSteps: string[];
  provider?: string;
}

export interface MonitoredAsset {
  id: string;
  name: string;
  type: 'Cloud VPS' | 'Domain / DNS' | 'API Gateway' | 'Database Cluster';
  endpoint: string;
  status: 'Healthy' | 'Warning' | 'Compromised';
  lastScanned: string;
}

export type AIProvider = 'gemini' | 'openai' | 'ollama' | 'heuristic';

export interface AISettings {
  provider: AIProvider;
  geminiKey?: string;
  openaiKey?: string;
  ollamaHost?: string;
  ollamaModel?: string;
}

export interface AITestResult {
  success: boolean;
  provider: string;
  message: string;
  model?: string;
  availableModels?: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  provider?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  role: string;
  createdAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: string;
  user: UserProfileResponse;
}

export interface WebhookConfig {
  slackUrl: string;
  discordUrl: string;
  autoAlertCritical: boolean;
  autoAlertHigh: boolean;
  enabled: boolean;
}

export interface CVEMetricDetails {
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentiality: string;
  integrity: string;
  availability: string;
}

export interface MITRETechnique {
  id: string;
  name: string;
  tactic: string;
}

export interface CVEReference {
  name: string;
  url: string;
}

export interface CVEDetail {
  cveId: string;
  title: string;
  severity: Severity;
  cvssScore: number;
  vectorString: string;
  publishedDate: string;
  lastModified: string;
  description: string;
  cwe: string;
  cisaKev: boolean;
  cisaKevDate?: string;
  metrics: CVEMetricDetails;
  mitreTechniques: MITRETechnique[];
  affectedProducts: string[];
  patchAdvisory: string;
  references: CVEReference[];
}


