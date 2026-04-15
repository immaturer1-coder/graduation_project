import React, { useState } from 'react';
import { LayoutDashboard, History, Settings, LogOut, ChevronRight } from 'lucide-react';

// あなたが移転させた各ファイルへの正しい相対パス
import LandingPage from '../pages/auth/LandingPage';
import SignUpPage from '../pages/auth/SignUpPage';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import TermsPage from '../pages/static/TermsPage';
import PrivacyPage from '../pages/static/PrivacyPage';
import AnalysisPage from '../pages/main/AnalysisPage';
import HistoryPage from '../pages/main/HistoryPage';

/**
 * 認証後の共通レイアウト
 */
const AuthenticatedLayout = ({ children, currentPage, setCurrentPage, onLogout }) => (
  <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
    <main className="flex-1 p-5 max-w-md mx-auto w-full overflow-hidden relative">{children}</main>
    <nav className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-8 py-4 flex justify-between items-center">
      <button onClick={() => setCurrentPage('analysis')} className={`p-2 ${currentPage === 'analysis' ? 'text-indigo-400' : 'text-slate-600'}`}><LayoutDashboard size={24} /></button>
      <button onClick={() => setCurrentPage('history')} className={`p-2 ${currentPage === 'history' ? 'text-indigo-400' : 'text-slate-600'}`}><History size={24} /></button>
      <button onClick={() => setCurrentPage('settings')} className={`p-2 ${['settings', 'terms', 'privacy'].includes(currentPage) ? 'text-indigo-400' : 'text-slate-600'}`}><Settings size={24} /></button>
      <button onClick={onLogout} className="p-2 text-slate-600 hover:text-rose-400"><LogOut size={24} /></button>
    </nav>
  </div>
);

/**
 * 設定画面（ラベルを英語表記に変更）
 */
const SettingsPage = ({ onNavigate }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-indigo-400">Settings</h2>
    <div className="space-y-3">
      <button 
        onClick={() => onNavigate('terms')} 
        className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
      >
        <span>Terms of Service</span>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </button>
      <button 
        onClick={() => onNavigate('privacy')} 
        className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
      >
        <span>Privacy Policy</span>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </button>
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [history, setHistory] = useState([]);

  const navigate = (page) => {
    setHistory(prev => [...prev, currentPage]);
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
    setCurrentPage('analysis');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setHistory([]);
  };

  if (!isAuthenticated) {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={navigate} />;
      case 'signup':  return <SignUpPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'login':   return <LoginPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'reset':   return <ResetPasswordPage onNavigate={navigate} />;
      case 'terms':   return <TermsPage onNavigate={goBack} />;
      case 'privacy': return <PrivacyPage onNavigate={goBack} />;
      default:        return <LandingPage onNavigate={navigate} />;
    }
  }

  return (
    <AuthenticatedLayout currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout}>
      {currentPage === 'analysis' && <AnalysisPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'settings' && <SettingsPage onNavigate={navigate} />}
      {(currentPage === 'terms' || currentPage === 'privacy') && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          {currentPage === 'terms' ? <TermsPage onNavigate={goBack} /> : <PrivacyPage onNavigate={goBack} />}
        </div>
      )}
    </AuthenticatedLayout>
  );
}