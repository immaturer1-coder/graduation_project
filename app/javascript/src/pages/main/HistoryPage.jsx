import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Target, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import HistoryDetailPage from './HistoryDetailPage';

/**
 * 共有カードコンポーネント
 */
const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 ${className}`}
  >
    {children}
  </div>
);

/**
 * メインコンポーネント: HistoryPage
 */
const HistoryPage = () => {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // 言語に応じたロケール設定
  const locale = i18n.language.startsWith('ja') ? 'ja-JP' : 'en-US';

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/focus_records');
        const data = await response.json();
        // 新しい順にソート
        setLogs(Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : []);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // 詳細表示が選択されている場合は詳細コンポーネントを返す
  if (selectedLog) {
    return <HistoryDetailPage record={selectedLog} onBack={() => setSelectedLog(null)} />;
  }

  /**
   * 日時を指定のフォーマット (MM/DD HH:mm) に変換
   */
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24時間表記
    });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden p-4">
      <header className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">
          {t('history_title')}
        </h2>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse text-[10px] font-black uppercase tracking-widest">
          {t('loading_logs')}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
          <Target size={40} className="mb-3 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest">
            {t('no_sessions')}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {logs.map(log => (
            <Card 
              key={log.id} 
              className="flex items-center justify-between py-4 hover:bg-slate-800/50 transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-center gap-4">
                {/* モードに応じたアイコン表示 */}
                <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400 border border-slate-700/50 shadow-inner">
                  {log.mode === 'timer' ? <Clock size={18} /> : <Target size={18} />}
                </div>
                <div>
                  {/* 「MM/DD HH:mm」形式で開始時刻を表示。 */}
                  <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">
                    {formatDateTime(log.started_at || log.created_at)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                    <span>{log.duration_minutes ? Math.floor(log.duration_minutes) : 0} {t('min')}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className={log.mode === 'timer' ? 'text-blue-500/80' : 'text-purple-500/80'}>
                      {log.mode === 'timer' ? t('timer_mode') : t('focus_mode')}
                    </span>
                  </p>
                </div>
              </div>

              {/* スコア(PTS)を表示 */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-black text-indigo-400 italic leading-none">{log.focus_level || 0}</p>
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">pts</p>
                </div>
                <ChevronRight size={14} className="text-slate-700" />
              </div>
            </Card>
          ))}
          <div className="h-20"></div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;