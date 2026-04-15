import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';

/**
 * 新規アカウント作成ページ
 */
const SignUpPage = ({ onNavigate, onAuthSuccess }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <button 
          onClick={() => onNavigate('landing')} 
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-6 text-xs transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="text-center mb-6 text-white uppercase italic font-black tracking-tighter text-2xl">
          Create Account
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
          <InputField label="Email Address" type="email" placeholder="focus@example.com" icon={Mail} />
          <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
          <InputField label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />

          <div 
            className="mt-4 mb-6 flex items-start gap-3 cursor-pointer select-none" 
            onClick={() => setAgreed(!agreed)}
          >
            <div className={`mt-0.5 flex-shrink-0 ${agreed ? 'text-indigo-400' : 'text-slate-600'}`}>
              {agreed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('terms'); }} 
                className="text-indigo-400 font-bold underline"
              >
                利用規約
              </button>
              {' '}と{' '}
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('privacy'); }} 
                className="text-indigo-400 font-bold underline"
              >
                プライバシーポリシー
              </button>
              に同意します。
            </p>
          </div>

          <PrimaryButton onClick={onAuthSuccess} disabled={!agreed}>
            Sign Up
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;