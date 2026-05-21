import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  Timer, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2,
  ArrowRight,
  Monitor
} from 'lucide-react';

// コンポーネント
import PrimaryButton from '../../components/ui/PrimaryButton';
import DrumRoll from '../../components/ui/DrumRoll';
import ReflectionForm from '../../components/ui/ReflectionForm';
import FocusDetectionEngine from '../../components/ui/FocusDetectionEngine';

// ActionCable接続ヘルパー
import { getConsumer } from '../../utils/cable';

// フック・ロジック
import { useConcentrationLogic } from '../../hooks/useConcentrationLogic';
import { useSensorLogger } from '../../hooks/useSensorLogger';
import { getAuthUserId } from '../../api/auth';

/**
 * 集中タイマーの表示レイヤー（リアルタイムPC同期送信 ＆ 表示時間完全同期対応）
 */
const ConcentrationTimer = ({ onComplete }) => {
  const { t } = useTranslation();
  
  // ロジックの集約
  const logic = useConcentrationLogic(onComplete);

  // PCとの連携状態を管理するState
  const [isPcLinked, setIsPcLinked] = useState(false);

  // WebSocket チャネル購読インスタンスを管理するRef
  const channelRef = useRef(null);

  // 繰り返し通知を行うため、最後に通知を発火したインターバル回数を追跡するRef
  const lastTriggeredMilestoneIntervalRef = useRef(0); // 30分（1800秒）の何回目の倍数か
  const lastTriggeredBreakIntervalRef = useRef(0);     // 45分（2700秒）の何回目の倍数か

  // --- PC同期の送信状態を正しく追跡・ロックするためのエッジトリガー用Ref ---
  const lastBroadcastedActiveRef = useRef(false);
  
  // セッション内で「すでに開始通知を行ったか（再開かどうか）」を管理するRef（バグ防止）
  const isResumeRef = useRef(false);

  // 同一セッション内で「セッション完了通知(completed)」の多重送信を防ぐロックRef
  const hasSentCompletedRef = useRef(false);

  // logicが取得できるまでのガード
  if (!logic) return null;

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
  } = logic;

  // 1. センサーログ of focus (focusingフェーズの間のみアクティブ)
  const { getLatestLogs } = useSensorLogger(phase === 'focusing'); 

  // --- PC同期のステートマシン同期ロジック ---
  // 現在PC側を「Focus Active（暗転）」にすべき状態かを厳密に判定
  const isFocusActive = phase === 'focusing' && !isWarning && !showReflection;

  // --- ActionCable通信の購読ライフサイクル管理 ---
  useEffect(() => {
    const consumer = getConsumer();
    if (consumer) {
      // ログインユーザーIDを取得
      const authUserId = getAuthUserId(); 

      // Railsの FocusSessionChannel をユーザー固有IDを付与して購読
      channelRef.current = consumer.subscriptions.create(
        { channel: 'FocusSessionChannel', user_id: authUserId },
        {
          connected() {
            // キャッシュが更新されたか確認するための目印を追加しました
            console.log('[WebSocket] Connected to FocusSessionChannel (Latest Build)');
          },
          disconnected() {
            console.log('[WebSocket] Disconnected from FocusSessionChannel');
            setIsPcLinked(false);
          },
          received(data) {
            // 受信したデータを全てコンソールに出力するデバッグログ
            console.log("WebSocketメッセージ受信:", data);

            // ここで 'sync_status' を受け取ってステートを更新する
            if (data.event === 'sync_status') {
              console.log("切り替え実行: isPcLinked を", data.payload.is_linked && data.payload.pc_ready, "に変更します");
              // 連携が確立しており、かつPC側も準備完了(pc_ready)している場合のみ「連携中」にする
              setIsPcLinked(data.payload.is_linked && data.payload.pc_ready);
            }
          }
        }
      );
    }

    // クリーンアップ時（アンマウント）に安全に接続を解除
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        console.log('[WebSocket] Unsubscribed from FocusSessionChannel');
      }
    };
  }, []);

  // 経過時間の閾値を監視してPCへ30分毎・45分毎にシグナルを送信する
  useEffect(() => {
    // 連携チャネルがない、または無制限集中モード(focus)ではない、または画面が一時停止(警告中など)の場合は何もしない
    if (!channelRef.current || selectedMode !== 'focus' || !isFocusActive) return;

    const seconds = time?.s || 0;
    const minutes = time?.m || 0;
    const hours = time?.h || 0;

    // 分・秒を秒数に換算（表示上の経過秒数）
    const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;

    // ①【時間経過通知】30分 (1800秒) 毎に表示
    const milestoneInterval = 1800; // 30分 = 1800秒
    const currentMilestoneInterval = Math.floor(elapsedSeconds / milestoneInterval);
    
    if (currentMilestoneInterval > 0 && currentMilestoneInterval > lastTriggeredMilestoneIntervalRef.current) {
      lastTriggeredMilestoneIntervalRef.current = currentMilestoneInterval;
      console.log(`[WebSocket] Sending milestone trigger (Interval: ${currentMilestoneInterval}, Elapsed: ${elapsedSeconds}s)`);
      channelRef.current.perform('trigger_milestone', {
        elapsed_seconds: elapsedSeconds
      });
    }

    // ②【休憩レコメンド通知】45分 (2700秒) 毎に表示
    const breakInterval = 2700; // 45分 = 2700秒
    const currentBreakInterval = Math.floor(elapsedSeconds / breakInterval);
    
    if (currentBreakInterval > 0 && currentBreakInterval > lastTriggeredBreakIntervalRef.current) {
      lastTriggeredBreakIntervalRef.current = currentBreakInterval;
      console.log(`[WebSocket] Sending break recommend trigger (Interval: ${currentBreakInterval}, Elapsed: ${elapsedSeconds}s)`);
      channelRef.current.perform('trigger_break_recommend', {
        elapsed_seconds: elapsedSeconds
      });
    }
  }, [time, selectedMode, isFocusActive]); 

  // --- セッション全体のリセット制御 ---
  useEffect(() => {
    // モード選択画面に戻った時、または新しくセッションを開始する待機状態になった時
    if (phase === 'mode_select' || phase === 'waiting' || showReflection) {
      console.log('[WebSocket] Resetting session states. isResumeRef -> false, trigger interval counters -> 0');
      isResumeRef.current = false;
      lastTriggeredMilestoneIntervalRef.current = 0;
      lastTriggeredBreakIntervalRef.current = 0;
    }
  }, [phase, showReflection]);

  // ① 集中状態の物理反転・一時中断を監視してPC画面 of status を切り替える副作用
  useEffect(() => {
    if (!channelRef.current) return;

    if (isFocusActive && !lastBroadcastedActiveRef.current) {
      // 【スマホを伏せた瞬間】: 集中モード開始（または一時停止からの再開）
      console.log(`[WebSocket] Transition Inactive -> Active. is_resume: ${isResumeRef.current}`);
      channelRef.current.perform('start_focus', {
        mode: selectedMode,
        time_setting: time,
        is_resume: isResumeRef.current
      });
      lastBroadcastedActiveRef.current = true;
      isResumeRef.current = true; // 初回送信以降は再開状態とみなします
      hasSentCompletedRef.current = false; // 新たに集中が始まったら、完了通知ロックを解除します

    } else if (!isFocusActive && lastBroadcastedActiveRef.current) {
      // 【スマホを表に向けた瞬間】: 3秒ルールのカウントダウン警告が開始された状態
      console.log('[WebSocket] Transition Active -> Inactive (Suspended/3-Second Warning started)');
      channelRef.current.perform('end_focus', {
        stop_reason: 'interrupted'
      });
      lastBroadcastedActiveRef.current = false;
    }
  }, [isFocusActive, selectedMode, time]);

  // ② 【真の計測終了】3秒の警告時間が経過し、真に内省ページ（showReflection）が起動した瞬間を捉える副作用
  useEffect(() => {
    if (!channelRef.current) return;

    // showReflectionが真（＝3秒警告がタイムアップ、またはタイマー完了して内省が起動した）になった瞬間
    if (showReflection && !hasSentCompletedRef.current) {
      console.log('[WebSocket] Reflection Form Activated! Broadcasting "end_focus" with completed status.');
      // 猶予時間の経過によって「セッションが正式に完了した（completed）」ことをPCにダイレクト送信します！
      channelRef.current.perform('end_focus', {
        stop_reason: 'completed'
      });
      hasSentCompletedRef.current = true; // 多重送信を防ぐためにロックを掛けます
      lastBroadcastedActiveRef.current = false; // 同期状態を完全にリセット
    }
  }, [showReflection]);

  // クイック選択
  const quickOptions = [
    { label: '15', value: 15 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];

  const handleQuickSelect = (minutes) => {
    setTime({ h: 0, m: minutes, s: 0 });
  };

  const startFocusMode = () => {
    console.log('[WebSocket] Start Focus Mode. Hard resetting isResumeRef -> false');
    isResumeRef.current = false; // 同期的に確実に開始通知用リセット
    setSelectedMode('focus');
    setTime({ h: 0, m: 0, s: 0 });
    setPhase('waiting');
  };

  const startTimerSetup = () => {
    console.log('[WebSocket] Start Timer Setup. Hard resetting isResumeRef -> false');
    isResumeRef.current = false; // 同期的に確実に開始通知用リセット
    setSelectedMode('timer');
    setTime({ h: 0, m: 0, s: 0 });
    setPhase('timer_setup');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-100 p-6 bg-slate-950 overflow-hidden relative">
      
      {/* 待機中（waiting含む）のタイマー関連フェーズすべてで最右上端に固定配置されるPC連携バッジ */}
      {(phase === 'mode_select' || phase === 'timer_setup' || phase === 'waiting') && (
        <div 
          className="animate-in fade-in duration-300"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 50
          }}
        >
          {isPcLinked ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-wider shadow-lg backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <Monitor size={11} className="shrink-0" />
              <span>{t('pc_linked', 'PC連携中 ')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-500 text-[10px] font-bold tracking-wider shadow-lg backdrop-blur-md">
              <Monitor size={11} className="shrink-0" />
              <span>{t('pc_unlinked', 'PC未連携 ')}</span>
            </div>
          )}
        </div>
      )}

      {/* モード選択フェーズ */}
      {phase === 'mode_select' && (
        <div className="w-full max-w-xs space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-6">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">Routine</h2>
            <p className="text-white font-bold text-lg italic">{t('select_mode')}</p>
          </div>
          <ModeButton 
            onClick={startTimerSetup}
            icon={<Timer size={24} />}
            title={t('timer_mode')}
            subtitle={t('timer_mode_sub')}
            colorClass="text-indigo-400 bg-indigo-500/10"
          />
          <ModeButton 
            onClick={startFocusMode}
            icon={<Zap size={24} />}
            title={t('focus_mode')}
            subtitle={t('focus_mode_sub')}
            colorClass="text-cyan-400 bg-cyan-500/10"
          />
        </div>
      )}

      {/* タイマー設定フェーズ */}
      {phase === 'timer_setup' && (
        <div className="w-full max-w-xs space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-start">
            <button onClick={() => setPhase('mode_select')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors font-bold">
              <ChevronLeft size={14} /> {t('back')}
            </button>
          </div>

          <div className="flex justify-center gap-4">
            <DrumRoll 
              list={[...Array(24).keys()]} 
              value={time?.h || 0} 
              onChange={v => setTime(p => ({ ...p, h: v, s: 0 }))} 
              label={t('hrs')} 
            />
            <div className="pt-6 text-2xl font-black text-indigo-500">:</div>
            <DrumRoll 
              list={[...Array(60).keys()]} 
              value={time?.m || 0} 
              onChange={v => setTime(p => ({ ...p, m: v, s: 0 }))} 
              label={t('min')} 
            />
          </div>

          <div className="flex justify-between gap-2">
            {quickOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleQuickSelect(opt.value)}
                className={`flex-1 py-3 px-2 rounded-2xl bg-slate-900 border transition-all ${
                  time?.m === opt.value && time?.h === 0 
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50 scale-[1.02]' 
                  : 'border-slate-800 hover:border-slate-700 shadow-sm active:scale-95'
                }`}
              >
                <div className="text-sm text-slate-200 font-black">{opt.label}</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">min</div>
              </button>
            ))}
          </div>

          <PrimaryButton 
            onClick={() => {
              if (time?.h === 0 && time?.m === 0) return;
              console.log('[WebSocket] Setting Phase Waiting. Hard resetting isResumeRef -> false');
              isResumeRef.current = false; // タイマー側セッション開始時にも確実に同期リセット
              setPhase('waiting');
            }} 
            icon={ArrowRight}
            disabled={time?.h === 0 && time?.m === 0}
          >
            {t('start_session')}
          </PrimaryButton>
        </div>
      )}

      {/* 待機・集中フェーズ */}
      {(phase === 'waiting' || phase === 'focusing') && !showReflection && (
        <div className="flex flex-col items-center space-y-10 animate-in fade-in duration-500">
          <FocusDetectionEngine 
            onFlipChange={(flipped) => handleFlip(flipped, getLatestLogs)} 
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

      {/* 振り返りフォーム（オーバーレイ） */}
      {showReflection && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <ReflectionForm
            isCompleted={pendingResult?.completed}
            totalSeconds={pendingResult?.duration}
            motionLogs={pendingResult?.logs || []}
            onSubmit={handleReflectionSubmit}
          />
        </div>
      )}
    </div>
  );
};

// サブコンポーネント: モード選択ボタン
const ModeButton = ({ onClick, icon, title, subtitle, colorClass }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl active:scale-95 transition-all text-left hover:border-slate-700">
    <div className={`p-3 rounded-2xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="font-black italic text-sm text-slate-100">{title}</p>
      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
    </div>
  </button>
);

// サブコンポーネント: ステータスバッジ
const StatusBadge = ({ isTimeUp, t }) => (
  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mx-auto w-fit transition-colors ${
    isTimeUp ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
  }`}>
    {isTimeUp ? <CheckCircle2 size={12} /> : <Loader2 size={12} className="animate-spin" />}
    {isTimeUp ? t('status_complete_msg') : t('status_focusing_msg')}
  </div>
);

// サブコンポーネント: 時間表示
const TimeDisplay = ({ time }) => {
  const h = time?.h || 0;
  const m = time?.m || 0;
  const s = time?.s || 0;
  
  return (
    <div className="text-7xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-2xl">
      {h > 0 && `${h.toString().padStart(2, '0')}:`}
      {m.toString().padStart(2, '0')}:
      {s.toString().padStart(2, '0')}
    </div>
  );
};

export default ConcentrationTimer;