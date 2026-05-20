import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, History, Settings, LogOut, ChevronRight, Activity, Timer, Monitor, Zap, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// API & UI Components
import { createFocusRecord } from '../api/focus_records';
import LoadingOverlay from './ui/LoadingOverlay';
import LogoutModal from './ui/LogoutModal';
// 各ファイルへの正しい相対パス
import LandingPage from '../pages/auth/LandingPage';
import SignUpPage from '../pages/auth/SignUpPage';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import TermsPage from '../pages/static/TermsPage';
import PrivacyPage from '../pages/static/PrivacyPage';
import AnalysisPage from '../pages/main/AnalysisPage';
import HistoryPage from '../pages/main/HistoryPage';
import FocusDetectionPage from '../pages/main/FocusDetectionPage';
import ConcentrationTimer from '../pages/main/ConcentrationTimer';
import PcLinkPage from '../pages/main/PcLinkPage';

/**
 * 認証後の共通レイアウト
 */
const AuthenticatedLayout = ({ children, currentPage, setCurrentPage, onLogout, isPc }) => {
  const { t } = useTranslation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { id: 'pc-link', icon: Monitor, label: t('nav_pc_link') },
    { id: 'timer', icon: Timer, label: t('nav_timer') },
    { id: 'analysis', icon: LayoutDashboard, label: t('nav_analysis') },
    { id: 'history', icon: History, label: t('nav_history') },
    { id: 'settings', icon: Settings, label: t('nav_settings') },
  ];

  const mobileNavItems = [
    { id: 'timer', icon: Timer, label: t('nav_timer') },
    { id: 'analysis', icon: LayoutDashboard, label: t('nav_analysis') },
    { id: 'history', icon: History, label: t('nav_history') },
    { id: 'settings', icon: Settings, label: t('nav_settings') },
    { id: 'logout', icon: LogOut, label: t('nav_logout'), isLogout: true },
  ];

  if (isPc) {
    return (
      <div className="fixed inset-0 bg-slate-950 text-slate-100 flex overflow-hidden">
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col p-6">
          <div className="mb-10 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Zap size={18} className="text-white fill-current" />
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase">
                FocusFlow
              </h1>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                  (item.id === 'settings' ? ['settings', 'terms', 'privacy'].includes(currentPage) : currentPage === item.id)
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-slate-500 hover:text-rose-400 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span>{t('nav_logout')}</span>
          </button>
        </aside>
        <main className="flex-1 overflow-y-auto relative">{children}</main>
        <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={onLogout} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <main className="flex-1 p-5 max-w-md mx-auto w-full overflow-y-auto relative pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-slate-900 backdrop-blur-xl py-2 h-16 flex items-center z-50">
        <div className="flex w-full items-center justify-around px-2">
          {mobileNavItems.map((item) => {
            const isActive = item.id === 'settings'
              ? ['settings', 'terms', 'privacy', 'pc-link'].includes(currentPage)
              : currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => item.isLogout ? setIsLogoutModalOpen(true) : setCurrentPage(item.id)}
                className="flex flex-col items-center justify-center gap-1 flex-1 transition-all active:scale-95"
              >
                <div className={`relative p-1 transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full -z-10" />
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${
                  isActive ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={onLogout} />
    </div>
  );
};

/**
 * 設定画面
 */
const SettingsPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in duration-500 p-6 max-w-md mx-auto lg:mx-0">
      <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-indigo-400">Settings</h2>
      <div className="space-y-3">
        <button
          onClick={() => onNavigate('pc-link')}
          className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Monitor size={18} className="text-indigo-400" />
            <span>PC連携設定</span>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('terms')}
          className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
        >
          <span>{t('terms_of_service')}</span>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </button>
        <button
          onClick={() => onNavigate('privacy')}
          className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
        >
          <span>{t('privacy_policy')}</span>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPc, setIsPc] = useState(false);

  const [currentFocusData, setCurrentFocusData] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsPc(width >= 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const navigate = (page) => {
    setHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
  };

  const handlePageChange = (page) => {
    if (page === 'history' && currentPage === 'history') {
      setHistoryKey(prev => prev + 1);
    }
    setCurrentPage(page);
  };

  const goBack = () => {
    if (history.length > 0) {
      const lastPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(lastPage);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    if (window.innerWidth >= 1024) {
      setCurrentPage('pc-link');
    } else {
      setCurrentPage('timer');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/users/sign_out', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        }
      });
      if (response.ok) {
        window.location.href = '/users/sign_in';
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Audio play failed:", e);
      });
    }
  };

  const handleFocusComplete = async (result) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSaving(true);
    try {
      const response = await createFocusRecord(result);
      if (response && response.focus_record) {
        setCurrentFocusData(response.focus_record);
      } else {
        setCurrentFocusData(result);
      }
      setCurrentPage('analysis');
    } catch (error) {
      console.error("Failed to save focus record:", error);
      setCurrentPage('analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const renderAuthPages = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={navigate} />;
      case 'signup':  return <SignUpPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'login':   return <LoginPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'reset':   return <ResetPasswordPage onNavigate={navigate} />;
      case 'terms':   return <TermsPage onNavigate={goBack} />;
      case 'privacy': return <PrivacyPage onNavigate={goBack} />;
      default:          return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {!isAuthenticated ? (
        renderAuthPages()
      ) : (
        <AuthenticatedLayout currentPage={currentPage} setCurrentPage={handlePageChange} onLogout={handleLogout} isPc={isPc}>
          {isSaving && <LoadingOverlay message="Analyzing Session..." />}

          <audio
            ref={audioRef}
            src="https://actions.google.com/sounds/v1/alarms/alarm_clock_ringing_proximity.ogg"
            loop
          />

          <div className="h-full w-full relative">
            {currentPage === 'timer' && (
              isPc ? (
                <FocusDetectionPage onNavigate={setCurrentPage} />
              ) : (
                <ConcentrationTimer
                  onComplete={handleFocusComplete}
                  onTimeUp={playAlarm}
                />
              )
            )}

            {currentPage === 'analysis' && (
              <div className={isPc ? "p-10" : ""}>
                <AnalysisPage
                  focusData={currentFocusData}
                  onBack={() => setCurrentPage('timer')}
                />
              </div>
            )}

            {currentPage === 'history' && (
              <div className={isPc ? "p-10" : ""}>
                <HistoryPage key={historyKey} />
              </div>
            )}

            {currentPage === 'settings' && <SettingsPage onNavigate={navigate} />}

            {currentPage === 'pc-link' && (
              <div className={isPc ? "" : "absolute inset-0 z-50 bg-slate-950"}>
                <PcLinkPage onNavigate={goBack} />
              </div>
            )}

            {(currentPage === 'terms' || currentPage === 'privacy') && (
              <div className="absolute inset-0 z-50 bg-slate-950">
                {currentPage === 'terms' ? <TermsPage onNavigate={goBack} /> : <PrivacyPage onNavigate={goBack} />}
              </div>
            )}
          </div>
        </AuthenticatedLayout>
      )}
    </div>
  );
}