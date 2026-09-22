import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, ExternalLink, Loader2, Copy, Check } from 'lucide-react';
import type { CVEDetail } from '../types';
import { fetchCVEDetails } from '../services/api';

interface CVEDetailsModalProps {
  cveId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CVEDetailsModal: React.FC<CVEDetailsModalProps> = ({ cveId, isOpen, onClose }) => {
  const [data, setData] = useState<CVEDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  useEffect(() => {
    if (isOpen && cveId) {
      setLoading(true);
      fetchCVEDetails(cveId)
        .then((detail) => setData(detail))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, cveId]);

  if (!isOpen || !cveId) return null;

  const handleCopyPatch = () => {
    if (!data?.patchAdvisory) return;
    navigator.clipboard.writeText(data.patchAdvisory);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)] shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-white font-mono tracking-tight">{cveId}</span>
                {data && (
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                    data.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : data.severity === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}>
                    {data.severity}
                  </span>
                )}
                {data?.cisaKev && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/90 text-rose-200 border border-rose-600 font-bold flex items-center gap-1 shadow-sm">
                    <AlertTriangle className="w-3 h-3 text-rose-300" />
                    CISA KEV: Active In-The-Wild Exploitation
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 mt-1">
                {data?.title || `Threat Intelligence Dossier: ${cveId}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Querying National Vulnerability Database & Threat Intel sensors...</p>
            </div>
          ) : data ? (
            <>
              {/* Score & Vector Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">CVSS v3.1 Score</span>
                  <p className="text-xl font-black font-mono text-rose-400">{data.cvssScore} <span className="text-xs text-slate-500">/ 10</span></p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Attack Vector</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">{data.metrics.attackVector}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Attack Complexity</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">{data.metrics.attackComplexity}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Privileges Req.</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">{data.metrics.privilegesRequired}</p>
                </div>
              </div>

              {/* Vector string pill */}
              <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>Vector: <strong className="text-white">{data.vectorString}</strong></span>
                <span className="text-[10px] text-slate-500">CVSS v3.1 Standard</span>
              </div>

              {/* Description & CWE */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Vulnerability Description:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  {data.description}
                </p>
                <p className="text-[11px] font-mono text-slate-400 px-1">
                  Classification: <span className="text-slate-200 font-semibold">{data.cwe}</span>
                </p>
              </div>

              {/* MITRE ATT&CK Matrix */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  MITRE ATT&CK® Framework Mapping:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.mitreTechniques.map((tech) => (
                    <div key={tech.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold text-[10px] shrink-0">
                        {tech.id}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{tech.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Tactic: {tech.tactic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Products & Patch Guidance */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Affected Products & Remediation:
                </span>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Impacted Packages:</span>
                    <ul className="list-disc pl-4 text-xs text-rose-300 font-mono space-y-0.5">
                      {data.affectedProducts.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Recommended Mitigation:</span>
                      <button
                        onClick={handleCopyPatch}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPatch ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 font-mono bg-black/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                      {data.patchAdvisory}
                    </p>
                  </div>
                </div>
              </div>

              {/* External References */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">Authoritative References:</span>
                <div className="flex flex-wrap gap-2">
                  {data.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>{ref.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-mono">
            Source: NIST National Vulnerability Database & CISA KEV Feed
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
