import React from 'react';
import { Shield, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                AegisPulse<span className="text-cyan-400">.AI</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Autonomous attack surface intelligence, continuous threat triage, and 1-click remediation playbooks built for modern infrastructure.
            </p>

            {/* Operational Status Pill */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">All Security Telemetry Clusters Active</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><a href="#scanner" className="hover:text-cyan-400 transition-colors">Attack Surface Scanner</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">AI SecOps Copilot</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Transparent Pricing</a></li>
              <li><span className="text-slate-500">SOC 2 / ISO Automation</span></li>
            </ul>
          </div>

          {/* Developer / Enterprise */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider uppercase text-[11px]">
              Developers & SecOps
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-cyan-400" /><span className="text-slate-300">FastAPI REST Endpoints</span></li>
              <li><span className="text-slate-400">Swagger API Docs (/docs)</span></li>
              <li><span className="text-slate-400">Dockerized Deployment</span></li>
              <li><span className="text-slate-400">Threat Intelligence Feed</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} AegisPulse AI Inc. Built for cybersecurity engineers and high-velocity teams.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Enterprise Grade</span>
            <span>&bull;</span>
            <span>Zero Data Ingestion Lock-in</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
