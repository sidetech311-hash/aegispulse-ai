from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SecurityHeaders(BaseModel):
    hsts: bool
    contentSecurityPolicy: bool
    xFrameOptions: bool
    xContentTypeOptions: bool
    referrerPolicy: bool

class ScanRequest(BaseModel):
    domain: str

class ScanResponse(BaseModel):
    domain: str
    ip: str
    postureScore: int
    grade: str
    sslValid: bool
    sslDaysRemaining: int
    sslIssuer: str
    headers: SecurityHeaders
    openPorts: List[int]
    detectedRisks: List[str]
    recommendations: List[str]
    scannedAt: str

class IncidentCreate(BaseModel):
    id: Optional[str] = None
    title: str
    cve: Optional[str] = None
    severity: str
    status: str = "Open"
    targetAsset: str
    description: str
    attackVector: str
    mitigationAvailable: bool = True

class IncidentResponse(BaseModel):
    id: str
    title: str
    cve: Optional[str] = None
    severity: str
    status: str
    timestamp: str
    targetAsset: str
    description: str
    attackVector: str
    mitigationAvailable: bool

class CopilotTriageRequest(BaseModel):
    id: str
    title: str
    cve: Optional[str] = None
    severity: str
    targetAsset: str
    description: str
    attackVector: str

class CopilotTriageResponse(BaseModel):
    incidentId: str
    executiveSummary: str
    technicalImpact: str
    cvssScore: float
    remediationCommand: str
    commandType: str
    playbookSteps: List[str]

class MonitoredAssetResponse(BaseModel):
    id: str
    name: str
    type: str
    endpoint: str
    status: str
    lastScanned: str

# AI Engine Schemas
class AISettingsRequest(BaseModel):
    provider: str # "gemini", "openai", "ollama", "heuristic"
    geminiKey: Optional[str] = None
    openaiKey: Optional[str] = None
    ollamaHost: Optional[str] = "http://localhost:11434"
    ollamaModel: Optional[str] = "llama3.2"

class AISettingsResponse(BaseModel):
    provider: str
    hasGeminiKey: bool
    hasOpenAIKey: bool
    ollamaHost: str
    ollamaModel: str

class AITestConnectionRequest(BaseModel):
    provider: str
    apiKey: Optional[str] = None
    ollamaHost: Optional[str] = "http://localhost:11434"
    ollamaModel: Optional[str] = "llama3.2"

class AITestConnectionResponse(BaseModel):
    success: bool
    provider: str
    message: str
    model: Optional[str] = None
    availableModels: Optional[List[str]] = None

class AIChatRequest(BaseModel):
    incidentId: str
    incidentTitle: str
    targetAsset: str
    attackVector: str
    message: str

class AIChatResponse(BaseModel):
    reply: str
    provider: str

# User & Auth Schemas
class UserProfileResponse(BaseModel):
    id: str
    email: str
    fullName: str
    companyName: str
    role: str
    createdAt: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    fullName: str
    companyName: str
    role: Optional[str] = "SecOps Analyst"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class AuthTokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserProfileResponse

# Webhook Integration Schemas
class WebhookDispatchRequest(BaseModel):
    webhookUrl: str
    platform: Optional[str] = "discord" # "slack" or "discord"
    incidentId: str
    title: str
    severity: str
    targetAsset: str
    attackVector: str
    description: str
    cve: Optional[str] = None
    remediationCommand: Optional[str] = None

class WebhookDispatchResponse(BaseModel):
    success: bool
    platform: str
    message: str
    deliveredAt: str

class WebhookTestRequest(BaseModel):
    webhookUrl: str
    platform: Optional[str] = "discord"

class WebhookTestResponse(BaseModel):
    success: bool
    platform: str
    message: str

