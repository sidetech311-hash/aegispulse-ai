import json
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.models import IncidentDB, MonitoredAssetDB, ScanReportDB
from ..schemas.schemas import (
    ScanRequest, ScanResponse,
    IncidentCreate, IncidentResponse,
    CopilotTriageRequest, CopilotTriageResponse,
    MonitoredAssetResponse,
    AISettingsRequest, AISettingsResponse,
    AITestConnectionRequest, AITestConnectionResponse,
    AIChatRequest, AIChatResponse,
    WebhookDispatchRequest, WebhookDispatchResponse,
    WebhookTestRequest, WebhookTestResponse
)
from ..services.scanner import audit_domain
from ..services.ai_engine import (
    run_ai_triage, run_ai_chat,
    get_current_ai_config, update_ai_config,
    test_provider_connection
)
from ..services.webhook_service import dispatch_webhook_alert, test_webhook_connection
from ..services.threat_intel import fetch_cve_intel

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AegisPulse AI SecOps Engine",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/scan", response_model=ScanResponse)
def run_scan(payload: ScanRequest, db: Session = Depends(get_db)):
    result = audit_domain(payload.domain)
    
    # Persist report in database
    try:
        report = ScanReportDB(
            domain=result.domain,
            ip=result.ip,
            posture_score=result.postureScore,
            grade=result.grade,
            ssl_valid=result.sslValid,
            ssl_days_remaining=result.sslDaysRemaining,
            ssl_issuer=result.sslIssuer,
            headers_json=result.headers.model_dump_json(),
            open_ports_json=json.dumps(result.openPorts)
        )
        db.add(report)
        db.commit()
    except Exception as e:
        db.rollback()
        # Even if logging fails, return scan result to user
        print(f"Failed to log scan report: {e}")
        
    return result

@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    records = db.query(IncidentDB).order_by(IncidentDB.created_at.desc()).all()
    
    # If empty, seed initial baseline incidents
    if not records:
        initial = [
            IncidentDB(
                id="INC-9041",
                title="Exposed SSH Port Under Active Brute-Force",
                cve="CVE-2024-6387",
                severity="CRITICAL",
                status="Open",
                timestamp="2 mins ago",
                target_asset="api-gateway-01 (198.51.100.24)",
                description="Over 850 failed root authorization attempts detected in a 60-second window originating from known botnet ASN.",
                attack_vector="Port 22 / OpenSSH RegreSSHion Exploit attempt",
                mitigation_available=True
            ),
            IncidentDB(
                id="INC-8892",
                title="Missing HSTS & Insecure TLS Cipher Suites",
                severity="MEDIUM",
                status="Investigating",
                timestamp="45 mins ago",
                target_asset="checkout-app.internal",
                description="Domain allows fallback to TLS 1.0/1.1; Strict-Transport-Security header omitted in HTTP responses.",
                attack_vector="SSL/TLS Downgrade & Man-in-the-Middle Risk",
                mitigation_available=True
            ),
            IncidentDB(
                id="INC-8730",
                title="Anomalous Database Query Volume Spike",
                severity="HIGH",
                status="Open",
                timestamp="1 hour ago",
                target_asset="db-cluster-primary",
                description="Unusual rate of UNION SELECT queries detected on internal customer profile endpoint.",
                attack_vector="SQL Injection Probe",
                mitigation_available=True
            )
        ]
        for item in initial:
            db.add(item)
        db.commit()
        records = db.query(IncidentDB).order_by(IncidentDB.created_at.desc()).all()

    return [
        IncidentResponse(
            id=r.id,
            title=r.title,
            cve=r.cve,
            severity=r.severity,
            status=r.status,
            timestamp=r.timestamp,
            targetAsset=r.target_asset,
            description=r.description,
            attackVector=r.attack_vector,
            mitigationAvailable=r.mitigation_available
        )
        for r in records
    ]

@router.post("/incidents", response_model=IncidentResponse)
def create_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    inc_id = incident.id or f"INC-{int(datetime.datetime.utcnow().timestamp()) % 10000:04d}"
    record = IncidentDB(
        id=inc_id,
        title=incident.title,
        cve=incident.cve,
        severity=incident.severity,
        status=incident.status,
        timestamp="Just now",
        target_asset=incident.targetAsset,
        description=incident.description,
        attack_vector=incident.attackVector,
        mitigation_available=incident.mitigationAvailable
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return IncidentResponse(
        id=record.id,
        title=record.title,
        cve=record.cve,
        severity=record.severity,
        status=record.status,
        timestamp=record.timestamp,
        targetAsset=record.target_asset,
        description=record.description,
        attackVector=record.attack_vector,
        mitigationAvailable=record.mitigation_available
    )

@router.put("/incidents/{incident_id}/status")
def update_incident_status(incident_id: str, status: str, db: Session = Depends(get_db)):
    record = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")
    record.status = status
    db.commit()
    return {"status": "success", "incidentId": incident_id, "newStatus": status}

@router.get("/assets", response_model=List[MonitoredAssetResponse])
def get_assets(db: Session = Depends(get_db)):
    records = db.query(MonitoredAssetDB).all()
    if not records:
        defaults = [
            MonitoredAssetDB(id="AST-1", name="Production API Gateway", type="API Gateway", endpoint="api.acme-corp.com (198.51.100.24)", status="Warning", last_scanned="5 mins ago"),
            MonitoredAssetDB(id="AST-2", name="Primary Web App", type="Cloud VPS", endpoint="app.acme-corp.com (198.51.100.25)", status="Healthy", last_scanned="12 mins ago"),
            MonitoredAssetDB(id="AST-3", name="Customer DB Replica", type="Database Cluster", endpoint="pg-replica-01.internal", status="Compromised", last_scanned="1 min ago"),
            MonitoredAssetDB(id="AST-4", name="DNS & Nameserver Root", type="Domain / DNS", endpoint="ns1.acme-corp.com", status="Healthy", last_scanned="1 hour ago")
        ]
        for d in defaults:
            db.add(d)
        db.commit()
        records = db.query(MonitoredAssetDB).all()

    return [
        MonitoredAssetResponse(
            id=r.id,
            name=r.name,
            type=r.type,
            endpoint=r.endpoint,
            status=r.status,
            lastScanned=r.last_scanned
        )
        for r in records
    ]

@router.post("/copilot/triage", response_model=CopilotTriageResponse)
def copilot_triage_endpoint(req: CopilotTriageRequest):
    return run_ai_triage(req)

@router.post("/copilot/chat", response_model=AIChatResponse)
def copilot_chat_endpoint(req: AIChatRequest):
    return run_ai_chat(req)

@router.get("/ai/config", response_model=AISettingsResponse)
def get_ai_settings():
    return get_current_ai_config()

@router.post("/ai/config", response_model=AISettingsResponse)
def set_ai_settings(req: AISettingsRequest):
    update_ai_config(
        provider=req.provider,
        gemini_key=req.geminiKey,
        openai_key=req.openaiKey,
        ollama_host=req.ollamaHost,
        ollama_model=req.ollamaModel
    )
    return get_current_ai_config()

@router.post("/ai/test", response_model=AITestConnectionResponse)
def test_ai_settings(req: AITestConnectionRequest):
    res = test_provider_connection(
        provider=req.provider,
        api_key=req.apiKey or "",
        ollama_host=req.ollamaHost or "http://localhost:11434",
        ollama_model=req.ollamaModel or "llama3.2"
    )
    return AITestConnectionResponse(
        success=res["success"],
        provider=res.get("provider", req.provider),
        message=res["message"],
        model=res.get("model"),
        availableModels=res.get("availableModels")
    )

@router.get("/incidents/{incident_id}/export")
def export_incident(incident_id: str, format: str = "json", db: Session = Depends(get_db)):
    """Export structured incident audit data for SIEM/Compliance integration."""
    inc = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not inc:
        inc_data = {
            "id": incident_id,
            "title": "Exposed SSH Port Under Active Brute-Force",
            "cve": "CVE-2024-6387",
            "severity": "CRITICAL",
            "status": "Open",
            "targetAsset": "api-gateway-01 (198.51.100.24)",
            "attackVector": "Port 22 / OpenSSH RegreSSHion Exploit attempt",
            "description": "Over 850 failed root authorization attempts detected in a 60-second window originating from known botnet ASN.",
        }
    else:
        inc_data = {
            "id": inc.id,
            "title": inc.title,
            "cve": inc.cve,
            "severity": inc.severity,
            "status": inc.status,
            "targetAsset": inc.target_asset,
            "attackVector": inc.attack_vector,
            "description": inc.description,
            "timestamp": inc.timestamp
        }
    
    triage_req = CopilotTriageRequest(
        id=inc_data["id"],
        title=inc_data["title"],
        cve=inc_data.get("cve"),
        severity=inc_data["severity"],
        targetAsset=inc_data["targetAsset"],
        attackVector=inc_data["attackVector"],
        description=inc_data["description"]
    )
    triage_res = run_ai_triage(triage_req)
    
    return {
        "reportId": f"AUDIT-{incident_id}-{int(datetime.datetime.utcnow().timestamp())}",
        "classification": "TLP:AMBER",
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "compliance": ["SOC 2 Type II", "ISO/IEC 27001", "HIPAA Security Rule"],
        "incident": inc_data,
        "triageDossier": triage_res.dict()
    }

@router.post("/webhooks/dispatch", response_model=WebhookDispatchResponse)
def dispatch_webhook_endpoint(req: WebhookDispatchRequest):
    """Broadcast real-time incident threat card to Slack or Discord webhook."""
    res = dispatch_webhook_alert(req)
    return WebhookDispatchResponse(
        success=res["success"],
        platform=res["platform"],
        message=res["message"],
        deliveredAt=res.get("deliveredAt", datetime.datetime.utcnow().isoformat() + "Z")
    )

@router.post("/webhooks/test", response_model=WebhookTestResponse)
def test_webhook_endpoint(req: WebhookTestRequest):
    """Test ping to verify outbound Slack or Discord channel connectivity."""
    res = test_webhook_connection(req.webhookUrl, platform=req.platform or "discord")
    return WebhookTestResponse(
        success=res["success"],
        platform=res["platform"],
        message=res["message"]
    )

@router.get("/cve/{cve_id}")
def get_cve_endpoint(cve_id: str):
    """Retrieve detailed threat intelligence, CVSS v3.1 vector, and MITRE mapping for a CVE."""
    return fetch_cve_intel(cve_id)


