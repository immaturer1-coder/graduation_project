import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  Timer, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// コンポーネント
import PrimaryButton from '../../components/ui/PrimaryButton';
import DrumRoll from '../../components/ui/DrumRoll';
import ReflectionForm from '../../components/ui/ReflectionForm';
import FocusDetectionEngine from '../../components/ui/FocusDetectionEngine';

// フック・ロジック
import { useConcentrationLogic } from '../../hooks/useConcentrationLogic';
import { useSensorLogger } from '../../hooks/useSensorLogger';

/**
 * 集中タイマーの表示レイヤー
 */
const ConcentrationTimer = ({ onComplete }) => {
  const { t } = useTranslation();
  
  // センサーログの取得のみを専門フックに委譲
  const { getLatestLogs } = useSensorLogger();

  // ロジックの集約
  const {
    phase, setPhase,
    selectedMode, setSelectedMode,
    time, setTime,
    isWarning,
    isTimeUp,
    showReflection,
    handleFlip,
    handleReflectionSubmit,
    pendingResult
  } = useConcentrationLogic(onComplete, getLatestLogs);

  // クイック選択のオプション
  const quickOptions = [
    { label: '15', value: 15 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];

  /**
   * クイック選択時のハンドラ
   * ドラムロールのステート(h, m, s)を直接上書きして同期させる
   */
  const handleQuickSelect = (minutes) => {
    // 確実に新しいオブジェクトとしてセットし、秒もリセットする
    setTime({
      h: 0,
      m: minutes,
      s: 0
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-100 p-6 bg-slate-950">
      
      {/* 1. モード選択 */}
      {phase === 'mode_select' && (
        <div className="w-full max-w-xs space-y-4 animate-in fade-in">
          <div className="text-center mb-6">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">Routine</h2>
            <p className="text-white font-bold text-lg italic">{t('select_mode')}</p>
          </div>
          <ModeButton 
            onClick={() => { setSelectedMode('timer'); setPhase('timer_setup'); }}
            icon={<Timer size={24} />}
            title={t('timer_mode')}
            subtitle={t('timer_mode_sub')}
            colorClass="text-indigo-400 bg-indigo-500/10"
          />
          <ModeButton 
            onClick={() => { setSelectedMode('focus'); setPhase('waiting'); }}
            icon={<Zap size={24} />}
            title={t('focus_mode')}
            subtitle={t('focus_mode_sub')}
            colorClass="text-cyan-400 bg-cyan-500/10"
          />
        </div>
      )}

      {/* 2. タイマー設定 */}
      {phase === 'timer_setup' && (
        <div className="w-full max-w-xs space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-start">
            <button onClick={() => setPhase('mode_select')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors font-bold">
              <ChevronLeft size={14} /> {t('back')}
            </button>
          </div>

          {/* A. ドラムロール (最上部) */}
          <div className="flex justify-center gap-4">
            <DrumRoll 
              list={[...Array(24).keys()]} 
              value={time.h} 
              onChange={v => setTime(p => ({ ...p, h: v, s: 0 }))} 
              label={t('hrs')} 
            />
            <div className="pt-6 text-2xl font-black text-indigo-500">:</div>
            <DrumRoll 
              list={[...Array(60).keys()]} 
              value={time.m} 
              onChange={v => setTime(p => ({ ...p, m: v, s: 0 }))} 
              label={t('min')} 
            />
          </div>

          {/* B. クイック選択チップ (中央) */}
          <div className="flex justify-between gap-2">
            {quickOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleQuickSelect(opt.value)}
                className={`flex-1 py-3 px-2 rounded-2xl bg-slate-900 border transition-all ${
                  time.m === opt.value && time.h === 0 
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50 scale-[1.02]' 
                  : 'border-slate-800 hover:border-slate-700 shadow-sm active:scale-95'
                }`}
              >
                <div className="text-sm text-slate-200 font-black">{opt.label}</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">min</div>
              </button>
            ))}
          </div>

          {/* C. 確定ボタン (最下部) */}
          <PrimaryButton onClick={() => setPhase('waiting')} icon={ArrowRight}>
            {t('start_session')}
          </PrimaryButton>
        </div>
      )}

      {/* 3. 集中・計測フェーズ */}
      {(phase === 'waiting' || phase === 'focusing') && (
        <div className="flex flex-col items-center space-y-10 animate-in fade-in">
          <FocusDetectionEngine 
            onFlipChange={handleFlip} 
            active={!showReflection} 
            isWarning={isWarning} 
          />
          {phase === 'focusing' && (
            <div className="text-center space-y-3">
              <StatusBadge isTimeUp={isTimeUp} t={t} />
              <TimeDisplay time={time} />
            </div>
          )}
        </div>
      )}

      {/* 4. 振り返り入力フォーム */}
      {showReflection && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
          <ReflectionForm
            isCompleted={pendingResult?.completed}
            totalSeconds={pendingResult?.duration}
            onSubmit={handleReflectionSubmit}
          />
        </div>
      )}
    </div>
  );
};

const ModeButton = ({ onClick, icon, title, subtitle, colorClass }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl active:scale-95 transition-all text-left">
    <div className={`p-3 rounded-2xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="font-black italic text-sm">{title}</p>
      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
    </div>
  </button>
);

const StatusBadge = ({ isTimeUp, t }) => (
  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mx-auto w-fit ${
    isTimeUp ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
  }`}>
    {isTimeUp ? <CheckCircle2 size={12} /> : <Loader2 size={12} className="animate-spin" />}
    {isTimeUp ? t('status_complete_msg') : t('status_focusing_msg')}
  </div>
);

const TimeDisplay = ({ time }) => (
  <div className="text-7xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-2xl">
    {time.h > 0 && `${time.h.toString().padStart(2, '0')}:`}
    {time.m.toString().padStart(2, '0')}:
    {time.s.toString().padStart(2, '0')}
  </div>
);

export default ConcentrationTimer;