import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';
import Toast from '../../components/ui/Toast';

/**
 * パスワード再設定ページ
 */
const ResetPasswordPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [toast, setToast] = useState(null);

  // 送信ハンドラー
  const handleRequest = async () => {
    if (!email) {
      setToast({ message: t('error_email_required'), type: 'error' });
      return;
    }

    setIsLoading(true);
    setToast(null);

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = metaTag ? metaTag.content : '';
    
    try {
      const response = await fetch('/users/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ user: { email } }),
      });

      if (response.ok) {
        setIsSent(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setToast({ message: data.errors?.[0] || t('error_something_went_wrong'), type: 'error' });
      }
    } catch (err) {
      setToast({ message: t('error_something_went_wrong'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center fixed inset-0 p-6 bg-slate-950 select-none touch-none animate-in fade-in duration-500">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              {t('sent_success_title')}
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              {t('sent_success_description').replace('{email}', email)}
            </p>
          </div>
          <PrimaryButton onClick={() => onNavigate('login')}>
            {t('back_to_login')}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center fixed inset-0 p-6 bg-slate-950 select-none touch-none">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {t('reset_password_title')}
          </h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            {t('reset_password_description')}
          </p>
        </div>

        {/* フォームタグ */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
          <InputField 
            label={t('email_address')} 
            type="email" 
            placeholder={t('placeholder_email')} 
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="mt-6">
            <PrimaryButton 
              onClick={handleRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {t('sending')}
                </div>
              ) : (
                t('send_instructions')
              )}
            </PrimaryButton>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('login')} 
          disabled={isLoading}
          className="mt-8 text-slate-500 hover:text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 w-full disabled:opacity-30"
        >
          <ArrowLeft size={14} /> {t('back_to_login')}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;