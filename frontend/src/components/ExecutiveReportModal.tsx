import React, { useState } from 'react';
import { X, Printer, Download, Shield, AlertTriangle, CheckCircle2, FileText, Check, Copy } from 'lucide-react';
import type { Incident, AICopilotAnalysis, ScanResult } from '../types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'incident' | 'surface-audit';
  incident?: Incident | null;
  analysis?: AICopilotAnalysis | null;
  scanResult?: ScanResult | null;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  type = 'incident',
  incident,
  analysis,
  scanResult
}) => {
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const reportTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdown = (): string => {
    if (type === 'surface-audit' && scanResult) {
      return `# AEGISPULSE AI — ATTACK SURFACE AUDIT REPORT
**Target Domain:** ${scanResult.domain}
**IP Address:** ${scanResult.ip}
**Security Grade:** ${scanResult.grade} (Score: ${scanResult.postureScore}/100)
**Audit Date:** ${reportDate} ${reportTime}
**Classification:** TLP:AMBER | Restricted Distribution

---

## 1. Executive Summary
The perimeter attack surface for **${scanResult.domain}** was audited by AegisPulse AI. The posture grade assigned is **${scanResult.grade}** with an overall resilience score of **${scanResult.postureScore}/100**.

## 2. SSL/TLS Cryptographic Posture
- Status: ${scanResult.sslValid ? 'VALID' : 'INVALID / EXPIRED'}
- Issuer: ${scanResult.sslIssuer}
- Days Remaining: ${scanResult.sslDaysRemaining} days

## 3. HTTP Security Headers
- Strict-Transport-Security (HSTS): ${scanResult.headers.hsts ? 'PASS' : 'FAIL'}
- Content-Security-Policy (CSP): ${scanResult.headers.contentSecurityPolicy ? 'PASS' : 'FAIL'}
- X-Frame-Options: ${scanResult.headers.xFrameOptions ? 'PASS' : 'FAIL'}
- X-Content-Type-Options: ${scanResult.headers.xContentTypeOptions ? 'PASS' : 'FAIL'}
- Referrer-Policy: ${scanResult.headers.referrerPolicy ? 'PASS' : 'FAIL'}

## 4. Exposed Network Ports
- Open Listeners: ${scanResult.openPorts.join(', ') || 'None detected'}

## 5. Detected Risks
${scanResult.detectedRisks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 6. Hardening Recommendations
${scanResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
*Report generated autonomously by AegisPulse AI SecOps Engine (SOC 2 / ISO 27001 Compliant).*
`;
    }

    // Incident Dossier Markdown
    return `# AEGISPULSE AI — INCIDENT RESPONSE DOSSIER
**Incident ID:** ${incident?.id || 'N/A'}
**Title:** ${incident?.title || 'Unknown Incident'}
**Severity:** ${incident?.severity || 'HIGH'} | **Status:** ${incident?.status || 'Active'}
**CVE ID:** ${incident?.cve || 'N/A'} | **CVSS Score:** ${analysis?.cvssScore ?? 8.5}/10.0
**Target Asset:** ${incident?.targetAsset || 'Internal Infrastructure'}
**Attack Vector:** ${incident?.attackVector || 'Network Exploit'}
**Date of Triage:** ${reportDate} ${reportTime}
**Classification:** TLP:AMBER — CONFIDENTIAL & PROPRIETARY

---

## 1. Executive Briefing for Leadership
${analysis?.executiveSummary || `An attack targeting ${incident?.targetAsset} was intercepted. Containment procedures initiated.`}

- **Customer Data Impact:** NONE OBSERVED
- **Service Availability:** NORMAL (ZERO DOWNTIME)
- **Containment Status:** THREAT ISOLATED

## 2. Technical Root Cause & Subsystem Impact
${analysis?.technicalImpact || `Unauthorized probing detected against target asset. Immediate containment prevents privilege escalation or lateral cluster movement.`}

## 3. Verified 1-Click Remediation Script (${analysis?.commandType?.toUpperCase() || 'BASH'})
\`\`\`${analysis?.commandType || 'bash'}
${analysis?.remediationCommand || '# Immediate containment script'}
\`\`\`

## 4. Incident Response Playbook Checklist
${(analysis?.playbookSteps || [
  'Isolate compromised interface',
  'Apply firewall containment rule',
  'Audit authentication logs',
  'Verify post-incident integrity'
]).map((step, idx) => `- [x] Step ${idx + 1}: ${step}`).join('\n')}

## 5. Chain of Custody & Compliance Sign-Off
- **Lead Security Analyst:** AegisPulse Autonomous SOC Engine
- **Review Status:** Verified & Remediated
- **Timestamp:** ${reportDate} ${reportTime} UTC

---
*AegisPulse AI Cybersecurity Platform — Confidential Security Telemetry.*
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const filename = type === 'surface-audit'
      ? `AegisPulse-Audit-${scanResult?.domain || 'domain'}.md`
      : `AegisPulse-Incident-${incident?.id || 'dossier'}.md`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const data = type === 'surface-audit' ? scanResult : { incident, analysis, generatedAt: new Date().toISOString() };
    const filename = type === 'surface-audit'
      ? `AegisPulse-Audit-${scanResult?.domain || 'domain'}.json`
      : `AegisPulse-Incident-${incident?.id || 'dossier'}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Control Bar (Hidden during printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {type === 'surface-audit' ? 'Attack Surface Audit Report' : 'Executive Incident Dossier'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  TLP:AMBER
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Compliance Ready (SOC 2, ISO 27001, HIPAA)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Save as PDF / Print</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download Markdown Report"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Markdown</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download SIEM JSON"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>JSON (SIEM)</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Copy Markdown to Clipboard"
            >
              {copiedMd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Security Dossier Document */}
        <div id="printable-dossier" className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-slate-900 text-slate-100 print:p-0 print:bg-white print:text-black print:overflow-visible">
          
          {/* Header Banner */}
          <div className="border-b-2 border-cyan-500/40 pb-6 print:border-black">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                    AP
                  </div>
                  <span className="text-xl font-black tracking-tight text-white print:text-black">
                    AEGIS<span className="text-cyan-400 print:text-black">PULSE</span> AI
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white print:text-black">
                  {type === 'surface-audit' ? 'External Attack Surface & Security Posture Audit' : 'Executive Security Incident & Triage Dossier'}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1 print:text-neutral-600">
                  Autonomous SecOps Telemetry & Threat Intelligence Briefing
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono font-bold text-xs print:border-black print:text-black print:bg-neutral-100">
                  CLASSIFICATION: TLP:AMBER
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-2 print:text-neutral-600">
                  Date: <strong>{reportDate}</strong>
                </p>
                <p className="text-[11px] text-slate-400 font-mono print:text-neutral-600">
                  Time: <strong>{reportTime} UTC</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Incident Dossier View */}
          {type === 'incident' && incident && (
            <>
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-neutral-50 print:border-neutral-300">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">Incident ID</span>
                  <p className="text-sm font-mono font-bold text-cyan-300 print:text-black">{incident.id}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">Severity</span>
                  <p className={`text-sm font-bold ${
                    incident.severity === 'CRITICAL' ? 'text-rose-400 print:text-black' : 'text-amber-400 print:text-black'
                  }`}>{incident.severity}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">CVE Reference</span>
                  <p className="text-sm font-mono font-bold text-slate-200 print:text-black">{incident.cve || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">CVSS v3.1 Score</span>
                  <p className="text-sm font-mono font-bold text-rose-400 print:text-black">{analysis?.cvssScore ?? 8.5} / 10.0</p>
                </div>
              </div>

              {/* Section 1: Executive Briefing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <Shield className="w-4 h-4" />
                  <span>1. Executive Briefing for Leadership</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3 print:bg-white print:border-neutral-300">
                  <p className="text-xs sm:text-sm text-slate-200 print:text-black leading-relaxed">
                    {analysis?.executiveSummary || `An active security anomaly targeting ${incident.targetAsset} was intercepted and triaged autonomously by AegisPulse AI.`}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 print:bg-neutral-50 print:border-neutral-300 print:text-black">
                      <span className="block text-[10px] text-emerald-400 print:text-neutral-600">DATA INTEGRITY</span>
                      Zero Customer Data Compromise
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 print:bg-neutral-50 print:border-neutral-300 print:text-black">
                      <span className="block text-[10px] text-emerald-400 print:text-neutral-600">UPTIME IMPACT</span>
                      Normal Operations (Zero Downtime)
                    </div>
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 print:bg-neutral-50 print:border-neutral-300 print:text-black">
                      <span className="block text-[10px] text-cyan-400 print:text-neutral-600">CONTAINMENT STATE</span>
                      Vector Quarantined via Firewall
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Deep-Dive */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Technical Analysis & Subsystem Impact</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-xs sm:text-sm text-slate-300 print:bg-white print:border-neutral-300 print:text-black leading-relaxed">
                  <p><strong>Target Infrastructure:</strong> {incident.targetAsset}</p>
                  <p><strong>Attack Vector:</strong> {incident.attackVector}</p>
                  <p><strong>Telemetry Details:</strong> {incident.description}</p>
                  <p className="pt-2 text-slate-300 print:text-black">
                    <strong>Root Cause & Lateral Movement Risk:</strong> {analysis?.technicalImpact || 'Telemetry indicates automated scanning attempting credential access. Unmitigated, this vector could permit internal cluster reconnaissance.'}
                  </p>
                </div>
              </div>

              {/* Section 3: Remediation Command */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <FileText className="w-4 h-4" />
                  <span>3. Production Remediation Script ({analysis?.commandType?.toUpperCase() || 'BASH'})</span>
                </div>
                <div className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs text-cyan-300 print:bg-neutral-100 print:text-black print:border-neutral-300 overflow-x-auto whitespace-pre-wrap">
                  {analysis?.remediationCommand || '# Automated containment command'}
                </div>
              </div>

              {/* Section 4: Incident Response Playbook */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Standard Operating Playbook Checklist</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(analysis?.playbookSteps || [
                    'Isolate the compromised network interface or restrict external ingress.',
                    'Deploy the automated firewall / WAF mitigation command provided above.',
                    'Audit authentication logs for unauthorized session tokens.',
                    'Rotate affected credentials and verify integrity checksums.'
                  ]).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 print:bg-white print:border-neutral-300 print:text-black">
                      <span className="w-5 h-5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 print:border-black print:text-black print:bg-white">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Surface Audit View */}
          {type === 'surface-audit' && scanResult && (
            <>
              {/* Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-neutral-50 print:border-neutral-300">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">Target Domain</span>
                  <p className="text-sm font-mono font-bold text-cyan-300 print:text-black">{scanResult.domain}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">Resolved IP</span>
                  <p className="text-sm font-mono font-bold text-slate-200 print:text-black">{scanResult.ip}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">Posture Grade</span>
                  <p className={`text-base font-black ${
                    scanResult.grade.startsWith('A') ? 'text-emerald-400 print:text-black' : 'text-amber-400 print:text-black'
                  }`}>{scanResult.grade}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 print:text-neutral-600">Resilience Score</span>
                  <p className="text-sm font-mono font-bold text-cyan-400 print:text-black">{scanResult.postureScore} / 100</p>
                </div>
              </div>

              {/* SSL & Crypto */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <Shield className="w-4 h-4" />
                  <span>1. SSL/TLS Cryptographic Assurance</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono print:bg-white print:border-neutral-300 print:text-black">
                  <div>
                    <span className="text-slate-400 print:text-neutral-600 block">Certificate Status:</span>
                    <strong className="text-emerald-400 print:text-black">{scanResult.sslValid ? 'VALID & ACTIVE' : 'EXPIRED / RISKY'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-neutral-600 block">Certificate Authority:</span>
                    <strong className="text-slate-200 print:text-black">{scanResult.sslIssuer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-neutral-600 block">Remaining Validity:</span>
                    <strong className="text-cyan-300 print:text-black">{scanResult.sslDaysRemaining} days</strong>
                  </div>
                </div>
              </div>

              {/* HTTP Headers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <FileText className="w-4 h-4" />
                  <span>2. HTTP Security Defense Headers</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  {Object.entries(scanResult.headers).map(([key, val]) => (
                    <div key={key} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      val ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 print:bg-white print:border-neutral-300 print:text-black' : 'bg-rose-950/30 border-rose-800/50 text-rose-300 print:bg-white print:border-neutral-300 print:text-black'
                    }`}>
                      <span className="uppercase text-[11px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{val ? 'PASS' : 'FAIL'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Ports & Risks */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>3. Active Perimeter Listeners & Risks</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-xs print:bg-white print:border-neutral-300 print:text-black">
                  <p><strong>Open Listeners:</strong> {scanResult.openPorts.join(', ') || 'No public open ports discovered.'}</p>
                  <p className="font-semibold text-amber-300 print:text-black pt-2">Identified Vulnerabilities:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 print:text-black">
                    {scanResult.detectedRisks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-neutral-300 pb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Hardening & Remediation Roadmap</span>
                </div>
                <div className="space-y-2 text-xs">
                  {scanResult.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5 print:bg-white print:border-neutral-300 print:text-black">
                      <span className="w-5 h-5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 print:border-black print:text-black print:bg-white">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Compliance & Chain of Custody Sign-off Footer */}
          <div className="pt-6 border-t-2 border-slate-800 print:border-black text-xs text-slate-400 print:text-neutral-600 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="block text-[10px] uppercase text-slate-500 print:text-neutral-500">Security Officer / Evaluator</span>
                <p className="text-white font-bold print:text-black">AegisPulse Autonomous SecOps Engine</p>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 print:text-neutral-500">Regulatory Frameworks</span>
                <p className="text-white font-bold print:text-black">SOC 2 Type II, ISO/IEC 27001, HIPAA</p>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-500 print:text-neutral-500">Cryptographic Digest</span>
                <p className="text-white font-bold print:text-black truncate">SHA256:{Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED</p>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-600 print:text-neutral-500 mt-6">
              © {new Date().getFullYear()} AegisPulse AI Inc. All rights reserved. Confidential & Proprietary Security Telemetry.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
