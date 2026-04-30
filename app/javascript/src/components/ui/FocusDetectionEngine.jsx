import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Volume2, AlertTriangle } from 'lucide-react';

/**
 * センサー検知エンジン
 * デバイスの傾きを監視し、伏せられた状態を判定・通知する
 */
const FocusDetectionEngine = ({ onFlipChange, active, isWarning }) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const prevRef = useRef(false);
  const audioRef = useRef(null);

  // 音声・振動フィードバック
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
    } catch (e) {
      console.warn("Feedback failed", e);
    }
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

export default FocusDetectionEngine;