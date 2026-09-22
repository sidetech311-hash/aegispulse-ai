import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Terminal, Copy, Check, ShieldAlert, Cpu, 
  CheckCircle2, Loader2, Send, MessageSquare, CornerDownRight,
  FileText, Radio
} from 'lucide-react';
import type { Incident, AICopilotAnalysis, AIChatMessage } from '../types';
import { getAICopilotAnalysis, sendCopilotChat, dispatchWebhookAlert } from '../services/api';
import { ExecutiveReportModal } from './ExecutiveReportModal';
import { CVEDetailsModal } from './CVEDetailsModal';

interface AICopilotDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onResolve: (incidentId: string) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ incident, onClose, onResolve }) => {
  const [analysis, setAnalysis] = useState<AICopilotAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCVEModalOpen, setIsCVEModalOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  // Chat follow-up state
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (!incident) {
      setAnalysis(null);
      setChatMessages([]);
      return;
    }

    setLoading(true);
    setChatMessages([]);
    getAICopilotAnalysis(incident)
      .then((data) => {
        setAnalysis(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [incident]);

  if (!incident) return null;

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.remediationCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolveClick = () => {
    onResolve(incident.id);
    onClose();
  };

  const handleBroadcastAlert = async () => {
    if (!incident || broadcasting) return;
    setBroadcasting(true);
    const res = await dispatchWebhookAlert(incident);
    setBroadcastNotice(res.message);
    setBroadcasting(false);
    setTimeout(() => setBroadcastNotice(null), 4500);
  };

  // Handle conversational inquiry with AI Copilot
  const handleSendChat = async (questionText?: string) => {
    const text = (questionText || inputQuestion).trim();
    if (!text || isAsking) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const res = await sendCopilotChat(incident, text);
      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'copilot',
        text: res.reply,
        provider: res.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const suggestionChips = [
    'Generate PowerShell command for Windows',
    'Write an executive briefing for leadership',
    'How do I safely verify this with curl?',
    'What MITRE ATT&CK technique is this?'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-cyan-500/30 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Top Header */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">AI SecOps Copilot Triage</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Live Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Analyzing Incident: <strong className="text-cyan-300">{incident.id}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBroadcastAlert}
                disabled={broadcasting}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                title="Broadcast incident alert card to Slack & Discord"
              >
                {broadcasting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>Broadcast Alert</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Export executive PDF & compliance audit report"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Dossier (PDF)</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Webhook Broadcast Notice Banner */}
          {broadcastNotice && (
            <div className="px-6 py-2.5 bg-indigo-950/90 border-b border-indigo-700/80 text-xs text-indigo-200 font-mono flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>{broadcastNotice}</span>
              </div>
              <button onClick={() => setBroadcastNotice(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Incident Context Banner */}
          <div className="p-6 bg-slate-950/40 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase border ${
                incident.severity === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : incident.severity === 'HIGH'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-cyan-950 text-cyan-400 border-cyan-800'
              }`}>
                {incident.severity}
              </span>
              <h2 className="text-lg font-bold text-white">{incident.title}</h2>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {incident.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              <span>Target: <strong className="text-slate-200">{incident.targetAsset}</strong></span>
              <span>Vector: <strong className="text-slate-200">{incident.attackVector}</strong></span>
              {incident.cve && (
                <button
                  type="button"
                  onClick={() => setIsCVEModalOpen(true)}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2.5 py-0.5 rounded border border-rose-800/80 hover:border-rose-500 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                  title="Inspect CVE Threat Intelligence Dossier"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>{incident.cve}</span>
                  <span className="text-[10px] text-cyan-400 font-sans font-bold underline ml-1">Threat Intel &rarr;</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Analysis Body */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">Synthesizing telemetry & generating playbook...</p>
                <p className="text-xs text-slate-500 font-mono mt-1">Cross-referencing MITRE ATT&CK framework</p>
              </div>
            ) : analysis ? (
              <>
                {/* Executive Briefing */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      Executive Summary (CISO / Leadership)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      CVSS: <strong className="text-rose-400">{analysis.cvssScore}</strong>/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis.executiveSummary}
                  </p>
                </div>

                {/* Technical Impact */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Technical Vulnerability & Attack Surface Impact
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis.technicalImpact}
                  </p>
                </div>

                {/* Step-by-Step Playbook Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Recommended Remediation Sequence
                  </h4>
                  <div className="space-y-2">
                    {analysis.playbookSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-cyan-800">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Code Playbook */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      1-Click Remediation Script ({analysis.commandType.toUpperCase()})
                    </span>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre-wrap">{analysis.remediationCommand}</pre>
                  </div>
                </div>

                {/* Interactive AI Chat with Copilot */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Ask AI Copilot Follow-up
                    </h4>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {suggestionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(chip)}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3 h-3 text-cyan-400" />
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Chat Conversation Stream */}
                  {chatMessages.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 ml-8'
                              : 'bg-slate-950 border border-slate-800 text-slate-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                            <span className="font-bold uppercase text-cyan-400">
                              {msg.sender === 'user' ? 'You' : msg.provider || 'AI Copilot'}
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chat Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="relative flex items-center"
                  >
                    <input
                      id="copilot-chat-input"
                      name="copilotQuestion"
                      type="text"
                      value={inputQuestion}
                      onChange={(e) => setInputQuestion(e.target.value)}
                      placeholder="Ask the Copilot (e.g. 'How do I block this in Nginx?')..."
                      className="w-full pl-3 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                      disabled={isAsking}
                    />
                    <button
                      type="submit"
                      disabled={isAsking || !inputQuestion.trim()}
                      className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      {isAsking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Ask</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </>
            ) : null}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close Drawer
          </button>

          <button
            onClick={handleResolveClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply Fix & Mark Resolved
          </button>
        </div>

      </div>

      {/* Executive PDF & Audit Dossier Modal */}
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        incident={incident}
        analysis={analysis}
        type="incident"
      />

      {/* CVE Threat Intelligence Modal */}
      <CVEDetailsModal
        cveId={incident.cve || null}
        isOpen={isCVEModalOpen}
        onClose={() => setIsCVEModalOpen(false)}
      />
    </div>
  );
};
