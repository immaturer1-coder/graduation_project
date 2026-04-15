import React from 'react';
import { UserPlus, LogIn } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';

/**
 * アプリのランディングページ
 */
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-950">
      <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4 italic leading-tight">
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
          className="w-full bg-transparent border border-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 text-sm transition-all"
        >
          Log In <LogIn size={18} />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;