import React from 'react';
import { Globe, Cpu, Terminal, FileCheck2, BellRing, ShieldCheck } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Globe,
      title: 'Continuous Attack Surface Discovery',
      description: 'Automatically map external domains, subdomains, SSL/TLS certificate expiries, and exposed services without installing invasive agents.',
      tag: 'Reconnaissance'
    },
    {
      icon: Cpu,
      title: 'Autonomous AI Threat Triage',
      description: 'Our fine-tuned SecOps Copilot parses incoming alerts, filters false positives, and explains complex CVEs in actionable plain English.',
      tag: 'AI Intelligence'
    },
    {
      icon: Terminal,
      title: '1-Click Remediation Playbooks',
      description: 'Receive verified, copy-pasteable firewall commands (PowerShell/iptables), Nginx security headers, and Cloudflare WAF JSON payloads.',
      tag: 'Auto-Remediation'
    },
    {
      icon: FileCheck2,
      title: 'SOC 2 & ISO 27001 Compliance Posture',
      description: 'Audit your infrastructure security baselines continuously. Export one-click executive PDF compliance reports for auditors and enterprise clients.',
      tag: 'Compliance'
    },
    {
      icon: BellRing,
      title: 'Instant Multi-Channel Alerting',
      description: 'Route high-confidence security incidents to Telegram, Slack, Webhooks, or PagerDuty with zero alarm fatigue.',
      tag: 'Notification'
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Trust Infrastructure Hardening',
      description: 'Identify public administrative ports, vulnerable cipher suites, and misconfigured cloud buckets before adversaries exploit them.',
      tag: 'Hardening'
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/60">
            Engineered For Modern High-Growth Teams
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Enterprise SecOps Without Enterprise Bloat
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Everything your team needs to prevent breaches, respond within seconds, and maintain compliance.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Explore capability &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
