import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowLeft, CheckCircle2, Circle, User, Loader2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';
import { signUp } from '../../api/auth';

/**
 * Sign Up Page
 * 規約同意部分の語順を言語設定に合わせて調整しました。
 */
const SignUpPage = ({ onNavigate, onAuthSuccess }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 現在の言語が日本語かどうかを判定
  const isJapanese = i18n.language && i18n.language.startsWith('ja');

  /**
   * どんな形式のエラーが来ても、絶対にクラッシュさせず文字列を返す関数
   */
  const formatErrorMessage = (msg) => {
    if (!msg) return t('error_unknown', 'An unknown error occurred.');
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) {
      return msg.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(', ');
    }
    if (typeof msg === 'object') {
      try {
        return Object.entries(msg)
          .map(([field, content]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            const detail = Array.isArray(content) ? content.join(', ') : String(content);
            return `${fieldName}: ${detail}`;
          })
          .join('\n');
      } catch (e) {
        return JSON.stringify(msg);
      }
    }
    return String(msg);
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!agreed) {
      setError(t('error_agree_terms', 'You must agree to the Terms and Privacy Policy.'));
      return;
    }
    if (password !== passwordConfirmation) {
      setError(t('error_password_mismatch', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await signUp(username, email, password, passwordConfirmation);
      onAuthSuccess(data.user || data.data);
    } catch (err) {
      setError(formatErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <button
          onClick={() => onNavigate('landing')}
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-6 text-xs transition-colors"
        >
          <ArrowLeft size={14} /> {t('back')}
        </button>

        <div className="text-center mb-6 text-white uppercase italic font-black tracking-tighter text-2xl">
          {t('create_account')}
        </div>

        <form onSubmit={handleSignUp} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
          <InputField 
            label={t('user_name')} 
            type="text" 
            placeholder={t('placeholder_user')} 
            icon={User} 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
          <InputField 
            label={t('confirm_password')} 
            type="password" 
            placeholder="••••••••" 
            icon={Lock} 
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          {error && (
            <div className="mt-2 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold text-center whitespace-pre-wrap leading-relaxed">
              {error}
            </div>
          )}

          <div
            className="mt-4 mb-6 flex items-start gap-3 cursor-pointer select-none"
            onClick={() => setAgreed(!agreed)}
          >
            <div className={`mt-0.5 flex-shrink-0 ${agreed ? 'text-indigo-400' : 'text-slate-600'}`}>
              {agreed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              {/* 英語の時のみ文頭に "I agree to the" を置く */}
              {!isJapanese && <>{t('i_agree_to')}{' '}</>}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigate('terms'); }}
                className="text-indigo-400 font-bold underline"
              >
                {t('terms_of_service')}
              </button>

              {' '}{t('and')}{' '}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigate('privacy'); }}
                className="text-indigo-400 font-bold underline"
              >
                {t('privacy_policy')}
              </button>

              {/* 日本語の時のみ文末に "に同意します" を置く */}
              {isJapanese ? <>{t('i_agree_to')}</> : '.'}
            </div>
          </div>

          <PrimaryButton 
            onClick={handleSignUp} 
            disabled={!agreed || loading}
            icon={loading ? Loader2 : null}
          >
            {loading ? (t('creating_account', 'Creating Account...')) : t('sign_up')}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;