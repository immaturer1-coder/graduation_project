import React from 'react';

/**
 * Path: app/javascript/src/components/ui/Card.jsx
 * コンテンツセクション用の汎用カードコンポーネント
 */
const Card = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 transition-all 
        ${onClick ? 'hover:bg-slate-800/80 cursor-pointer active:scale-[0.98]' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;