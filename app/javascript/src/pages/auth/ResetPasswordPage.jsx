import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';

/**
 * パスワード再設定ページ
 */
const ResetPasswordPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  
  // 状態管理
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  // 送信ハンドラー
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setError(t('error_email_required'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 擬似的なAPI通信のシミュレーション（2秒）
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log('Reset request for:', email);
      setIsSent(true);
    } catch (err) {
      // エラー時も多言語化対応のキーを使用
      setError(t('error_something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // 送信完了画面
  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950 animate-in fade-in duration-500">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              {t('sent_success_title')}
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              {/* i18nextの補完機能があれば {email} を渡せますが、シンプルに表示 */}
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm text-center">
        {/* ヘッダー部分 */}
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

        {/* フォームカード */}
        <form 
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left"
        >
          <InputField 
            label={t('email_address')} 
            type="email" 
            placeholder={t('placeholder_email')} 
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-red-400 text-[10px] font-bold uppercase mt-2 ml-1">
              {error}
            </p>
          )}

          <div className="mt-6">
            <PrimaryButton 
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {t('sending')}
                </div>
              ) : (
                t('send_instructions')
              )}
            </PrimaryButton>
          </div>
        </form>

        {/* 下部ナビゲーション */}
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