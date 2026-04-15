import React, { useState } from 'react';
import {
  Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, UserPlus, LogIn,
  BarChart2, History, Settings, MessageSquare, Clock, Zap, Target,
  LayoutDashboard, LogOut
} from 'lucide-react';

// --- モックデータ (Mock Data) ---
const MOCK_ANALYSIS = {
  score: 85,
  focusTime: "120 min",
  aiMessage: "中盤の40分間は深いフロー状態でした。休憩を少し長めに取るとさらに効率が上がります。",
  recentLogs: [
    { id: 1, date: "03/20", duration: "50 min", score: 92 },
    { id: 2, date: "03/19", duration: "25 min", score: 65 },
  ]
};

// --- 共通コンポーネント (Common Components) ---

const InputField = ({ label, type, placeholder, icon: Icon }) => (
  <div className="mb-3">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
        <Icon size={16} />
      </div>
      <input
        type={type}
        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const PrimaryButton = ({ children, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 text-sm"
  >
    {children}
    {Icon && <Icon size={18} />}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

// --- 各画面コンポーネント (Pages) ---

// 1. 分析詳細画面 (AnalysisPage)
const AnalysisPage = () => (
  <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <header className="flex-shrink-0 pt-2">
      <h2 className="text-xl font-black italic tracking-tighter text-white">ANALYSIS</h2>
    </header>

    {/* 曲線グラフ・プレースホルダー */}
    <Card className="flex-1 min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 border-dashed border-indigo-500/30 bg-indigo-500/5">
      <div className="relative w-full h-full flex items-center justify-center">
        <BarChart2 size={32} className="text-indigo-400 opacity-30 absolute" />
        {/* 将来的にここにSVGやCanvasの曲線が入る */}
        <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-[0.2em] z-10">Focus Flow Graph (Curve)</p>
      </div>
    </Card>

    {/* AIフィードバック */}
    <Card className="flex-shrink-0 bg-indigo-500/10 border-indigo-500/20">
      <div className="flex items-start gap-3">
        <MessageSquare size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
        <div>
          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Advisor</p>
          <p className="text-xs text-slate-300 leading-snug">
            {MOCK_ANALYSIS.aiMessage}
          </p>
        </div>
      </div>
    </Card>

    {/* 統計カード */}
    <div className="flex-shrink-0 grid grid-cols-2 gap-3 pb-2">
      <Card className="flex items-center gap-3 py-3">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Zap size={18} /></div>
        <div>
          <p className="text-[8px] text-slate-500 font-bold uppercase">Score</p>
          <p className="text-xl font-black text-white italic leading-none">{MOCK_ANALYSIS.score}</p>
        </div>
      </Card>
      <Card className="flex items-center gap-3 py-3">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={18} /></div>
        <div>
          <p className="text-[8px] text-slate-500 font-bold uppercase">Focus Time</p>
          <p className="text-xl font-black text-white italic leading-none">{MOCK_ANALYSIS.focusTime}</p>
        </div>
      </Card>
    </div>
  </div>
);

// 2. ログ履歴画面 (HistoryPage)
const HistoryPage = () => (
  <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
    <header className="flex-shrink-0 pt-2">
      <h2 className="text-xl font-black italic tracking-tighter text-white">HISTORY</h2>
    </header>
    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
      {MOCK_ANALYSIS.recentLogs.map(log => (
        <Card key={log.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl text-slate-400"><Target size={16} /></div>
            <div>
              <p className="text-xs font-bold text-white">{log.date} Session</p>
              <p className="text-[10px] text-slate-500">{log.duration}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-indigo-400 italic">{log.score}</p>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ログイン後の共通レイアウト
const AuthenticatedLayout = ({ children, currentPage, setCurrentPage, onLogout }) => (
  <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
    <main className="flex-1 p-5 max-w-md mx-auto w-full overflow-hidden">
      {children}
    </main>
    <nav className="flex-shrink-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-8 py-4 flex justify-between items-center z-50">
      <button onClick={() => setCurrentPage('analysis')} className={`p-2 transition-colors ${currentPage === 'analysis' ? 'text-indigo-400' : 'text-slate-600'}`}>
        <LayoutDashboard size={22} />
      </button>
      <button onClick={() => setCurrentPage('history')} className={`p-2 transition-colors ${currentPage === 'history' ? 'text-indigo-400' : 'text-slate-600'}`}>
        <History size={22} />
      </button>
      <button onClick={() => setCurrentPage('settings')} className={`p-2 transition-colors ${currentPage === 'settings' ? 'text-indigo-400' : 'text-slate-600'}`}>
        <Settings size={22} />
      </button>
      <button onClick={onLogout} className="p-2 text-slate-600 hover:text-rose-400 transition-colors">
        <LogOut size={22} />
      </button>
    </nav>
  </div>
);

// --- 認証画面 (Auth Pages) ---

const LandingPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-950">
    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4 italic">
      FocusFlow
    </h1>
    <p className="text-slate-400 text-sm max-w-xs mb-10 leading-relaxed">
      スマートフォンの「裏返し」をスイッチに、<br />深い集中状態へのルーティンを。
    </p>
    <div className="w-full max-w-xs space-y-4">
      <PrimaryButton onClick={() => onNavigate('signup')} icon={UserPlus}>
        Get Started
      </PrimaryButton>
      <button
        onClick={() => onNavigate('login')}
        className="w-full bg-transparent border border-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
      >
        Log In <LogIn size={18} />
      </button>
    </div>
  </div>
);

const SignUpPage = ({ onNavigate, onAuthSuccess }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950 overflow-hidden">
    <div className="w-full max-w-sm flex flex-col h-full max-h-[600px]">
      <button onClick={() => onNavigate('landing')} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-6 text-xs transition-colors self-start">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">CREATE ACCOUNT</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 font-bold">Deep focus starts here.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex-shrink-0">
        <InputField label="Email Address" type="email" placeholder="focus@example.com" icon={Mail} />
        <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
        <InputField label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />
        <div className="mt-4">
          <PrimaryButton onClick={onAuthSuccess}>Sign Up</PrimaryButton>
        </div>
      </div>
      <p className="text-center text-slate-500 text-xs mt-6 flex-shrink-0">
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')} className="text-indigo-400 font-bold">Log In</button>
      </p>
    </div>
  </div>
);

const LoginPage = ({ onNavigate, onAuthSuccess }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
    <div className="w-full max-w-sm">
      <button onClick={() => onNavigate('landing')} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-8 text-xs transition-colors">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter">FocusFlow</h1>
        <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mt-1 font-bold">Welcome Back</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <InputField label="Email" type="email" placeholder="your@email.com" icon={Mail} />
        <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
        <div className="text-right mb-6">
          <button onClick={() => onNavigate('reset')} className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-bold tracking-widest transition-colors">
            Forgot Password?
          </button>
        </div>
        <PrimaryButton onClick={onAuthSuccess} icon={ArrowRight}>
          Sign In
        </PrimaryButton>
      </div>
      <p className="text-center text-slate-500 text-xs mt-6">
        Don't have an account?{' '}
        <button onClick={() => onNavigate('signup')} className="text-indigo-400 font-bold">Sign Up</button>
      </p>
    </div>
  </div>
);

const ResetPasswordPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
    <div className="w-full max-w-sm text-center">
      <div className="mb-8">
        <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Reset Password</h2>
        <p className="text-slate-500 text-xs mt-2 leading-relaxed">
          ご登録のメールアドレスを入力してください。<br />再設定用の手順をお送りします。
        </p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
        <InputField label="Email Address" type="email" placeholder="your@email.com" icon={Mail} />
        <div className="mt-6">
          <PrimaryButton onClick={() => console.log('Reset Action')}>Send Instructions</PrimaryButton>
        </div>
      </div>
      <button onClick={() => onNavigate('login')} className="mt-8 text-slate-500 hover:text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors">
        Back to Log In
      </button>
    </div>
  </div>
);

// --- メインアプリケーション管理 (Main App Controller) ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 認証成功時の処理
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('analysis');
  };

  // ログアウト時の処理
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  // 画面レンダリング
  if (!isAuthenticated) {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={setCurrentPage} />;
      case 'signup': return <SignUpPage onNavigate={setCurrentPage} onAuthSuccess={handleAuthSuccess} />;
      case 'login': return <LoginPage onNavigate={setCurrentPage} onAuthSuccess={handleAuthSuccess} />;
      case 'reset': return <ResetPasswordPage onNavigate={setCurrentPage} />;
      default: return <LandingPage onNavigate={setCurrentPage} />;
    }
  }

  return (
    <AuthenticatedLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onLogout={handleLogout}
    >
      {currentPage === 'analysis' && <AnalysisPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'settings' && (
        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
          <div className="p-4 rounded-full bg-slate-900 border border-slate-800 animate-pulse">
            <Settings size={40} className="animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/50">Service Settings Coming Soon</p>
        </div>
      )}
    </AuthenticatedLayout>
  );
}