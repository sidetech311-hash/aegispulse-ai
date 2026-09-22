import os
import json
import requests
from typing import Dict, Any, List, Optional
from ..schemas.schemas import (
    CopilotTriageRequest, CopilotTriageResponse,
    AIChatRequest, AIChatResponse
)
from .copilot import triage_incident as fallback_triage

# Global runtime configuration (can also be loaded from environment)
CONFIG = {
    "provider": os.environ.get("AI_PROVIDER", "gemini"), # "gemini", "openai", "ollama", "heuristic"
    "gemini_api_key": os.environ.get("GEMINI_API_KEY", ""),
    "openai_api_key": os.environ.get("OPENAI_API_KEY", ""),
    "ollama_host": os.environ.get("OLLAMA_HOST", "http://localhost:11434"),
    "ollama_model": os.environ.get("OLLAMA_MODEL", "llama3.2"),
}

def get_current_ai_config() -> Dict[str, Any]:
    return {
        "provider": CONFIG["provider"],
        "hasGeminiKey": bool(CONFIG["gemini_api_key"]),
        "hasOpenAIKey": bool(CONFIG["openai_api_key"]),
        "ollamaHost": CONFIG["ollama_host"],
        "ollamaModel": CONFIG["ollama_model"],
    }

def update_ai_config(provider: str, gemini_key: Optional[str] = None, openai_key: Optional[str] = None, ollama_host: Optional[str] = None, ollama_model: Optional[str] = None):
    if provider:
        CONFIG["provider"] = provider
    if gemini_key is not None:
        CONFIG["gemini_api_key"] = gemini_key
    if openai_key is not None:
        CONFIG["openai_api_key"] = openai_key
    if ollama_host:
        CONFIG["ollama_host"] = ollama_host
    if ollama_model:
        CONFIG["ollama_model"] = ollama_model

def test_provider_connection(provider: str, api_key: str, ollama_host: str = "http://localhost:11434", ollama_model: str = "llama3.2") -> Dict[str, Any]:
    """Test ping to verify the chosen AI engine credentials."""
    try:
        if provider == "gemini":
            key = api_key or CONFIG["gemini_api_key"]
            if not key:
                return {"success": False, "message": "Gemini API key is required"}
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
            payload = {
                "contents": [{"parts": [{"text": "Ping test. Reply with 'READY'."}]}]
            }
            resp = requests.post(url, json=payload, timeout=8.0)
            if resp.status_code == 200:
                return {"success": True, "provider": "Google Gemini", "model": "gemini-2.5-flash", "message": "Connected successfully to Google Gemini API"}
            return {"success": False, "message": f"Gemini error ({resp.status_code}): {resp.text[:150]}"}

        elif provider == "openai":
            key = api_key or CONFIG["openai_api_key"]
            if not key:
                return {"success": False, "message": "OpenAI API key is required"}
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": "Ping test. Reply with 'READY'."}],
                "max_tokens": 10
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=8.0)
            if resp.status_code == 200:
                return {"success": True, "provider": "OpenAI", "model": "gpt-4o-mini", "message": "Connected successfully to OpenAI API"}
            return {"success": False, "message": f"OpenAI error ({resp.status_code}): {resp.text[:150]}"}

        elif provider == "ollama":
            host = ollama_host or CONFIG["ollama_host"]
            url = f"{host.rstrip('/')}/api/tags"
            resp = requests.get(url, timeout=3.0)
            if resp.status_code == 200:
                models = [m.get("name") for m in resp.json().get("models", [])]
                return {
                    "success": True,
                    "provider": "Local Ollama",
                    "availableModels": models,
                    "message": f"Connected to Ollama on {host}. Available models: {', '.join(models) if models else 'None loaded'}"
                }
            return {"success": False, "message": f"Ollama unreachable on {host}"}

        else:
            return {"success": True, "provider": "Autonomous SecOps Engine", "message": "Local heuristic security rules active (No external key required)"}
    except Exception as e:
        return {"success": False, "message": f"Connection failed: {str(e)}"}

def run_ai_triage(req: CopilotTriageRequest, custom_key: Optional[str] = None) -> CopilotTriageResponse:
    """Generate dynamic AI triage using Google Gemini, OpenAI, or Ollama, with fallback."""
    provider = CONFIG["provider"]
    gemini_key = custom_key or CONFIG["gemini_api_key"]
    openai_key = custom_key or CONFIG["openai_api_key"]

    prompt = f"""You are AegisPulse AI, a Principal SOC Security Analyst & Incident Response Lead.
Analyze this cybersecurity incident and return a valid JSON object matching the exact specification below.

Incident Details:
- ID: {req.id}
- Title: {req.title}
- CVE: {req.cve or 'N/A'}
- Severity: {req.severity}
- Target Asset: {req.targetAsset}
- Attack Vector: {req.attackVector}
- Telemetry Description: {req.description}

You MUST return ONLY a JSON object with this exact schema:
{{
  "executiveSummary": "2-3 sentences in plain English for C-level leadership explaining the attack and business risk.",
  "technicalImpact": "Technical deep-dive of the root cause, potential CVSS impact, lateral movement, and affected subsystems.",
  "cvssScore": 9.8,
  "remediationCommand": "# Verified ready-to-run shell script or firewall rule\\n...",
  "commandType": "bash", // must be either 'bash', 'powershell', or 'waf'
  "playbookSteps": [
    "Step 1: Immediate containment action",
    "Step 2: Credential or firewall lockdown",
    "Step 3: Verification and monitoring",
    "Step 4: Post-incident review"
  ]
}}
Do NOT include markdown backticks like ```json. Return raw JSON only."""

    try:
        if provider == "gemini" and gemini_key:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.2
                }
            }
            resp = requests.post(url, json=payload, timeout=12.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                parsed = json.loads(text)
                return CopilotTriageResponse(
                    incidentId=req.id,
                    executiveSummary=parsed.get("executiveSummary", ""),
                    technicalImpact=parsed.get("technicalImpact", ""),
                    cvssScore=float(parsed.get("cvssScore", 8.0)),
                    remediationCommand=parsed.get("remediationCommand", "# Containment script"),
                    commandType=parsed.get("commandType", "bash"),
                    playbookSteps=parsed.get("playbookSteps", [])
                )

        elif provider == "openai" and openai_key:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are AegisPulse AI, an automated SOC analyst. Always output strictly valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=12.0)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return CopilotTriageResponse(
                    incidentId=req.id,
                    executiveSummary=parsed.get("executiveSummary", ""),
                    technicalImpact=parsed.get("technicalImpact", ""),
                    cvssScore=float(parsed.get("cvssScore", 8.0)),
                    remediationCommand=parsed.get("remediationCommand", "# Containment script"),
                    commandType=parsed.get("commandType", "bash"),
                    playbookSteps=parsed.get("playbookSteps", [])
                )

        elif provider == "ollama":
            host = CONFIG["ollama_host"]
            model = CONFIG["ollama_model"]
            url = f"{host.rstrip('/')}/api/generate"
            payload = {
                "model": model,
                "prompt": prompt + "\nOutput raw JSON only.",
                "format": "json",
                "stream": False
            }
            resp = requests.post(url, json=payload, timeout=15.0)
            if resp.status_code == 200:
                parsed = json.loads(resp.json().get("response", "{}"))
                return CopilotTriageResponse(
                    incidentId=req.id,
                    executiveSummary=parsed.get("executiveSummary", ""),
                    technicalImpact=parsed.get("technicalImpact", ""),
                    cvssScore=float(parsed.get("cvssScore", 8.0)),
                    remediationCommand=parsed.get("remediationCommand", "# Containment script"),
                    commandType=parsed.get("commandType", "bash"),
                    playbookSteps=parsed.get("playbookSteps", [])
                )

    except Exception as err:
        print(f"AI Provider ({provider}) query failed: {err}. Falling back to autonomous heuristic triage.")

    # Seamless fallback to our robust heuristic engine
    return fallback_triage(req)

def run_ai_chat(req: AIChatRequest) -> AIChatResponse:
    """Conversational follow-up with the AI Copilot regarding an incident."""
    provider = CONFIG["provider"]
    gemini_key = CONFIG["gemini_api_key"]
    openai_key = CONFIG["openai_api_key"]

    system_instruction = f"""You are AegisPulse AI Copilot, an elite cybersecurity and incident response expert.
The user is a security engineer or IT administrator managing the following incident:
Incident ID: {req.incidentId}
Title: {req.incidentTitle}
Target: {req.targetAsset}
Attack Vector: {req.attackVector}

Answer the user's question clearly, concisely, and practically.
Provide copyable CLI commands, firewall configurations, or mitigation steps when relevant."""

    # 1. Google Gemini
    if provider == "gemini" and gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            parts = [{"text": f"{system_instruction}\n\nUser Question: {req.message}"}]
            payload = {"contents": [{"parts": parts}]}
            resp = requests.post(url, json=payload, timeout=12.0)
            if resp.status_code == 200:
                reply = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                return AIChatResponse(reply=reply, provider="Google Gemini 2.5 Flash")
        except Exception as e:
            print("Gemini chat error:", e)

    # 2. OpenAI
    elif provider == "openai" and openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": req.message}
            ]
            resp = requests.post(url, headers=headers, json={"model": "gpt-4o-mini", "messages": messages}, timeout=12.0)
            if resp.status_code == 200:
                reply = resp.json()["choices"][0]["message"]["content"]
                return AIChatResponse(reply=reply, provider="OpenAI GPT-4o-mini")
        except Exception as e:
            print("OpenAI chat error:", e)

    # 3. Ollama
    elif provider == "ollama":
        try:
            host = CONFIG["ollama_host"]
            url = f"{host.rstrip('/')}/api/generate"
            payload = {
                "model": CONFIG["ollama_model"],
                "prompt": f"{system_instruction}\n\nUser Question: {req.message}",
                "stream": False
            }
            resp = requests.post(url, json=payload, timeout=15.0)
            if resp.status_code == 200:
                reply = resp.json().get("response", "")
                return AIChatResponse(reply=reply, provider=f"Ollama ({CONFIG['ollama_model']})")
        except Exception as e:
            print("Ollama chat error:", e)

    # Heuristic Security Advisor Fallback Response
    msg_lower = req.message.lower()
    if "windows" in msg_lower or "powershell" in msg_lower:
        reply = f"For Windows Server on {req.targetAsset}:\n\n1. Block the offending IP via PowerShell:\n```powershell\nNew-NetFirewallRule -DisplayName 'AegisPulse Incident Quarantine' -Direction Inbound -Action Block -RemoteAddress '198.51.100.0/24'\n```\n2. Inspect active network listeners:\n```powershell\nGet-NetTCPConnection -State Listen | Format-Table -AutoSize\n```"
    elif "test" in msg_lower or "verify" in msg_lower or "curl" in msg_lower:
        reply = f"To safely verify whether {req.targetAsset} is still accessible:\n```bash\ncurl -I -m 5 https://{req.targetAsset.split(' ')[0]}\nnmap -sV -p 22,80,443 {req.targetAsset.split(' ')[0]}\n```\nVerify that unauthorized ports return 'Filtered' or 'Closed'."
    elif "email" in msg_lower or "ceo" in msg_lower or "ciso" in msg_lower:
        reply = f"Here is a draft briefing for leadership:\n\n**Subject: [Incident Update] Triage and Containment for {req.incidentId}**\n\nHi Team,\n\nOur automated security telemetry flagged suspicious activity on {req.targetAsset} ({req.attackVector}). The AegisPulse SecOps Copilot has applied immediate containment rules to prevent lateral movement. No customer data compromise has been observed. We are continuing active monitoring."
    else:
        reply = f"Regarding {req.incidentTitle} on {req.targetAsset}:\n\nImmediate recommendation: Ensure access control lists (ACLs) are restricted to trusted VPN gateways. Audit recent authentication logs for any anomalous user sessions originating from outside your standard geographic regions."

    return AIChatResponse(reply=reply, provider="Autonomous SecOps Advisor")
