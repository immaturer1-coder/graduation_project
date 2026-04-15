import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PRIVACY_TEXT } from '../../utils/constants';

/**
 * プライバシーポリシー表示ページ
 */
const PrivacyPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 固定ヘッダー */}
      <header className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <button 
          onClick={() => onNavigate('signup')} 
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black tracking-widest uppercase italic">Privacy Policy</h1>
        <div className="w-10"></div>
      </header>

      {/* スクロール可能なコンテンツエリア */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6 text-cyan-500">
            <ShieldCheck size={48} strokeWidth={1.5} />
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-sans">
              {PRIVACY_TEXT}
            </pre>
          </div>

          <p className="text-center text-[10px] text-slate-500 mt-8 mb-4 uppercase tracking-[0.2em]">
            FocusFlow Data Protection
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;