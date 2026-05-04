import React, { useState, useRef } from 'react';
import { LayoutDashboard, History, Settings, LogOut, ChevronRight, Activity, Timer } from 'lucide-react';

// API & UI Components
import { createFocusRecord } from '../api/focus_records';
import LoadingOverlay from './ui/LoadingOverlay';

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

/**
 * 認証後の共通レイアウト
 */
const AuthenticatedLayout = ({ children, currentPage, setCurrentPage, onLogout }) => (
  <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
    <main className="flex-1 p-5 max-w-md mx-auto w-full overflow-hidden relative">{children}</main>
    <nav className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-8 py-4 flex justify-between items-center">
      <button onClick={() => setCurrentPage('timer')} className={`p-2 ${currentPage === 'timer' ? 'text-indigo-400' : 'text-slate-600'}`}><Timer size={24} /></button>
      <button onClick={() => setCurrentPage('analysis')} className={`p-2 ${currentPage === 'analysis' ? 'text-indigo-400' : 'text-slate-600'}`}><LayoutDashboard size={24} /></button>
      <button onClick={() => setCurrentPage('history')} className={`p-2 ${currentPage === 'history' ? 'text-indigo-400' : 'text-slate-600'}`}><History size={24} /></button>
      <button onClick={() => setCurrentPage('settings')} className={`p-2 ${['settings', 'terms', 'privacy', 'focus-test'].includes(currentPage) ? 'text-indigo-400' : 'text-slate-600'}`}><Settings size={24} /></button>
      <button onClick={onLogout} className="p-2 text-slate-600 hover:text-rose-400"><LogOut size={24} /></button>
    </nav>
  </div>
);

/**
 * 設定画面
 */
const SettingsPage = ({ onNavigate }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-indigo-400">Settings</h2>
    <div className="space-y-3">
      <button
        onClick={() => onNavigate('focus-test')}
        className="w-full text-left p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-indigo-500/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-indigo-400" />
          <span>Focus Detection Test (Beta)</span>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </button>

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
  const [isSaving, setIsSaving] = useState(false);
  
  // 保存された最新の集中データを保持する state を追加
  const [currentFocusData, setCurrentFocusData] = useState(null);

  const audioRef = useRef(null);

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
    setCurrentPage('timer');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setHistory([]);
    setCurrentFocusData(null);
  };

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Audio play failed:", e);
      });
    }
  };

  /**
   * 集中セッション保存処理
   */
  const handleFocusComplete = async (result) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSaving(true);
    
    try {
      // APIから返ってくる保存済みレコードを取得
      const response = await createFocusRecord(result);
      
      // レスポンスに含まれる focus_record データを保持
      // (Railsのコントローラーが { success: true, focus_record: ... } を返す想定)
      if (response && response.focus_record) {
        setCurrentFocusData(response.focus_record);
      } else {
        // フォールバック: 送信したデータ自体をセット（IDがないため分析は走らないがスコアは出る）
        setCurrentFocusData(result);
      }

      console.log("Focus record saved successfully.");
      setCurrentPage('analysis');
    } catch (error) {
      console.error("Failed to save focus record:", error);
      setCurrentPage('analysis');
    } finally {
      setIsSaving(false);
    }
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
      {isSaving && <LoadingOverlay message="Analyzing Session..." />}

      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock_ringing_proximity.ogg"
        loop
      />

      {currentPage === 'timer' && (
        <ConcentrationTimer
          onComplete={handleFocusComplete}
          onTimeUp={playAlarm}
        />
      )}

      {/* AnalysisPage に保存したデータを渡す */}
      {currentPage === 'analysis' && (
        <AnalysisPage 
          focusData={currentFocusData} 
          onBack={() => setCurrentPage('timer')}
        />
      )}
      
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'settings' && <SettingsPage onNavigate={navigate} />}

      {currentPage === 'focus-test' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <FocusDetectionPage onNavigate={goBack} />
        </div>
      )}

      {(currentPage === 'terms' || currentPage === 'privacy') && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          {currentPage === 'terms' ? <TermsPage onNavigate={goBack} /> : <PrivacyPage onNavigate={goBack} />}
        </div>
      )}
    </AuthenticatedLayout>
  );
}