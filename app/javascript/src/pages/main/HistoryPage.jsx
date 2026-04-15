import React from 'react';
import { Target } from 'lucide-react';

/**
 * ログ履歴画面
 */

// モックデータ
const RECENT_LOGS = [
  { id: 1, date: "03/20", duration: "50 min", score: 92 },
  { id: 2, date: "03/19", duration: "25 min", score: 65 },
  { id: 3, date: "03/18", duration: "120 min", score: 88 },
  { id: 4, date: "03/17", duration: "45 min", score: 72 },
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const HistoryPage = () => {
  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
      <header className="flex-shrink-0 pt-2">
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">History</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {RECENT_LOGS.map(log => (
          <Card key={log.id} className="flex items-center justify-between py-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                <Target size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{log.date} Session</p>
                <p className="text-[10px] text-slate-500">{log.duration}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-indigo-400 italic">{log.score}</p>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">pts</p>
            </div>
          </Card>
        ))}

        {/* 下部の余白確保 */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default HistoryPage;