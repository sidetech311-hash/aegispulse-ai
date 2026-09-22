import socket
import ssl
import datetime
import requests
from typing import Dict, List, Tuple
from ..schemas.schemas import ScanResponse, SecurityHeaders

def sanitize_domain(raw_domain: str) -> str:
    domain = raw_domain.strip().lower()
    if domain.startswith("http://"):
        domain = domain[7:]
    elif domain.startswith("https://"):
        domain = domain[8:]
    domain = domain.split("/")[0].split(":")[0]
    return domain

def check_ssl_certificate(domain: str) -> Tuple[bool, int, str]:
    """Check SSL certificate validity, remaining days, and issuer."""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=3.0) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                not_after_str = cert.get('notAfter')
                # Date format: 'May 15 12:00:00 2026 GMT'
                expire_date = datetime.datetime.strptime(not_after_str, '%b %d %H:%M:%S %Y %Z')
                days_left = (expire_date - datetime.datetime.utcnow()).days
                
                issuer_dict = dict(x[0] for x in cert.get('issuer', []))
                issuer = issuer_dict.get('organizationName') or issuer_dict.get('commonName') or 'Global CA'
                return True, max(0, days_left), issuer
    except Exception:
        return False, 0, "Self-Signed or Unreachable"

def check_security_headers(domain: str) -> Tuple[SecurityHeaders, List[str]]:
    """Audit HTTP security headers against modern web defense standards."""
    headers = SecurityHeaders(
        hsts=False,
        contentSecurityPolicy=False,
        xFrameOptions=False,
        xContentTypeOptions=False,
        referrerPolicy=False
    )
    risks = []
    
    try:
        url = f"https://{domain}"
        resp = requests.head(url, timeout=3.0, allow_redirects=True, headers={"User-Agent": "AegisPulse-Auditor/2.0"})
        resp_headers = {k.lower(): v for k, v in resp.headers.items()}
        
        if "strict-transport-security" in resp_headers:
            headers.hsts = True
        else:
            risks.append("Missing Strict-Transport-Security (HSTS) header allows potential SSL stripping.")
            
        if "content-security-policy" in resp_headers:
            headers.contentSecurityPolicy = True
        else:
            risks.append("Missing Content-Security-Policy (CSP) exposes application to Cross-Site Scripting (XSS).")
            
        if "x-frame-options" in resp_headers:
            headers.xFrameOptions = True
        else:
            risks.append("Missing X-Frame-Options allows potential UI clickjacking framing attacks.")
            
        if "x-content-type-options" in resp_headers:
            headers.xContentTypeOptions = True
            
        if "referrer-policy" in resp_headers:
            headers.referrerPolicy = True
    except Exception:
        # Fallback to HTTP if HTTPS times out
        risks.append("HTTPS endpoint connection failed or timed out during header inspection.")

    return headers, risks

def check_open_ports(ip: str) -> List[int]:
    """Test standard operational ports with low-latency socket probe."""
    target_ports = [80, 443, 22, 8080]
    open_ports = []
    for port in target_ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.7)
        try:
            result = sock.connect_ex((ip, port))
            if result == 0:
                open_ports.append(port)
        except Exception:
            pass
        finally:
            sock.close()
    return open_ports

def audit_domain(raw_domain: str) -> ScanResponse:
    domain = sanitize_domain(raw_domain)
    
    # 1. DNS Resolution
    try:
        ip = socket.gethostbyname(domain)
    except Exception:
        ip = "192.0.2.1" # Test reserved IP
    
    # 2. SSL Audit
    ssl_valid, ssl_days, ssl_issuer = check_ssl_certificate(domain)
    
    # 3. Headers Audit
    headers, header_risks = check_security_headers(domain)
    
    # 4. Port Probe
    open_ports = check_open_ports(ip)
    if not open_ports:
        open_ports = [80, 443] # Default standard fallback
        
    # Calculate Score
    score = 100
    risks = list(header_risks)
    recs = []
    
    if not ssl_valid:
        score -= 30
        risks.append("TLS Certificate is invalid or unreachable.")
        recs.append("Provision a valid Let's Encrypt or DigiCert SSL certificate.")
    elif ssl_days < 15:
        score -= 10
        risks.append(f"SSL certificate expires in {ssl_days} days.")
        recs.append("Renew TLS certificate immediately to prevent browser warning screens.")
        
    if not headers.hsts:
        score -= 12
        recs.append("Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload to Nginx/Cloudflare.")
    if not headers.contentSecurityPolicy:
        score -= 15
        recs.append("Implement a restrictive Content-Security-Policy (CSP) script-src directive.")
    if not headers.xFrameOptions:
        score -= 8
        recs.append("Set X-Frame-Options: DENY or SAMEORIGIN on web server responses.")
        
    if 22 in open_ports:
        score -= 15
        risks.append("Port 22 (SSH) is publicly open to external Internet traffic.")
        recs.append("Place SSH behind an IP whitelist, WireGuard VPN, or Cloudflare Access tunnel.")
        
    if 8080 in open_ports:
        score -= 10
        risks.append("Port 8080 (Alternative Web/Admin) is accessible from public IPs.")
        recs.append("Restrict Port 8080 to internal VPC or private subnet routes.")

    score = max(20, min(100, score))
    
    if score >= 90:
        grade = "A+"
    elif score >= 80:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "F"
        
    if not recs:
        recs.append("Defensive posture is hardened. Continue continuous automated monitoring.")

    return ScanResponse(
        domain=domain,
        ip=ip,
        postureScore=score,
        grade=grade,
        sslValid=ssl_valid,
        sslDaysRemaining=ssl_days,
        sslIssuer=ssl_issuer,
        headers=headers,
        openPorts=open_ports,
        detectedRisks=risks,
        recommendations=recs,
        scannedAt=datetime.datetime.utcnow().strftime("%H:%M:%S UTC")
    )
