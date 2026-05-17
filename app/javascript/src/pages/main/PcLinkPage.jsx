import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Bell, ShieldCheck, Zap, Monitor, Info, ExternalLink, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Toast from '../../components/ui/Toast';
import { useNotification } from '../../hooks/useNotification';

/**
 * PcLinkPage: PC&スマホ連携待機画面＆通知機能バージョン
 */
const PcLinkPage = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);
  
  const { permission, requestPermission, sendNotification } = useNotification();
  const isPermissionGranted = permission === 'granted';

  useEffect(() => {
    // 簡易的なモバイル判定
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|iPad|iPhone|iPod/i.test(userAgent)) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    if (isPermissionGranted) {
      showToast(t('pc_link_ready_sync'), 'success');
    }
  }, [isPermissionGranted, t]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      // 許可されたらウェルカム通知を送信
      sendNotification(t('pc_link_ready_sync'), {
        body: t('pc_link_step_flip_desc'),
        tag: 'welcome-sync'
      });
      showToast(t('pc_link_ready_sync'), 'success');
    } else if (result === 'denied') {
      showToast('Notification is blocked. Please allow it in browser settings.', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // コピー処理
  const handleCopyUrl = () => {
    const pcUrl = "https://focusflow-73hm.onrender.com/";
    navigator.clipboard.writeText(pcUrl).then(() => {
      showToast('URLをコピーしました！', 'success');
    }).catch(err => {
      // フォールバック用の従来手法
      const textArea = document.createElement("textarea");
      textArea.value = pcUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('URLをコピーしました！', 'success');
    });
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center min-h-screen px-6 bg-slate-950 text-slate-100 select-none overflow-y-auto pb-10 font-sans">
        {/* 通常のトースト表示（コピー通知以外） */}
        {toast && toast.message !== 'URLをコピーしました！' && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="w-full max-w-md py-10 space-y-8">
          
          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
              <Info size={12} />
              {t('pc_link_guide_badge')}
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white whitespace-pre-wrap">
              {t('pc_link_title')}
            </h1>
          </div>

          {/* ガイドセクション */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 p-4 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <Monitor size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-none">{t('pc_link_step1_title')}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed break-words">
                    {t('pc_link_step1_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <Bell size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-none">{t('pc_link_step2_title')}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed break-words">
                    {t('pc_link_step2_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <Smartphone size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-none">{t('pc_link_step3_title')}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed break-words">
                    {t('pc_link_step3_desc')}
                  </p>
                </div>
              </div>
            </Card>

            {/* メリット紹介 */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Benefit</p>
                <p className="text-xs font-bold text-slate-200">{t('pc_link_benefit')}</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Zap size={16} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* URLコピーセクション */}
          <div className="pt-2 space-y-3">
            {/* コピー通知のスマホ専用インライン表示（ボタンの真上に出現させて視認性を100%確保） */}
            {toast && toast.message === 'URLをコピーしました！' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-black tracking-wider">{toast.message}</span>
                  </div>
                  <button 
                    onClick={() => setToast(null)} 
                    className="text-[10px] text-emerald-400/60 hover:text-emerald-400 font-bold uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={handleCopyUrl}
              className="w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between active:bg-indigo-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={16} className="text-indigo-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-300">{t('pc_link_copy_url')}</p>
                  <p className="text-[9px] text-slate-500 font-medium">https://focusflow-73hm.onrender.com/</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600 font-medium px-4 leading-relaxed whitespace-pre-wrap">
            {t('pc_link_footer_note')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 bg-slate-950 text-slate-100 select-none font-sans relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="w-full max-w-md flex-grow flex flex-col justify-center py-12 space-y-8 text-center">
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <Zap size={12} />
            {isPermissionGranted ? t('pc_link_ready_sync') : t('pc_link_waiting_link')}
          </div>
        </div>

        {/* 接続アニメーションセクション */}
        <div className="relative flex justify-center py-6">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full" />
          <div className="relative flex items-center gap-6">
            <div className="p-5 bg-slate-900 border border-indigo-500 rounded-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Monitor size={48} className="text-indigo-400" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className={`w-10 h-[2px] rounded-full transition-all duration-1000 ${isPermissionGranted ? 'bg-indigo-500 opacity-100' : 'bg-slate-800 opacity-30'}`} />
              <div className={`w-6 h-[2px] rounded-full transition-all duration-1000 delay-150 ${isPermissionGranted ? 'bg-indigo-500 opacity-100' : 'bg-slate-800 opacity-30'}`} />
            </div>
            <div className={`p-5 bg-slate-900 border transition-all duration-700 rounded-3xl shadow-2xl ${isPermissionGranted ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]' : 'border-slate-800 shadow-none'}`}>
              <Smartphone size={48} className={`transition-colors duration-700 ${isPermissionGranted ? 'text-indigo-400' : 'text-slate-600'}`} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tighter text-white leading-tight whitespace-pre-wrap">
            {t('pc_link_pc_main_title')}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto font-medium whitespace-pre-wrap">
            {t('pc_link_pc_main_desc')}
          </p>
        </div>

        {/* ステップ表示 */}
        <Card className="bg-slate-900/50 border-slate-800/50 text-left p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${isPermissionGranted ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
              {isPermissionGranted ? '✓' : '1'}
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{t('pc_link_step_allow_title')}</p>
              <p className="text-[11px] text-slate-500 mt-1">{t('pc_link_step_allow_desc')}</p>
            </div>
          </div>
          <div className={`flex items-start gap-4 transition-opacity duration-500 ${isPermissionGranted ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${isPermissionGranted ? 'bg-indigo-600' : 'bg-slate-700'}`}>2</div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isPermissionGranted ? 'text-white' : 'text-slate-400'}`}>{t('pc_link_step_flip_title')}</p>
              <p className={`text-[11px] mt-1 ${isPermissionGranted ? 'text-slate-400' : 'text-slate-600'}`}>{t('pc_link_step_flip_desc')}</p>
            </div>
          </div>
        </Card>

        {/* アクションボタン */}
        <div className="space-y-4 pb-8">
          {!isPermissionGranted ? (
            <div className="space-y-3">
              <PrimaryButton 
                onClick={handleRequestPermission}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 group transition-transform active:scale-95"
              >
                <Bell size={18} className="group-hover:animate-bounce" />
                {t('pc_link_btn_allow')}
              </PrimaryButton>
              {permission === 'denied' && (
                <p className="text-[10px] text-red-400 font-bold">
                  Notification is blocked. Please allow it in browser settings.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 py-4 rounded-xl border border-emerald-500/20">
                <ShieldCheck size={20} />
                {t('pc_link_ready_status')}
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">
                  {t('pc_link_waiting_flip')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PcLinkPage;