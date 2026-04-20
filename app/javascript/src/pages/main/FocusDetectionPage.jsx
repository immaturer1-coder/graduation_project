import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, ShieldCheck, ArrowLeft, Loader2, Volume2, SmartphoneNfc } from 'lucide-react';

/**
 * 集中モード検知エンジン (誤検知防止版)
 * 縦の回転(beta)だけでなく、左右の傾き(gamma)もチェックして「横に倒しただけ」での誤作動を防ぐ。
 */
const FocusDetectionPage = ({ onNavigate }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState(null);
  
  const prevFlippedRef = useRef(false);
  const audioCtxRef = useRef(null);

  const playFeedbackSound = useCallback((type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const startFreq = type === 'down' ? 800 : 1200;
      const endFreq = type === 'down' ? 100 : 400;

      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Audio feedback failed", e);
    }
  }, []);

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleOrientation = useCallback((event) => {
    const beta = event.beta || 0;  // 前後の傾き
    const gamma = event.gamma || 0; // 左右の傾き

    /**
     * 【誤作動防止ロジック】
     * 1. Math.abs(beta) > 160 : 前後方向にほぼ裏返っている
     * 2. Math.abs(gamma) < 20 : 左右方向には大きく傾いていない（水平に近い）
     * この2つの条件が揃った時だけ「裏返し」と判定。
     */
    const flipped = Math.abs(beta) > 160 && Math.abs(gamma) < 20;

    if (flipped !== prevFlippedRef.current) {
      if (flipped) {
        playFeedbackSound('down');
        triggerVibration();
      } else {
        playFeedbackSound('up');
        triggerVibration();
      }
      prevFlippedRef.current = flipped;
    }

    setIsFlipped(flipped);
  }, [playFeedbackSound, triggerVibration]);

  const startMonitoring = useCallback(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setIsMonitoring(true);
    } else {
      setError('Sensor not supported');
    }
  }, [handleOrientation]);

  const stopMonitoring = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
    setIsMonitoring(false);
  }, [handleOrientation]);

  const initializeSensor = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startMonitoring();
        }
      } else {
        setPermissionGranted(true);
        startMonitoring();
      }
    } catch (err) {
      setError('Initialization failed');
    }
  };

  useEffect(() => {
    if (permissionGranted) startMonitoring();
    return () => stopMonitoring();
  }, [permissionGranted, startMonitoring, stopMonitoring]);

  return (
    <div className="h-[100dvh] w-full bg-[#0a0c14] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      <nav className="flex items-center px-6 pt-4 pb-2 shrink-0">
        <button onClick={() => onNavigate('analysis')} className="p-2 -ml-2 text-slate-400 active:bg-slate-800 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase italic">
            Focus Detection
          </span>
        </div>
        <div className="w-10"></div>
      </nav>

      <main className="flex-1 flex flex-col px-6 justify-center">
        {!permissionGranted ? (
          <div className="text-center space-y-8">
            <div className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto rotate-12 border border-indigo-500/20">
              <SmartphoneNfc className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Test Focus Mode</h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed px-4">
                Enable sensors, sound, and haptics.<br />
                After granting permission, try flipping your phone face down.
              </p>
            </div>
            <button
              onClick={initializeSensor}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              Enable Features
            </button>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`w-full aspect-[4/5] max-h-[400px] rounded-[3rem] border-2 transition-all duration-700 flex flex-col items-center justify-center relative overflow-hidden ${
              isFlipped 
                ? 'bg-slate-900 border-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.2)]' 
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div className={`p-10 rounded-full transition-all duration-700 ${
                isFlipped ? 'bg-indigo-600 text-white rotate-180 scale-110' : 'bg-slate-800 text-slate-600'
              }`}>
                {isFlipped ? <Volume2 size={64} strokeWidth={1.5} /> : <Smartphone size={64} strokeWidth={1} />}
              </div>
              <div className="mt-10 text-center">
                <p className={`text-4xl font-black italic uppercase tracking-tighter transition-all duration-700 ${
                  isFlipped ? 'text-indigo-400' : 'text-slate-700'
                }`}>
                  {isFlipped ? 'Monitoring' : 'Ready'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <SmartphoneNfc size={14} className={isFlipped ? 'text-indigo-500' : 'text-slate-600'} />
                  <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${
                    isFlipped ? 'text-indigo-200' : 'text-slate-500'
                  }`}>
                    Stabilized Detection Active
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-full border border-white/5">
                <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Precision Engine Running
                </span>
              </div>
              <p className="text-[9px] text-slate-700 font-medium text-center px-8 leading-relaxed">
                Responsive only when flipped vertically.<br/>
                Side tilts and unintentional rotations are filtered out.
              </p>
            </div>
          </div>
        )}
      </main>
      <div className="h-10 shrink-0"></div>
    </div>
  );
};

export default FocusDetectionPage;