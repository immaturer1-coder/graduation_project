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

    // 1. フロントエンドでの未入力チェック（日本語化対応）
    if (!email) {
      setError(t('error_email_required'));
      return;
    }
    if (!password) {
      setError(t('error_password_required'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      console.log('Login Success:', data);
      onAuthSuccess(data.data);
    } catch (err) {
      // 2. サーバーエラーのハンドリング
      // サーバーから "Invalid email or password." 等が返ってきた場合、
      // 共通の日本語メッセージに変換するか、i18nキーを使用します。
      if (err.message.includes('Invalid') || err.message.includes('password')) {
        setError(t('error_something_went_wrong')); // または専用の "ID/PWが違います" キーを作成
      } else {
        setError(t('error_something_went_wrong'));
      }
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

        {/* onSubmitでハンドルすることで、スマホの「確定/Go」ボタンにも対応。
          InputFieldのrequired属性によるブラウザ標準の英語バリデーションを防ぐため、
          手動チェックを行う場合は form に noValidate をつけるか、requiredを外してJSで制御します。
        */}
        <form onSubmit={handleLogin} noValidate className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <InputField
            label={t('email')}
            type="email"
            placeholder={t('placeholder_email')}
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          // requiredを削除するか、ブラウザ標準に任せるか選択可能
          />
          <InputField
            label={t('password')}
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold text-center animate-in fade-in zoom-in duration-200">
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
            type="submit" // onClickではなくtype="submit"を推奨
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