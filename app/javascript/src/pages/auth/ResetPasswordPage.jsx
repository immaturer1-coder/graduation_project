import React from 'react';
import { Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';

/**
 * パスワード再設定ページ
 */
const ResetPasswordPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            Reset Password
          </h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            ご登録のメールアドレスを入力してください。<br />再設定用の手順をお送りします。
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
          <InputField label="Email Address" type="email" placeholder="your@email.com" icon={Mail} />
          <div className="mt-6">
            <PrimaryButton onClick={() => console.log('Reset Action')}>
              Send Instructions
            </PrimaryButton>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('login')} 
          className="mt-8 text-slate-500 hover:text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 w-full"
        >
          <ArrowLeft size={14} /> Back to Log In
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;