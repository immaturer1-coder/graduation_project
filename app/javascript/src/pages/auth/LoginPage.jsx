import React from 'react';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';

/**
 * ログインページ
 */
const LoginPage = ({ onNavigate, onAuthSuccess }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <button 
          onClick={() => onNavigate('landing')} 
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-8 text-xs"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter">
            FocusFlow
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mt-1 font-bold">
            Welcome Back
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <InputField label="Email" type="email" placeholder="your@email.com" icon={Mail} />
          <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} />
          
          <div className="text-right mb-6">
            <button 
              onClick={() => onNavigate('reset')} 
              className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-bold tracking-widest"
            >
              Forgot Password?
            </button>
          </div>

          <PrimaryButton onClick={onAuthSuccess} icon={ArrowRight}>
            Sign In
          </PrimaryButton>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          Don't have an account?{' '}
          <button 
            onClick={() => onNavigate('signup')} 
            className="text-indigo-400 font-bold hover:underline transition-all"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;