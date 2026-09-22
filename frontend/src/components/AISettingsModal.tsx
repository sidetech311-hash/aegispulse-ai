import React, { useState, useEffect } from 'react';
import { X, Sparkles, Cpu, Shield, CheckCircle2, AlertCircle, Loader2, Key, Eye, EyeOff, Server, ExternalLink } from 'lucide-react';
import type { AIProvider, AISettings, AITestResult } from '../types';
import { fetchAIConfig, saveAIConfig, testAIConnection } from '../services/api';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (settings: AISettings) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [showKey, setShowKey] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AITestResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAIConfig().then((cfg) => {
        if (cfg.provider) setProvider(cfg.provider);
        if (cfg.geminiKey) setGeminiKey(cfg.geminiKey);
        if (cfg.openaiKey) setOpenaiKey(cfg.openaiKey);
        if (cfg.ollamaHost) setOllamaHost(cfg.ollamaHost);
        if (cfg.ollamaModel) setOllamaModel(cfg.ollamaModel);
      });
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const activeKey = provider === 'gemini' ? geminiKey : provider === 'openai' ? openaiKey : undefined;
    const res = await testAIConnection(provider, activeKey, ollamaHost, ollamaModel);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newSettings: AISettings = {
      provider,
      geminiKey,
      openaiKey,
      ollamaHost,
      ollamaModel
    };
    await saveAIConfig(newSettings);
    setSaving(false);
    setSavedSuccess(true);
    onConfigSaved?.(newSettings);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">AI Threat Intelligence Engine</h3>
            <p className="text-xs text-slate-400 font-mono">Connect enterprise LLM providers or run local on-prem</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Provider Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Select AI Engine Provider:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Gemini */}
              <button
                type="button"
                onClick={() => { setProvider('gemini'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'gemini'
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {provider === 'gemini' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-xs font-bold text-white">Google Gemini</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">3.6 Flash / Free</p>
              </button>

              {/* OpenAI */}
              <button
                type="button"
                onClick={() => { setProvider('openai'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'openai'
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  {provider === 'openai' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-xs font-bold text-white">OpenAI</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">GPT-4o mini</p>
              </button>

              {/* Ollama */}
              <button
                type="button"
                onClick={() => { setProvider('ollama'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'ollama'
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  {provider === 'ollama' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-xs font-bold text-white">Local Ollama</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Air-gapped / Free</p>
              </button>

              {/* Heuristic */}
              <button
                type="button"
                onClick={() => { setProvider('heuristic'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === 'heuristic'
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  {provider === 'heuristic' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-xs font-bold text-white">Autonomous</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Built-in Rules</p>
              </button>

            </div>
          </div>

          {/* Provider Specific Inputs */}
          {provider === 'gemini' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="gemini-key-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  Google Gemini API Key:
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  id="gemini-key-input"
                  name="geminiKey"
                  type={showKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Model: <strong>gemini-3.6-flash</strong> (Ultra-fast structured security responses)
              </p>
            </div>
          )}

          {provider === 'openai' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="openai-key-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  OpenAI API Key:
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  Get OpenAI Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  id="openai-key-input"
                  name="openaiKey"
                  type={showKey ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Model: <strong>gpt-4o-mini</strong> (High efficiency JSON security output)
              </p>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div>
                <label htmlFor="ollama-host-input" className="text-xs font-semibold text-slate-300 block mb-1">
                  Ollama Local Host Endpoint:
                </label>
                <input
                  id="ollama-host-input"
                  name="ollamaHost"
                  type="text"
                  value={ollamaHost}
                  onChange={(e) => setOllamaHost(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label htmlFor="ollama-model-input" className="text-xs font-semibold text-slate-300 block mb-1">
                  Model Tag:
                </label>
                <input
                  id="ollama-model-input"
                  name="ollamaModel"
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2 or mistral or deepseek-coder"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Air-gapped on-premises privacy: no telemetry or CVE logs leave your internal network.
              </p>
            </div>
          )}

          {provider === 'heuristic' && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Autonomous Threat Engine (Offline Mode)</strong> uses our embedded rule-based expert system, CVSS scoring algorithms, and curated MITRE ATT&CK remediation playbooks without requiring any external internet API keys.
              </p>
            </div>
          )}

          {/* Test Status Badge */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 font-mono ${
              testResult.success 
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-700 text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>
                <p className="font-bold">{testResult.message}</p>
                {testResult.availableModels && (
                  <p className="text-[11px] mt-1 text-slate-400">
                    Models: {testResult.availableModels.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              Test Connection
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                'Save AI Configuration'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
