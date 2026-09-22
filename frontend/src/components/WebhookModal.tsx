import React, { useState, useEffect } from 'react';
import { X, Radio, Check, Loader2, Send, ShieldAlert, Sparkles } from 'lucide-react';
import { getWebhookConfig, saveWebhookConfig, testWebhook } from '../services/api';
import type { WebhookConfig } from '../types';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'discord' | 'slack'>('discord');
  const [discordUrl, setDiscordUrl] = useState('');
  const [slackUrl, setSlackUrl] = useState('');
  const [autoAlertCritical, setAutoAlertCritical] = useState(true);
  const [autoAlertHigh, setAutoAlertHigh] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getWebhookConfig();
      setDiscordUrl(cfg.discordUrl);
      setSlackUrl(cfg.slackUrl);
      setAutoAlertCritical(cfg.autoAlertCritical);
      setAutoAlertHigh(cfg.autoAlertHigh);
      setEnabled(cfg.enabled);
      setTestStatus(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    const url = activeTab === 'discord' ? discordUrl : slackUrl;
    setTesting(true);
    setTestStatus(null);
    const res = await testWebhook(url, activeTab);
    setTestStatus(res);
    setTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config: WebhookConfig = {
      discordUrl,
      slackUrl,
      autoAlertCritical,
      autoAlertHigh,
      enabled
    };
    saveWebhookConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleUseDemo = () => {
    setDiscordUrl('https://discord.com/api/webhooks/demo/aegispulse-secops-channel');
    setSlackUrl('https://hooks.slack.com/services/DEMO/AEGISPULSE/secops-alerts');
    setEnabled(true);
    setAutoAlertCritical(true);
    setAutoAlertHigh(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Real-Time Alert Webhooks
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Live Dispatch
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Broadcast critical threat cards to Slack & Discord</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('discord'); setTestStatus(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'discord'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Discord Channel</span>
              {discordUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('slack'); setTestStatus(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'slack'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Slack Incoming Webhook</span>
              {slackUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>

          {/* Discord Tab */}
          {activeTab === 'discord' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Discord Webhook URL:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1.5">
                  Server Settings &rarr; Integrations &rarr; Webhooks &rarr; New Webhook
                </p>
              </div>

              {/* Discord Embed Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-900/50 space-y-2">
                <span className="text-[10px] uppercase font-mono text-indigo-400 block font-bold">Discord Embed Preview:</span>
                <div className="border-l-4 border-rose-500 pl-3 py-1 space-y-1 bg-slate-900/60 rounded-r-lg p-2">
                  <p className="text-xs font-bold text-white">🚨 [CRITICAL] Exposed SSH Port Under Active Brute-Force</p>
                  <p className="text-[11px] text-slate-400">Target: api-gateway-01 | CVSS: 9.8 | Exploit: CVE-2024-6387</p>
                  <span className="inline-block text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded">
                    1-Click Containment Command Included
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Slack Tab */}
          {activeTab === 'slack' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Slack Webhook URL:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1.5">
                  Slack App &rarr; Incoming Webhooks &rarr; Add New Webhook to Workspace
                </p>
              </div>

              {/* Slack Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/50 space-y-2">
                <span className="text-[10px] uppercase font-mono text-amber-400 block font-bold">Slack Block Kit Preview:</span>
                <div className="border-l-4 border-amber-500 pl-3 py-1 space-y-1 bg-slate-900/60 rounded-r-lg p-2">
                  <p className="text-xs font-bold text-white">🔴 [CRITICAL] Incident INC-9041 Flagged</p>
                  <p className="text-[11px] text-slate-400">AegisPulse Copilot ready with automated fail2ban quarantine</p>
                </div>
              </div>
            </div>
          )}

          {/* Automation Toggles */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Broadcast CRITICAL Threats</span>
                <span className="text-[11px] text-slate-400">Instantly ping channels when root exploits or brute-forces hit</span>
              </div>
              <input
                type="checkbox"
                checked={autoAlertCritical}
                onChange={(e) => setAutoAlertCritical(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Broadcast HIGH Severity</span>
                <span className="text-[11px] text-slate-400">Notify team on SSL expiry and unencrypted endpoints</span>
              </div>
              <input
                type="checkbox"
                checked={autoAlertHigh}
                onChange={(e) => setAutoAlertHigh(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              testStatus.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              {testStatus.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Helper demo button */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-cyan-400 hover:text-cyan-300 font-mono underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill with Instant Demo Webhooks</span>
            </button>

            <button
              type="button"
              onClick={handleTestPing}
              disabled={testing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-cyan-400" />}
              <span>Send Test Ping</span>
            </button>
          </div>

          {/* Save Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Webhook Settings</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
