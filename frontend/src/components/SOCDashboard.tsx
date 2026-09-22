import React, { useState } from 'react';
import { 
  Shield, ShieldAlert, Cpu, Plus, Download, Filter, Server, Sparkles, ArrowLeft
} from 'lucide-react';
import type { Incident, MonitoredAsset } from '../types';
import { INITIAL_INCIDENTS, INITIAL_ASSETS } from '../services/api';
import { AICopilotDrawer } from './AICopilotDrawer';

interface SOCDashboardProps {
  onBackToLanding: () => void;
}

export const SOCDashboard: React.FC<SOCDashboardProps> = ({ onBackToLanding }) => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [assets] = useState<MonitoredAsset[]>(INITIAL_ASSETS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'incidents' | 'assets'>('incidents');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Count metrics
  const activeCount = incidents.filter(i => i.status !== 'Resolved').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'Resolved').length;

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'OPEN') return inc.status !== 'Resolved';
    return inc.severity === severityFilter;
  });

  // Simulate a live new threat arrival
  const handleSimulateThreat = () => {
    const threatPool = [
      {
        title: 'Zero-Day Remote Code Execution Probe (CVE-2024-38077)',
        severity: 'CRITICAL' as const,
        targetAsset: 'api-gateway-01 (198.51.100.24)',
        description: 'Heuristic pattern matches known Windows Netlogon/RCE signature payload from external IP 45.142.122.9.',
        attackVector: 'Buffer Overflow / Unauthenticated Remote Code Execution'
      },
      {
        title: 'API Rate Limit Breach on Sensitive Customer Vault',
        severity: 'HIGH' as const,
        targetAsset: 'app.acme-corp.com/v1/auth/tokens',
        description: 'Automated token enumeration observed at 1,400 requests/sec. Distributed across 14 residential proxies.',
        attackVector: 'Credential Stuffing / API Flood'
      },
      {
        title: 'Unencrypted S3 Bucket Policy Alteration Detected',
        severity: 'MEDIUM' as const,
        targetAsset: 'cloud-nexus-backups',
        description: 'IAM user role modified bucket ACL to allow public read access for temporary diagnostic test.',
        attackVector: 'Cloud Permission Drift'
      }
    ];

    const randomThreat = threatPool[Math.floor(Math.random() * threatPool.length)];
    const newInc: Incident = {
      id: `INC-${Math.floor(Math.random() * 8999) + 1000}`,
      title: randomThreat.title,
      severity: randomThreat.severity,
      status: 'Open',
      timestamp: 'Just now',
      targetAsset: randomThreat.targetAsset,
      description: randomThreat.description,
      attackVector: randomThreat.attackVector,
      mitigationAvailable: true
    };

    setIncidents([newInc, ...incidents]);
    showToast(`🚨 New ${newInc.severity} Incident Intercepted: ${newInc.id}`);
  };

  // Mark incident resolved
  const handleResolve = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return { ...inc, status: 'Resolved' };
      }
      return inc;
    }));
    showToast(`✅ Incident ${incidentId} marked as Resolved`);
  };

  // Download mock SOC2 compliance report
  const handleExportReport = () => {
    const text = `AEGISPULSE AI - CONTINUOUS SOC2 SECURITY POSTURE REPORT\nGenerated: ${new Date().toISOString()}\nOverall Posture: 82/100 (Pass)\nActive Incidents: ${activeCount}\nMonitored Endpoints: ${assets.length}\nZero Critical Breaches Detected in the Last 30 Days.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegispulse-soc2-audit-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    showToast('📄 SOC 2 Compliance Report downloaded.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 cyber-grid">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border border-cyan-500/60 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl text-xs font-mono animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Mission Control Bar */}
      <div className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Security Operations Center (SOC)
                </h1>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  DEFENSE: ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Live threat telemetry correlating external attack surfaces & cloud workloads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateThreat}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Simulate Live Threat
            </button>

            <button
              onClick={handleExportReport}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export SOC 2 Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Posture Score */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Posture</span>
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">82</span>
              <span className="text-slate-500 text-sm">/ 100</span>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Grade A
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Optimal defensive posture across all verified endpoints.
            </p>
          </div>

          {/* Active Incidents */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Incidents</span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{activeCount}</span>
              {criticalCount > 0 && (
                <span className="text-xs font-semibold text-rose-400 font-mono">
                  ({criticalCount} Critical)
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Immediate triage recommended for open attack vectors.
            </p>
          </div>

          {/* Monitored Assets */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monitored Assets</span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{assets.length}</span>
              <span className="text-xs text-slate-400">Endpoints</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              External DNS, Web Gateways, and Database clusters.
            </p>
          </div>

          {/* Mean Time to Triage */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mean Time to Triage</span>
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">14s</span>
              <span className="text-xs text-emerald-400 font-mono">(-94% vs human)</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Autonomous Copilot remediation scripts ready on ingest.
            </p>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`pb-2 px-1 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'incidents'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Threat & Incident Feed ({incidents.length})
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-2 px-1 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'assets'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monitored Infrastructure Assets ({assets.length})
          </button>
        </div>

        {/* TAB 1: INCIDENTS FEED */}
        {activeTab === 'incidents' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
            
            {/* Filter controls */}
            <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">Filter Severity:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'OPEN'].map((filt) => (
                  <button
                    key={filt}
                    onClick={() => setSeverityFilter(filt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                      severityFilter === filt
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filt}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Click any incident to open the <strong className="text-cyan-400">AI Copilot Triage Drawer</strong>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Incident ID</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Threat Name & Vector</th>
                    <th className="py-3 px-4">Target Asset</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Detected</th>
                    <th className="py-3 px-4 text-right">Autonomous Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                        {incident.id}
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          incident.severity === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                            : incident.severity === 'HIGH'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                            : 'bg-cyan-950/80 text-cyan-400 border-cyan-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>

                      {/* Title & Vector */}
                      <td className="py-4 px-4 max-w-sm">
                        <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {incident.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                          {incident.attackVector}
                        </p>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-4 font-mono text-slate-300">
                        {incident.targetAsset}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          incident.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : incident.status === 'Investigating'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            incident.status === 'Resolved' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'
                          }`} />
                          {incident.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-4 text-slate-400 font-mono">
                        {incident.timestamp}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-700/60 hover:bg-cyan-900 text-cyan-300 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          AI Triage & Playbook
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: ASSETS LIST */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60">
                      {asset.type}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      asset.status === 'Healthy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : asset.status === 'Warning'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{asset.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{asset.endpoint}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Last scanned: {asset.lastScanned}</span>
                  <button
                    onClick={() => showToast(`Audit requested for ${asset.name}`)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    Run Instant Audit &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onResolve={handleResolve}
      />

    </div>
  );
};
