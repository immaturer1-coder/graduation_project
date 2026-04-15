import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

// --- 共通コンポーネント (Common Components) ---

const InputField = ({ label, type, placeholder, icon: Icon }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
        <Icon size={16} />
      </div>
      <input
        type={type}
        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const PrimaryButton = ({ children, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
  >
    {children}
    {Icon && <Icon size={18} />}
  </button>
);

// --- 各画面コンポーネント (Pages) ---

// LP: ランディングページ
const LandingPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-950">
    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">
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

// 新規登録画面
const SignUpPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
    <div className="w-full max-w-sm">
      <button onClick={() => onNavigate('landing')} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-8 text-sm transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white">Create Account</h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Deep focus starts here.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <InputField label="Email Address" type="email" placeholder="focus@example.com" icon={Mail} />
        <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
        <InputField label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />
        <div className="mt-6">
          <PrimaryButton onClick={() => console.log('Sign Up Action')}>Sign Up</PrimaryButton>
        </div>
      </div>
      <p className="text-center text-slate-500 text-xs mt-6">
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')} className="text-indigo-400 font-bold">Log In</button>
      </p>
    </div>
  </div>
);

// ログイン画面
const LoginPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
    <div className="w-full max-w-sm">
      <button onClick={() => onNavigate('landing')} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-8 text-sm transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">FocusFlow</h1>
        <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mt-1">Welcome Back</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <InputField label="Email" type="email" placeholder="your@email.com" icon={Mail} />
        <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
        <div className="text-right mb-6">
          <button onClick={() => onNavigate('reset')} className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-bold tracking-widest transition-colors">
            Forgot Password?
          </button>
        </div>
        <PrimaryButton onClick={() => console.log('Login Action')} icon={ArrowRight}>
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

// パスワード再設定画面
const ResetPasswordPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
    <div className="w-full max-w-sm text-center">
      <div className="mb-8">
        <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-white">Reset Password</h2>
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

  // 擬似ルーティング
  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={setCurrentPage} />;
      case 'signup': return <SignUpPage onNavigate={setCurrentPage} />;
      case 'login': return <LoginPage onNavigate={setCurrentPage} />;
      case 'reset': return <ResetPasswordPage onNavigate={setCurrentPage} />;
      default: return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30">
      {renderPage()}
    </div>
  );
}