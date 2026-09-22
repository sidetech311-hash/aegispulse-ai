import React, { useState } from 'react';
import { Search, Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import type { ScanResult } from '../types';
import { performDomainScan } from '../services/api';

interface DomainScannerWidgetProps {
  onSendToConsole?: (result: ScanResult) => void;
}

export const DomainScannerWidget: React.FC<DomainScannerWidgetProps> = ({ onSendToConsole }) => {
  const [domainInput, setDomainInput] = useState('cloud-nexus.io');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domainInput.trim() || isScanning) return;

    setIsScanning(true);
    setScanResult(null);

    // Multi-stage scan progression
    setScanStep('Querying DNS authoritative records and IP geolocation...');
    await new Promise(r => setTimeout(r, 600));

    setScanStep('Executing TLS 1.3 cryptographic handshake & checking certificate chain...');
    await new Promise(r => setTimeout(r, 700));

    setScanStep('Inspecting HTTP security response headers (HSTS, CSP, X-Frame)...');
    await new Promise(r => setTimeout(r, 600));

    setScanStep('Cross-referencing active CVEs and open port signatures...');
    const result = await performDomainScan(domainInput);

    setScanResult(result);
    setIsScanning(false);
    setScanStep('');
  };

  return (
    <section id="scanner" className="py-16 md:py-24 relative bg-slate-950/60 border-y border-slate-900 cyber-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80 mb-3">
            <Shield className="w-3.5 h-3.5" />
            Live Attack Surface Auditor
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Audit Any Domain’s External Security Posture
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            No agent or credentials required. Test your domain for SSL weaknesses, missing HTTP defense headers, and exposed administrative ports.
          </p>
        </div>

        {/* Input Form Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <form onSubmit={handleScan} className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              id="target-domain-input"
              name="targetDomain"
              type="text"
              autoComplete="url"
              aria-label="Target domain or IP address to audit"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="e.g. acme-corp.com or your-domain.io"
              className="w-full pl-12 pr-36 py-4 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500 font-mono text-sm shadow-xl transition-all"
              disabled={isScanning}
            />
            <button
              type="submit"
              disabled={isScanning}
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Auditing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick preset examples */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Try an example:</span>
            {['google.com', 'stripe.com', 'demo-health-clinic.org'].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setDomainInput(example);
                }}
                className="text-cyan-400/80 hover:text-cyan-300 underline font-mono cursor-pointer"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Scanning in Progress state */}
        {isScanning && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-md shadow-2xl text-center animate-pulse">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Shield className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <p className="text-sm font-semibold text-cyan-300 font-mono">{scanStep}</p>
            <p className="text-xs text-slate-500 mt-2">Correlating signals with threat intelligence feed...</p>
          </div>
        )}

        {/* Scan Results Display */}
        {scanResult && !isScanning && (
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-fade-in">
            
            {/* Header Result Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/50">
                    Audit Report
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Target: <strong className="text-white">{scanResult.domain}</strong> ({scanResult.ip})
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Overall Security Posture Rating
                </h3>
              </div>

              {/* Score Gauge Badge */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">
                    {scanResult.postureScore}<span className="text-slate-500 text-sm">/100</span>
                  </div>
                  <span className="text-xs text-slate-400">Score Health</span>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-lg border ${
                  scanResult.postureScore >= 85 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 shadow-emerald-500/20' 
                    : scanResult.postureScore >= 70
                    ? 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-amber-500/20'
                    : 'bg-rose-950/80 text-rose-400 border-rose-700/60 shadow-rose-500/20'
                }`}>
                  {scanResult.grade}
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              
              {/* SSL / TLS Status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TLS Encryption</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-white">Valid Certificate</p>
                <p className="text-xs text-slate-400 mt-1">
                  Issuer: <span className="text-slate-300 font-mono">{scanResult.sslIssuer}</span>
                </p>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">
                  Expires in {scanResult.sslDaysRemaining} days
                </p>
              </div>

              {/* Port Attack Surface */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Ports</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {scanResult.openPorts.map((port) => (
                    <span 
                      key={port} 
                      className={`text-xs font-mono px-2 py-0.5 rounded border ${
                        port === 22 || port === 8080
                          ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Port {port} {port === 22 ? '(SSH)' : port === 443 ? '(HTTPS)' : port === 80 ? '(HTTP)' : ''}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {scanResult.openPorts.includes(22) ? 'Warning: Management port exposed.' : 'Standard web traffic ports open.'}
                </p>
              </div>

              {/* Security Headers */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Defensive Headers</span>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Strict-Transport (HSTS)</span>
                    {scanResult.headers.hsts ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Content-Security-Policy</span>
                    {scanResult.headers.contentSecurityPolicy ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">X-Frame-Options (Clickjack)</span>
                    {scanResult.headers.xFrameOptions ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </div>
              </div>

            </div>

            {/* Findings & Risks Section */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Identified Vulnerabilities & Risks
              </h4>
              <div className="space-y-2">
                {scanResult.detectedRisks.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations & Remediation */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Automated Remediation Guidance
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {scanResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>

            {/* CTA action */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Want 24/7 continuous scans with automated AI triage when issues arise?
              </p>
              <button
                onClick={() => onSendToConsole?.(scanResult)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs tracking-wide transition-all flex items-center gap-2 cursor-pointer"
              >
                Track This Domain in SOC Console
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
