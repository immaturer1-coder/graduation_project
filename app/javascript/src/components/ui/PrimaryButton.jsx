import React from 'react';

/**
 * Path: app/javascript/src/components/ui/PrimaryButton.jsx
 * FocusFlow専用のプライマリアクションボタン
 */
const PrimaryButton = ({ children, onClick, icon: Icon, disabled = false, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg
        ${disabled
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95'
        }
        ${className}
      `}
    >
      {children}
      {Icon && <Icon size={18} />}
    </button>
  );
};

export default PrimaryButton;