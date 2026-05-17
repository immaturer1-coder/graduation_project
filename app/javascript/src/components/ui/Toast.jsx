import React, { useEffect, useState } from 'react';

/**
 * PC環境向けのトースト通知コンポーネント。
 */
const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // スムーズなアニメーション展開のためのディレイ
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // 自動非表示タイマー
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [message, type, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // フェードアウト完了後に親のアンマウント処理をトリガー
  };

  // 通知タイプごとのアイコン定義
  const icons = {
    success: (
      <svg className="text-emerald-400 w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="text-rose-400 w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="text-indigo-400 w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="text-amber-400 w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  // 通知タイプごとのカラー・スタイル定義（Glow効果調整済み）
  const config = {
    success: {
      border: 'border-emerald-400/80',
      bg: 'bg-slate-800/98 bg-gradient-to-r from-emerald-500/10 to-transparent',
      accent: 'bg-emerald-400',
      glow: 'shadow-[0_0_35px_rgba(16,185,129,0.35)]'
    },
    error: {
      border: 'border-rose-400/80',
      bg: 'bg-slate-800/98 bg-gradient-to-r from-rose-500/10 to-transparent',
      accent: 'bg-rose-500',
      glow: 'shadow-[0_0_35px_rgba(244,63,94,0.35)]'
    },
    info: {
      border: 'border-indigo-400/80',
      bg: 'bg-slate-800/98 bg-gradient-to-r from-indigo-500/10 to-transparent',
      accent: 'bg-indigo-400',
      glow: 'shadow-[0_0_35px_rgba(99,102,241,0.35)]'
    },
    warning: {
      border: 'border-amber-400/80',
      bg: 'bg-slate-800/98 bg-gradient-to-r from-amber-500/10 to-transparent',
      accent: 'bg-amber-400',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.35)]'
    }
  };

  const style = config[type] || config.info;
  const currentIcon = icons[type] || icons.info;

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-4 min-w-[320px] max-w-sm
        rounded-2xl border-2 ${style.border} ${style.bg} ${style.glow}
        backdrop-blur-2xl
        transition-all duration-300 ease-out transform
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
      `}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      {/* アクセント用サイドバー */}
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full ${style.accent}`} />
      
      {/* 左側アイコン */}
      <div className="shrink-0">
        {currentIcon}
      </div>

      {/* メッセージ本文 */}
      <div className="flex-grow">
        <p className="text-sm font-black text-white leading-snug text-left">
          {message}
        </p>
      </div>

      {/* 閉じるボタン */}
      <button
        onClick={handleClose}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;