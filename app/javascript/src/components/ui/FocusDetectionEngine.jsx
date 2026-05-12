import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Volume2, AlertTriangle } from 'lucide-react';

/**
 * センサー検知エンジン
 */
const FocusDetectionEngine = ({ onFlipChange, active, isWarning }) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const prevRef = useRef(false);
  const audioRef = useRef(null);
  const wakeLock = useRef(null);

  // --- 警告（isWarning）時のカウントダウンロジック ---
  useEffect(() => {
    let timer;
    if (isWarning) {
      setCountdown(3); 
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
    } else {
      setCountdown(3);
    }
    return () => clearInterval(timer);
  }, [isWarning]);

  // 1. スリープ回避 (Screen Wake Lock API) ＆ 状態ログ出力
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && active) {
        try {
          wakeLock.current = await navigator.wakeLock.request('screen');
          console.log('DEBUG: [Wake Lock] 取得成功。画面スリープ防止が有効になりました。');
          
          wakeLock.current.addEventListener('release', () => {
            console.log('DEBUG: [Wake Lock] 解除されました（タブの切り替え、またはシステムによる自動解除）。');
          });
        } catch (err) {
          console.error(`DEBUG: [Wake Lock] 取得失敗: ${err.name}, ${err.message}`);
        }
      } else if (!('wakeLock' in navigator)) {
        console.warn('DEBUG: [Wake Lock] このブラウザ/環境は Wake Lock API をサポートしていません。');
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock.current !== null) {
        try {
          await wakeLock.current.release();
          console.log('DEBUG: [Wake Lock] 明示的に解除しました。');
          wakeLock.current = null;
        } catch (err) {
          console.error("DEBUG: [Wake Lock] 解除中にエラーが発生しました", err);
        }
      }
    };

    if (active) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        console.log('DEBUG: [Wake Lock] 画面表示が復帰したため再取得を試みます。');
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active]);

  // 2. iOS 100vh問題の動的修正
  useEffect(() => {
    const setFullHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setFullHeight);
    setFullHeight();
    return () => window.removeEventListener('resize', setFullHeight);
  }, []);

  // 音声・振動フィードバック
  const fb = useCallback((type) => {
    try {
      if (!audioRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      if (!ctx) return;
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
      // フィードバックエラーはサイレントに処理
    }
  }, []);

  // 3. センサーイベントリスナー
  const handleOri = useCallback((e) => {
    const beta = e.beta || 0;
    const gamma = e.gamma || 0;
    const flipped = Math.abs(beta) > 160 && Math.abs(gamma) < 25;
    
    if (flipped !== prevRef.current) {
      fb(flipped ? 'down' : 'up');
      onFlipChange(flipped);
      prevRef.current = flipped;
    }
    setIsFlipped(flipped);
  }, [fb, onFlipChange]);

  useEffect(() => {
    const startMonitoring = async () => {
      if (active) {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            await DeviceOrientationEvent.requestPermission();
          } catch (e) {
            console.error("DEBUG: [Sensor] 権限エラー", e);
          }
        }
        window.addEventListener('deviceorientation', handleOri, true);
      }
    };

    startMonitoring();
    return () => {
      window.removeEventListener('deviceorientation', handleOri, true);
    };
  }, [active, handleOri]);

  return (
    <div 
      className={`w-64 h-80 rounded-[3rem] border-2 flex flex-col items-center justify-center transition-all duration-700 ${
        isWarning ? 'bg-rose-900/20 border-rose-500 animate-pulse' :
        isFlipped ? 'bg-slate-900 border-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.15)]' : 'bg-slate-900/50 border-slate-800'
      }`}
      style={{ height: 'min(20rem, calc(var(--vh, 1vh) * 40))' }}
    >
      <div className={`p-8 rounded-full transition-all duration-700 ${
        isWarning ? 'bg-rose-600 text-white scale-90' :
        isFlipped ? 'bg-indigo-600 text-white rotate-180 scale-110 shadow-lg' : 'bg-slate-800 text-slate-600'
      }`}>
        {isWarning ? <AlertTriangle size={56} /> : isFlipped ? <Volume2 size={56} /> : <Smartphone size={56} />}
      </div>

      <p 
        className={`mt-8 text-2xl font-black italic uppercase text-center px-4 leading-tight whitespace-pre-line ${
          isWarning ? 'text-rose-500' : isFlipped ? 'text-white' : 'text-slate-500'
        }`}
        style={{ 
          wordBreak: 'keep-all', 
          overflowWrap: 'normal' 
        }}
      >
        {isWarning ? t('warning_title') : isFlipped ? t('engine_status_active') : t('instruction_flip_to_start')}
      </p>

      {isWarning && (
        <div className="flex flex-col items-center mt-2">
          <span className="text-sm font-bold text-rose-400 animate-bounce">
            {t('warning_subtitle', { count: countdown })}
          </span>
        </div>
      )}
    </div>
  );
};

export default FocusDetectionEngine;