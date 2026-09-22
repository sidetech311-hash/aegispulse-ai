import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DomainScannerWidget } from './components/DomainScannerWidget';
import { FeaturesGrid } from './components/FeaturesGrid';
import { PricingSection } from './components/PricingSection';
import { SOCDashboard } from './components/SOCDashboard';
import { AISettingsModal } from './components/AISettingsModal';
import { AuthModal } from './components/AuthModal';
import { WebhookModal } from './components/WebhookModal';
import { Footer } from './components/Footer';
import type { ScanResult, UserProfileResponse } from './types';
import { fetchAIConfig } from './services/api';
import { getStoredUser, clearAuthSession } from './services/auth';
import { X, Shield } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [activeAIProvider, setActiveAIProvider] = useState<string>('gemini');
  const [currentUser, setCurrentUser] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    // Restore user session if present
    const stored = getStoredUser();
    if (stored) setCurrentUser(stored);

    // Fetch AI configuration
    fetchAIConfig().then((cfg) => {
      if (cfg.provider) setActiveAIProvider(cfg.provider);
    });
  }, []);

  const handleOpenScanner = () => {
    setCurrentView('landing');
    setTimeout(() => {
      document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSendToConsole = (_result: ScanResult) => {
    setCurrentView('dashboard');
  };

  const handleAuthSuccess = (user: UserProfileResponse) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar with AI Engine trigger & User Session */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenScanner={handleOpenScanner}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        onOpenWebhooks={() => setIsWebhookModalOpen(true)}
        activeAIProvider={activeAIProvider}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === 'landing' ? (
          <>
            <Hero
              onOpenScanner={handleOpenScanner}
              onLaunchConsole={() => setCurrentView('dashboard')}
            />
            <DomainScannerWidget onSendToConsole={handleSendToConsole} />
            <FeaturesGrid />
            <PricingSection onSelectPlan={(plan) => setSelectedPlanModal(plan)} />
          </>
        ) : (
          <SOCDashboard onBackToLanding={() => setCurrentView('landing')} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Engine Settings Modal */}
      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        onConfigSaved={(cfg) => setActiveAIProvider(cfg.provider)}
      />

      {/* Slack & Discord Webhooks Integration Modal */}
      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Onboarding / Plan Selection Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Initialize {selectedPlanModal}</h3>
                <p className="text-xs text-slate-400 font-mono">14-Day Free Evaluation &bull; No Credit Card</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              You are launching your company’s autonomous defense perimeter. You can connect your external domains, view real-time CVEs, and generate AI remediation playbooks immediately.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSelectedPlanModal(null);
                setCurrentView('dashboard');
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="company-name-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Team Name
                </label>
                <input
                  id="company-name-input"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  required
                  placeholder="e.g. Acme Health or CyberSec Labs"
                  defaultValue="Apex Infrastructure"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label htmlFor="primary-domain-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Domain to Monitor
                </label>
                <input
                  id="primary-domain-input"
                  name="primaryDomain"
                  type="text"
                  autoComplete="url"
                  required
                  placeholder="e.g. acme.com"
                  defaultValue="apex-infra.cloud"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/30 cursor-pointer"
              >
                Launch Defenses in SOC Console
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
