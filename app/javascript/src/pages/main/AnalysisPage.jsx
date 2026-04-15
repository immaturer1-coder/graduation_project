import React from 'react';
import { BarChart2, MessageSquare, Zap, Clock } from 'lucide-react';

/**
 * 分析詳細画面
 */

// モックデータ
const MOCK_ANALYSIS = {
  score: 85,
  focusTime: "120 min",
  aiMessage: "中盤の40分間は深いフロー状態でした。休憩を少し長めに取るとさらに効率が上がります。",
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const AnalysisPage = () => {
  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex-shrink-0 pt-2">
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Analysis</h2>
      </header>

      {/* 曲線グラフ・プレースホルダー */}
      <Card className="flex-1 min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 border-dashed border-indigo-500/30 bg-indigo-500/5">
        <div className="relative w-full h-full flex items-center justify-center">
          <BarChart2 size={32} className="text-indigo-400 opacity-30 absolute" />
          <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-[0.2em] z-10">
            Focus Flow Graph (Coming Soon)
          </p>
        </div>
      </Card>

      {/* AIフィードバック */}
      <Card className="flex-shrink-0 bg-indigo-500/10 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <div className="flex items-start gap-3">
          <MessageSquare size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Advisor</p>
            <p className="text-xs text-slate-300 leading-snug">
              {MOCK_ANALYSIS.aiMessage}
            </p>
          </div>
        </div>
      </Card>

      {/* 統計カード */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3 pb-2">
        <Card className="flex items-center gap-3 py-3 hover:border-amber-500/30 transition-colors">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Zap size={18} /></div>
          <div>
            <p className="text-[8px] text-slate-500 font-bold uppercase">Score</p>
            <p className="text-xl font-black text-white italic leading-none">{MOCK_ANALYSIS.score}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-3 hover:border-blue-500/30 transition-colors">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={18} /></div>
          <div>
            <p className="text-[8px] text-slate-500 font-bold uppercase">Focus Time</p>
            <p className="text-xl font-black text-white italic leading-none">{MOCK_ANALYSIS.focusTime}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisPage;