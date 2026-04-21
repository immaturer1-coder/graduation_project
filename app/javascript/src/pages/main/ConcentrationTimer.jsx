import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Zap, Smartphone, ChevronLeft, Timer, Volume2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * FocusDetectionEngine(子): センサー検知と物理フィードバック
 * ConcentrationTimer(親): タイマーのロジック、3秒の猶予時間（isWarning）、フェーズ管理などを担当
 */
const FocusDetectionEngine = ({ onFlipChange, active, isWarning }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const prevRef = useRef(false);
  const audioRef = useRef(null);

  const fb = useCallback((type) => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(type === 'down' ? 800 : 1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'down' ? 100 : 400, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
      if ('vibrate' in navigator) navigator.vibrate(type === 'down' ? [60, 40, 60] : 50);
    } catch (e) {}
  }, []);

  const handleOri = useCallback((e) => {
    const flipped = Math.abs(e.beta || 0) > 160 && Math.abs(e.gamma || 0) < 20;
    if (flipped !== prevRef.current) {
      fb(flipped ? 'down' : 'up');
      onFlipChange(flipped);
      prevRef.current = flipped;
    }
    setIsFlipped(flipped);
  }, [fb, onFlipChange]);

  useEffect(() => {
    if (active) window.addEventListener('deviceorientation', handleOri, true);
    return () => window.removeEventListener('deviceorientation', handleOri, true);
  }, [active, handleOri]);

  return (
    <div className={`w-64 h-80 rounded-[3rem] border-2 flex flex-col items-center justify-center transition-all duration-700 ${
      isWarning ? 'bg-rose-900/20 border-rose-500 animate-pulse' :
      isFlipped ? 'bg-slate-900 border-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.15)]' : 'bg-slate-900/50 border-slate-800'
    }`}>
      <div className={`p-8 rounded-full transition-all duration-700 ${
        isWarning ? 'bg-rose-600 text-white scale-90' :
        isFlipped ? 'bg-indigo-600 text-white rotate-180 scale-110' : 'bg-slate-800 text-slate-600'
      }`}>
        {isWarning ? <AlertTriangle size={56} /> : isFlipped ? <Volume2 size={56} /> : <Smartphone size={56} />}
      </div>
      <p className={`mt-8 text-2xl font-black italic uppercase ${isWarning ? 'text-rose-500' : isFlipped ? 'text-white' : 'text-slate-500'}`}>
        {isWarning ? 'Return Device!' : isFlipped ? 'Monitoring' : 'Flip Device'}
      </p>
      {isWarning && <span className="text-[10px] font-bold text-rose-400 mt-2 animate-bounce">Penalty in 3s...</span>}
    </div>
  );
};

const ConcentrationTimer = ({ onComplete }) => {
  const [phase, setPhase] = useState('mode_select');
  const [selectedMode, setSelectedMode] = useState(null);
  const [time, setTime] = useState({ h: 0, m: 25, s: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const warningTimerRef = useRef(null);
  const alarmRef = useRef(null);
  const audioRef = useRef(null);

  // アラーム制御
  const toggleAlarm = useCallback((start) => {
    if (!start) return (clearInterval(alarmRef.current), alarmRef.current = null);
    if (alarmRef.current) return;
    if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const play = () => {
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    };
    play(); alarmRef.current = setInterval(play, 1500);
  }, []);

  // 中断判定・終了ロジック
  const handleFlip = useCallback((flipped) => {
    setIsFlipped(flipped);
    if (flipped) {
      setIsWarning(false);
      clearTimeout(warningTimerRef.current);
      if (phase === 'waiting') setPhase('focusing');
    } else if (phase === 'focusing') {
      // 目標時間を過ぎている場合は即座に完了処理へ、そうでなければ警告フェーズへ
      if (isTimeUp) {
        toggleAlarm(false);
        onComplete({ 
          duration: time.s, 
          mode: selectedMode, 
          completed: true,
          interrupted: false 
        });
      } else {
        setIsWarning(true);
        warningTimerRef.current = setTimeout(() => {
          toggleAlarm(false);
          onComplete({ 
            duration: time.s, 
            mode: selectedMode, 
            completed: false,
            interrupted: true 
          });
        }, 3000);
      }
    }
  }, [phase, time.s, selectedMode, isTimeUp, onComplete, toggleAlarm]);

  // タイマー進行
  useEffect(() => {
    let timer;
    if (phase === 'focusing' && isFlipped) {
      const target = time.h * 3600 + time.m * 60;
      timer = setInterval(() => {
        setTime(p => {
          const nextS = p.s + 1;
          if (selectedMode === 'timer' && nextS >= target && !isTimeUp) {
            setIsTimeUp(true);
            toggleAlarm(true);
          }
          return { ...p, s: nextS };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, isFlipped, selectedMode, time.h, time.m, isTimeUp, toggleAlarm]);

  const DrumRoll = ({ list, value, onChange, label }) => {
    const scrollRef = useRef(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = value * 44; }, [value]);
    return (
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black text-slate-600 mb-1 uppercase tracking-widest">{label}</span>
        <div className="relative h-40 w-16 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar pt-14 pb-14" onScroll={e => {
            const idx = Math.round(e.target.scrollTop / 44);
            if (list[idx] !== undefined && list[idx] !== value) onChange(list[idx]);
          }}>
            {list.map(v => <div key={v} className={`h-[44px] flex items-center justify-center snap-center transition-all ${value === v ? 'text-3xl font-black text-white italic' : 'text-sm font-bold text-slate-700'}`}>{v.toString().padStart(2, '0')}</div>)}
          </div>
          <div className="absolute top-1/2 w-full h-11 border-y border-indigo-500/30 pointer-events-none -translate-y-1/2"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-100 p-6">
      {phase === 'mode_select' && (
        <div className="w-full max-w-xs space-y-4 animate-in fade-in">
          <div className="text-center mb-6">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">Routine</h2>
            <p className="text-white font-bold text-lg italic">Select Mode</p>
          </div>
          <button onClick={() => { setSelectedMode('timer'); setPhase('timer_setup'); }} className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl active:scale-95 transition-all">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Timer size={24} /></div>
            <div className="text-left"><p className="font-black italic">Timer Mode</p><p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Fixed Target</p></div>
          </button>
          <button onClick={() => { setSelectedMode('focus'); setPhase('waiting'); }} className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl active:scale-95 transition-all">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><Zap size={24} /></div>
            <div className="text-left"><p className="font-black italic">Focus Mode</p><p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Endless</p></div>
          </button>
        </div>
      )}

      {phase === 'timer_setup' && (
        <div className="w-full max-w-xs space-y-8 animate-in slide-in-from-right duration-300">
          <button onClick={() => setPhase('mode_select')} className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest"><ChevronLeft size={14} /> Back</button>
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center gap-4">
              <DrumRoll list={[...Array(24).keys()]} value={time.h} onChange={v => setTime(p => ({ ...p, h: v }))} label="Hrs" />
              <div className="pt-6 text-2xl font-black text-indigo-500">:</div>
              <DrumRoll list={[...Array(60).keys()]} value={time.m} onChange={v => setTime(p => ({ ...p, m: v }))} label="Min" />
            </div>
            <div className="flex gap-4 w-full justify-center">
              {[15, 25, 50].map(m => (
                <button key={m} onClick={() => setTime({ h: Math.floor(m/60), m: m%60, s: 0 })} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all border ${(time.h * 60 + time.m) === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{m}M</button>
              ))}
            </div>
          </div>
          <button onClick={() => setPhase('waiting')} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-lg active:scale-95 transition-all">START SESSION</button>
        </div>
      )}

      {(phase === 'waiting' || phase === 'focusing') && (
        <div className="flex flex-col items-center space-y-10 animate-in fade-in">
          <FocusDetectionEngine onFlipChange={handleFlip} active={true} isWarning={isWarning} />
          {phase === 'focusing' && (
            <div className="text-center space-y-3">
              <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isTimeUp ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                {isTimeUp ? <CheckCircle2 size={12} /> : <Loader2 size={12} className="animate-spin" />}
                {isTimeUp ? 'Target Completed! Pick up' : 'Focusing...'}
              </div>
              <div className="text-7xl font-black text-white italic tracking-tighter tabular-nums">
                {Math.floor(time.s / 60).toString().padStart(2, '0')}:{(time.s % 60).toString().padStart(2, '0')}
              </div>
              {selectedMode === 'timer' && !isTimeUp && (
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Goal: {time.h.toString().padStart(2,'0')}:{time.m.toString().padStart(2,'0')}
                </p>
              )}
            </div>
          )}
          {phase === 'waiting' && <button onClick={() => setPhase('mode_select')} className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Cancel</button>}
        </div>
      )}
    </div>
  );
};

export default ConcentrationTimer;