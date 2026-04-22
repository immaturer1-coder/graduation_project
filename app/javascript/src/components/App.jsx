import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, History, Settings, LogOut, ChevronRight, Activity, Timer } from 'lucide-react';

// API & UI Components
import { createSession } from '../api/sessions';
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

  // アラーム音用のRef
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
  };

  /**
   * フロー修正箇所: 設定時間が過ぎた際のアラーム通知
   */
  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Audio play failed (waiting for user interaction):", e);
      });
    }
  };

  /**
   * フロー修正箇所: 物理アクションによる終了（スマホを表に向ける）
   * 分割したAPIユーティリティを使用して保存を実行します。
   */
  const handleFocusComplete = async (result) => {
    // 1. 音を止める
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSaving(true);
    
    try {
      // 外部化したAPI関数を呼び出し（resultにはlogsが含まれています）
      await createSession(result);
      console.log("Session saved successfully.");
      
      // 2. 分析画面へ遷移
      setCurrentPage('analysis');
    } catch (error) {
      console.error("Failed to save session:", error);
      // エラー時もユーザー体験を阻害しないよう、分析画面へ遷移させる
      // ※ 必要に応じて「保存に失敗しました」等のトースト通知を出すのが理想的
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
      {/* 保存中のオーバーレイ表示 */}
      {isSaving && <LoadingOverlay message="Analyzing Session..." />}

      {/* アラーム音源（ループ再生） */}
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

      {currentPage === 'analysis' && <AnalysisPage />}
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