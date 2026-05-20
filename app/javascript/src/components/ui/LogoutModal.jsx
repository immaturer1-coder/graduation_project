import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';

/**
 * ログアウトモーダル
 */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleConfirm = async () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.content : '';
    
    try {
      await onConfirm(token);
    } catch (e) {
      console.error("Logout process error, forcing refresh", e);
    } finally {
      window.location.href = '/users/sign_in';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-[340px] shadow-2xl">
        {/* ヘッダーアイコン */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-500/10 rounded-full">
            <HelpCircle className="w-12 h-12 text-indigo-400" />
          </div>
        </div>
        
        {/* テキスト */}
        <h3 className="text-2xl font-black text-white text-center mb-3 tracking-tight">
          {t('logout_title')}
        </h3>
        <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
          {t('logout_message')}
        </p>
        
        {/* ボタン */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleConfirm} 
            className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all active:scale-[0.97] shadow-lg shadow-red-900/20"
          >
            {t('logout_confirm')}
          </button>
          <button 
            onClick={onClose} 
            className="w-full py-4 rounded-xl font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-[0.97]"
          >
            {t('logout_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;