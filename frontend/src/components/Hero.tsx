import React from 'react';
import { ArrowRight, Sparkles, CheckCircle, Terminal } from 'lucide-react';

interface HeroProps {
  onOpenScanner: () => void;
  onLaunchConsole: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenScanner, onLaunchConsole }) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Live Intercept Ticker Ribbon */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white tracking-wide">SOC TELEMETRY:</span>
          <span className="text-slate-300 hidden sm:inline">Interception rate: 4,892/hr</span>
          <span className="text-cyan-400 font-mono text-[11px] bg-cyan-900/60 px-2 py-0.5 rounded">
            AI Triage Engine Active
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Security Intelligence for Teams That{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Can’t Afford an Incident
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Monitor your attack surface, detect active brute-force attempts and critical CVEs, and trigger autonomous AI remediation playbooks — all from one lightweight dashboard.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={onLaunchConsole}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-cyan-200 group-hover:rotate-6 transition-transform" />
            Launch Live SOC Console
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenScanner}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Run Free Domain Audit
          </button>
        </div>

        {/* Value Proof Badges */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Zero Agent Required</p>
              <p className="text-xs text-slate-400">External attack surface discovery via DNS & HTTP</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">&lt; 15s AI Triage</p>
              <p className="text-xs text-slate-400">Instant plain-English root cause & executive briefing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">1-Click Playbooks</p>
              <p className="text-xs text-slate-400">Copyable Bash, PowerShell, and Cloudflare WAF fixes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">SOC 2 / ISO Ready</p>
              <p className="text-xs text-slate-400">Exportable security posture compliance audits</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
