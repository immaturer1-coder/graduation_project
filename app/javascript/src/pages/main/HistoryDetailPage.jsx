import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Clock, 
  Calendar, 
  Zap,
  Brain,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

import FocusChart from '../../components/FocusChart';

/**
 * HistoryDetailPage - 集中セッションの詳細分析画面
 */
const HistoryDetailPage = ({ record, onBack }) => {
  const { t, i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!record) return;
    // グラフの描画タイミングを調整
    const timer = setTimeout(() => {
      setReady(true);
    }, 150) ;
    return () => {
      clearTimeout(timer);
      setReady(false);
    };
  }, [record?.id]);

  // 1. モーションログの取得とパース
  const stableLogs = useMemo(() => {
    if (!record) return [];
    const detail = record.focus_record_details?.[0];
    const raw = detail?.motion_logs || record.motion_logs || record.logs; 
    
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error("Log parse error:", e);
      return [];
    }
  }, [record]);

  if (!record) return null;

  // 2. 評価絵文字
  const evalEmoji = useMemo(() => {
    const val = Number(record.evaluation);
    const mapping = { 1: "😫", 2: "😕", 3: "😐", 4: "😊", 5: "🤩" };
    return mapping[val] || "😐";
  }, [record.evaluation]);

  // 3. ステータスと中断理由
  const statusInfo = useMemo(() => {
    const reasonKey = record.stop_reason || record.reason;

    if (reasonKey === 'completed' || reasonKey === 'session_completed') {
      return { label: t('session_completed'), color: "text-emerald-400" };
    }
    
    const translatedReason = t(reasonKey, { defaultValue: t('interrupted') });
    return { label: `${t('interrupted')} (${translatedReason})`, color: "text-rose-400" };
  }, [record.stop_reason, record.reason, t]);

  const startDate = new Date(record.started_at || record.created_at);
  const mode = record.mode || 'timer';
  
  // モードラベルの出し分け (タイマー / 集中)
  const modeLabel = mode === 'timer' ? t('detail_timer_label') : t('detail_focus_label');
  const modeColor = mode === 'timer' ? 'bg-indigo-500' : 'bg-cyan-500';

  const locale = i18n.language.startsWith('ja') ? 'ja-JP' : 'en-US';

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden animate-in fade-in duration-300 font-sans">
      {/* ヘッダー */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/50 backdrop-blur-md z-10">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 p-1 active:opacity-50 transition-opacity">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('back')}</span>
        </button>
        <h1 className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-400">{t('focus_report_header')}</h1>
        <div className="w-10"></div>
      </header>

      {/* メイン */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar">
        
        {/* 曲線グラフセクション */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-3 flex flex-col shrink-0 h-52 shadow-inner">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={12} fill="currentColor" /> {t('focus_stability')}
            </p>
          </div>
          <div className="flex-1 w-full min-h-0 relative overflow-hidden">
            {ready && stableLogs.length > 0 ? (
              <div className="absolute inset-0 pt-2 pb-1">
                <FocusChart logs={stableLogs} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center italic text-[10px] text-slate-600">
                {ready ? t('no_motion_data') : t('generating_chart')}
              </div>
            )}
          </div>
        </div>

        {/* 基本ステータスカード */}
        <div className="bg-slate-900 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 shrink-0 relative overflow-hidden shadow-xl">
          <div className={`absolute top-0 left-0 w-1.5 h-full ${modeColor}`}></div>
          <div className="text-5xl flex-shrink-0 drop-shadow-md">{evalEmoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white border border-white/10 ${modeColor}`}>
                {modeLabel}
              </span>
              <span className={`text-[10px] font-black tracking-tighter uppercase ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white italic leading-none tabular-nums">
                {record.focus_level || 0}
              </span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('score')}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end shrink-0 gap-1 pl-3 border-l border-slate-800/50">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
              <Calendar size={12} className="text-slate-600" />
              <span className="text-[10px] tabular-nums">{startDate.toLocaleDateString(locale)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock size={12} className="text-slate-600" />
              <span className="text-[9px] tabular-nums">
                {startDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} • {record.duration_minutes?.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>

        {/* AI レポート */}
        {(record.hints?.[0]?.analysis_report) ? (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 text-indigo-400">
              <Brain size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{t('ai_analysis')}</h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {record.hints[0].analysis_report}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl p-4 flex items-center gap-3 shrink-0">
            <AlertCircle size={14} className="text-slate-600" />
            <p className="text-[10px] text-slate-500 italic">{t('no_analysis_data')}</p>
          </div>
        )}

        {/* ユーザー振り返りメモ */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex flex-col gap-2 shrink-0 mb-4">
          <div className="flex items-center gap-2 text-slate-500">
            <MessageSquare size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">{t('user_reflection')}</h3>
          </div>
          <p className="text-[11px] text-slate-300 italic leading-relaxed bg-slate-950/30 p-3 rounded-xl min-h-[4em] whitespace-pre-wrap border border-slate-800/30 shadow-inner">
            {record.note || record.reflection_note || t('no_reflection')}
          </p>
        </div>

        <div className="h-12 shrink-0"></div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;