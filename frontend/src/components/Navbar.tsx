import React from 'react';
import { Shield, Activity, Terminal, ExternalLink, Sparkles, User, LogOut } from 'lucide-react';
import type { UserProfileResponse } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  onOpenScanner?: () => void;
  onOpenAISettings?: () => void;
  activeAIProvider?: string;
  currentUser?: UserProfileResponse | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setCurrentView, 
  onOpenScanner, 
  onOpenAISettings,
  activeAIProvider = 'gemini',
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                AegisPulse<span className="text-cyan-400 font-extrabold">.AI</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
              Autonomous SecOps & AI Triage
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => setCurrentView('landing')}
            className={`transition-colors hover:text-cyan-400 cursor-pointer ${currentView === 'landing' ? 'text-cyan-400' : ''}`}
          >
            Overview
          </button>
          <a 
            href="#scanner" 
            onClick={() => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
              }
              onOpenScanner?.();
            }}
            className="transition-colors hover:text-cyan-400"
          >
            Domain Scanner
          </a>
          <a href="#features" className="transition-colors hover:text-cyan-400">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-cyan-400">
            Pricing
          </a>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer ${
              currentView === 'dashboard' ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Live SOC Console
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          
          {/* AI Provider Config Pill */}
          <button
            onClick={onOpenAISettings}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-cyan-300 transition-all cursor-pointer shadow-sm"
            title="Configure AI Engine (Gemini / OpenAI / Ollama)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI:</span>
            <span className="capitalize font-bold text-white">{activeAIProvider}</span>
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[11px] border border-cyan-800">
                {currentUser.fullName[0]}
              </div>
              <div className="hidden lg:block text-left font-mono">
                <p className="text-white text-[11px] font-bold leading-none">{currentUser.fullName}</p>
                <p className="text-slate-400 text-[9px] leading-none mt-0.5">{currentUser.companyName}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Sign In
            </button>
          )}

          {currentView === 'landing' ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-semibold rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:from-cyan-500 group-hover:to-blue-600 hover:text-white text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer"
            >
              <span className="relative px-3.5 py-1.5 transition-all ease-in duration-75 bg-slate-950 rounded-md group-hover:bg-opacity-0 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
                Console
              </span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('landing')}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Website
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-300 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            GitHub
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

      </div>
    </header>
  );
};
