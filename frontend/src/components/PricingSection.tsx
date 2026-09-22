import React, { useState } from 'react';
import { Check, Zap, Sparkles } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingSection: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [annualBilling, setAnnualBilling] = useState(false);

  const plans = [
    {
      name: 'Community Scout',
      badge: 'Free Forever',
      price: 0,
      description: 'Perfect for solo developers, open-source maintainers, and side projects.',
      features: [
        'Up to 3 monitored domains/IPs',
        'Weekly automated security scans',
        'TLS certificate expiry alerts',
        'Basic HTTP defensive headers audit',
        'Community threat intelligence feed'
      ],
      cta: 'Start Free Audit',
      popular: false
    },
    {
      name: 'Pro SecOps',
      badge: 'Most Popular',
      price: annualBilling ? 39 : 49,
      description: 'Ideal for fast-moving startups and SMEs needing automated security triage.',
      features: [
        'Up to 25 monitored assets & subdomains',
        'Continuous hourly attack surface scanning',
        'Autonomous AI Threat Copilot (unlimited)',
        '1-Click PowerShell & Bash remediation playbooks',
        'Instant Slack, Telegram & Webhook alerts',
        'Port & CVE vulnerability alerts'
      ],
      cta: 'Start 14-Day Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise Shield',
      badge: 'Full Scale',
      price: annualBilling ? 159 : 199,
      description: 'For growing businesses requiring compliance assurance and custom integrations.',
      features: [
        'Unlimited monitored assets & cloud clusters',
        'Real-time continuous network monitoring',
        'SOC 2 & ISO 27001 readiness reports',
        'Custom WAF & Firewall policy integration',
        'Dedicated security advisor support',
        'Full REST API & webhook access'
      ],
      cta: 'Contact Enterprise',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative bg-slate-950/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/60">
            Simple, Transparent Pricing
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Security That Scales With Your Business
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            No 6-figure enterprise contracts or pushy sales reps. Get started in 2 minutes.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-slate-900 border border-slate-800">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !annualBilling ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annualBilling ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-slate-900 border-2 border-cyan-500 shadow-[0_0_35px_rgba(6,182,212,0.25)] scale-105 z-10'
                  : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular Choice
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                    ${plan.price}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {plan.price === 0 ? '/month' : '/month, billed annually'}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Included Capabilities:
                  </p>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA */}
              <div className="mt-8 pt-4">
                <button
                  onClick={() => onSelectPlan(plan.name)}
                  className={`w-full py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {plan.cta}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
