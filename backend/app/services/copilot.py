from ..schemas.schemas import CopilotTriageRequest, CopilotTriageResponse

def triage_incident(req: CopilotTriageRequest) -> CopilotTriageResponse:
    title_lower = req.title.lower()
    desc_lower = req.description.lower()
    
    cvss = 7.5
    command_type = "bash"
    command = "# General Defensive Containment\nsudo ufw default deny incoming\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw reload"
    
    if "ssh" in title_lower or "22" in req.attackVector or "regresshion" in title_lower:
        cvss = 9.8 if "cve" in title_lower else 8.5
        command_type = "bash"
        command = """# 1. Block attacker subnet immediately via iptables
sudo iptables -I INPUT -p tcp --dport 22 -s 198.51.100.0/24 -j DROP

# 2. Deploy Fail2ban rate-limiting jail for SSH
sudo apt-get install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client set sshd bantime 86400

# 3. Restrict SSH to private management VPN only
sudo ufw delete allow 22/tcp
sudo ufw allow from 10.8.0.0/24 to any port 22 proto tcp"""
        summary = f"High-velocity brute force or credential stuffing targeting {req.targetAsset}. Attackers are attempting unauthorized shell execution."
        impact = "Potential root compromise of the gateway host, allowing lateral movement into internal Kubernetes clusters and database instances."
        steps = [
            "Sever active suspicious SSH sessions using 'pkill -u <attacker_user>'.",
            "Apply the iptables firewall containment rule provided below.",
            "Enforce Ed25519 public key authentication and disable PasswordAuthentication in /etc/ssh/sshd_config.",
            "Verify authorization logs in /var/log/auth.log for any successful logins."
        ]

    elif "sql" in title_lower or "injection" in title_lower or "query" in desc_lower:
        cvss = 8.8
        command_type = "bash"
        command = """# Deploy Cloudflare WAF Managed Rule via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/firewall/rules" \\
  -H "Authorization: Bearer $CF_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data '{
    "filter": {"expression": "http.request.uri.query contains \\"union select\\" or http.request.body.raw contains \\"1=1\\""},
    "action": "block",
    "description": "Block SQL Injection Probes on Customer Vault"
  }'"""
        summary = f"SQL Injection probe detected against {req.targetAsset}. Malicious actor is attempting to dump schema data."
        impact = "Risk of unauthorized data exfiltration, customer PII exposure, and database integrity compromise."
        steps = [
            "Enable WAF SQLi inspection filter rule on edge CDN.",
            "Inspect parameterized queries in application ORM layer.",
            "Verify database read replicas are isolated from write masters.",
            "Rotate database connection pool credentials."
        ]

    elif "tls" in title_lower or "hsts" in title_lower or "cipher" in title_lower:
        cvss = 5.3
        command_type = "waf"
        command = """# Hardened Nginx SSL Configuration
# Add inside your server { ... } block:
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;"""
        summary = f"Cryptographic posture deficiency on {req.targetAsset}. Insecure protocol fallbacks allow downgrade vectors."
        impact = "Potential Man-in-the-Middle (MitM) eavesdropping on client-to-server traffic over public Wi-Fi networks."
        steps = [
            "Inject HSTS and X-Frame-Options defensive headers in reverse proxy.",
            "Disable legacy TLS 1.0 and TLS 1.1 protocol handshakes.",
            "Submit domain to HSTS preload list at hstspreload.org.",
            "Run SSL Labs test to verify A+ rating."
        ]

    elif "rce" in title_lower or "remote code" in title_lower:
        cvss = 9.8
        command_type = "powershell"
        command = """# Windows PowerShell Incident Quarantine
# Block suspicious remote ingress IP
New-NetFirewallRule -DisplayName "Block Adversary Subnet" -Direction Inbound -Action Block -RemoteAddress "45.142.122.9"

# Terminate unverified process instances
Get-Process -Name "*cmd*", "*powershell*" | Where-Object { $_.StartTime -gt (Get-Date).AddMinutes(-10) } | Stop-Process -Force

# Audit active TCP connections
Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess"""
        summary = f"Critical Remote Code Execution attempt intercepted against {req.targetAsset} exploiting unpatched service."
        impact = "Arbitrary code execution under NT AUTHORITY\\SYSTEM or root privileges, permitting complete host takeover."
        steps = [
            "Isolate the host from production network VLAN immediately.",
            "Apply the PowerShell firewall quarantine command below.",
            "Capture volatile RAM dump for digital forensics analysis.",
            "Patch host to latest security cumulative rollout."
        ]

    else:
        cvss = 6.8
        summary = f"Anomalous telemetry event flagged on {req.targetAsset}. Threat vector: {req.attackVector}."
        impact = "Potential degradation of service availability or unauthorized reconnaissance by automated scanners."
        steps = [
            "Review firewall access logs for correlated source IPs.",
            "Apply rate-limiting rules to throttle automated requests.",
            "Notify on-call engineering lead."
        ]

    return CopilotTriageResponse(
        incidentId=req.id,
        executiveSummary=summary,
        technicalImpact=impact,
        cvssScore=cvss,
        remediationCommand=command,
        commandType=command_type,
        playbookSteps=steps
    )
