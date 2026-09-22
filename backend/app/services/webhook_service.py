import datetime
import requests
from typing import Dict, Any
from ..schemas.schemas import WebhookDispatchRequest

def format_discord_payload(req: WebhookDispatchRequest) -> Dict[str, Any]:
    color = 0xE11D48 if req.severity.upper() == "CRITICAL" else 0xF59E0B if req.severity.upper() == "HIGH" else 0x06B6D4
    
    fields = [
        {"name": "Incident ID", "value": f"`{req.incidentId}`", "inline": True},
        {"name": "Severity", "value": f"**{req.severity}**", "inline": True},
        {"name": "Target Asset", "value": req.targetAsset, "inline": True},
        {"name": "CVE Reference", "value": req.cve or "N/A", "inline": True},
        {"name": "Attack Vector", "value": req.attackVector, "inline": True},
    ]

    if req.remediationCommand:
        cmd_preview = req.remediationCommand[:300] + ("..." if len(req.remediationCommand) > 300 else "")
        fields.append({
            "name": "1-Click Containment Command",
            "value": f"```bash\n{cmd_preview}\n```",
            "inline": False
        })

    return {
        "username": "AegisPulse AI SecOps",
        "avatar_url": "https://aegispulse-ai.vercel.app/favicon.ico",
        "embeds": [{
            "title": f"🚨 [{req.severity.upper()}] {req.title}",
            "description": req.description,
            "color": color,
            "fields": fields,
            "footer": {
                "text": "AegisPulse AI — Autonomous Threat Triage & Incident Response",
                "icon_url": "https://aegispulse-ai.vercel.app/favicon.ico"
            },
            "timestamp": datetime.datetime.utcnow().isoformat()
        }]
    }

def format_slack_payload(req: WebhookDispatchRequest) -> Dict[str, Any]:
    icon = "🔴" if req.severity.upper() == "CRITICAL" else "🟠" if req.severity.upper() == "HIGH" else "🔵"
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"{icon} [{req.severity.upper()}] {req.title}",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Incident ID:*\n`{req.incidentId}`"},
                {"type": "mrkdwn", "text": f"*Severity:*\n*{req.severity}*"},
                {"type": "mrkdwn", "text": f"*Target Asset:*\n{req.targetAsset}"},
                {"type": "mrkdwn", "text": f"*CVE:*\n{req.cve or 'N/A'}"}
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Telemetry Breakdown:*\n{req.description}"
            }
        },
        {"type": "divider"}
    ]

    if req.remediationCommand:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Remediation Command:*\n```{req.remediationCommand[:300]}```"
            }
        })

    return {
        "text": f"{icon} AegisPulse Alert: [{req.severity}] {req.title}",
        "blocks": blocks
    }

def dispatch_webhook_alert(req: WebhookDispatchRequest) -> Dict[str, Any]:
    url = req.webhookUrl.strip()
    if not url:
        return {"success": False, "platform": req.platform or "webhook", "message": "Webhook URL is missing."}

    # Detect platform
    platform = req.platform or ("slack" if "slack.com" in url else "discord")
    
    # Handle simulated demo mode
    if url.startswith("demo://") or url.startswith("mock://") or "example.com" in url:
        return {
            "success": True,
            "platform": platform.capitalize(),
            "message": f"Simulated delivery receipt: Alert for {req.incidentId} successfully broadcast to {platform.capitalize()}.",
            "deliveredAt": datetime.datetime.utcnow().isoformat() + "Z"
        }

    payload = format_slack_payload(req) if platform.lower() == "slack" else format_discord_payload(req)

    try:
        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=8.0)
        if resp.status_code in [200, 204]:
            return {
                "success": True,
                "platform": platform.capitalize(),
                "message": f"Alert successfully delivered to {platform.capitalize()} channel.",
                "deliveredAt": datetime.datetime.utcnow().isoformat() + "Z"
            }
        return {
            "success": False,
            "platform": platform.capitalize(),
            "message": f"{platform.capitalize()} returned HTTP {resp.status_code}: {resp.text[:120]}",
            "deliveredAt": datetime.datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        return {
            "success": False,
            "platform": platform.capitalize(),
            "message": f"Failed to dispatch to {platform.capitalize()}: {str(e)}",
            "deliveredAt": datetime.datetime.utcnow().isoformat() + "Z"
        }

def test_webhook_connection(url: str, platform: str = "discord") -> Dict[str, Any]:
    url = url.strip()
    if not url:
        return {"success": False, "platform": platform, "message": "Please provide a valid Webhook URL."}

    detected_platform = platform or ("slack" if "slack.com" in url else "discord")

    if url.startswith("demo://") or url.startswith("mock://") or "example.com" in url:
        return {
            "success": True,
            "platform": detected_platform.capitalize(),
            "message": f"Demo ping verified: Connection to {detected_platform.capitalize()} channel established."
        }

    if detected_platform.lower() == "slack":
        payload = {
            "text": "🛡️ *AegisPulse AI Connection Verified* — Ready to broadcast autonomous security incidents."
        }
    else:
        payload = {
            "username": "AegisPulse AI",
            "avatar_url": "https://aegispulse-ai.vercel.app/favicon.ico",
            "embeds": [{
                "title": "🛡️ AegisPulse AI Connection Verified",
                "description": "Real-time incident response webhook channel is active and receiving autonomous threat telemetry.",
                "color": 0x06B6D4,
                "footer": {"text": "AegisPulse AI SecOps Integration"},
                "timestamp": datetime.datetime.utcnow().isoformat()
            }]
        }

    try:
        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=8.0)
        if resp.status_code in [200, 204]:
            return {
                "success": True,
                "platform": detected_platform.capitalize(),
                "message": f"Successfully pinged {detected_platform.capitalize()} channel!"
            }
        return {
            "success": False,
            "platform": detected_platform.capitalize(),
            "message": f"Connection test failed ({resp.status_code}): {resp.text[:120]}"
        }
    except Exception as e:
        return {
            "success": False,
            "platform": detected_platform.capitalize(),
            "message": f"Connection error: {str(e)}"
        }
