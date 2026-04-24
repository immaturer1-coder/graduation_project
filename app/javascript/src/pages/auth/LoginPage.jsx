import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';
import { login } from '../../api/auth';

/**
 * ログインページ
 */
const LoginPage = ({ onNavigate, onAuthSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      console.log('Login Success:', data);
      // App.jsx側の状態を更新
      onAuthSuccess(data.data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <button
          onClick={() => onNavigate('landing')}
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-8 text-xs transition-colors"
        >
          <ArrowLeft size={14} /> {t('back')}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter">
            FocusFlow
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mt-1 font-bold">
            {t('welcome_back')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <InputField 
            label={t('email')} 
            type="email" 
            placeholder={t('placeholder_email')} 
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField 
            label={t('password')} 
            type="password" 
            placeholder="••••••••" 
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold text-center">
              {error}
            </div>
          )}

          <div className="text-right mb-6">
            <button
              type="button"
              onClick={() => onNavigate('reset')}
              className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-bold tracking-widest transition-colors"
            >
              {t('forgot_password')}
            </button>
          </div>

          <PrimaryButton 
            onClick={handleLogin} 
            icon={loading ? Loader2 : ArrowRight}
            disabled={loading}
          >
            {loading ? t('signing_in') : t('sign_in')}
          </PrimaryButton>
        </form>

        <p className="text-center text-slate-500 text-xs mt-8">
          {t('dont_have_account')}{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-indigo-400 font-bold hover:underline transition-all"
          >
            {t('sign_up')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;