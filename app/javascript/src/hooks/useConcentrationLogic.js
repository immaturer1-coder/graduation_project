import { useState, useEffect, useCallback, useRef } from 'react';
import { createFocusRecord } from '../api/focus_records';

/**
 * 集中管理のメインロジック
 * センサーのチャタリングやレンダリングによるタイマーの二重起動を徹底防止
 */
export const useConcentrationLogic = (onComplete, getLatestLogs) => {
  const [phase, setPhase] = useState('mode_select'); 
  const [selectedMode, setSelectedMode] = useState(null);
  const [time, setTime] = useState({ h: 0, m: 25, s: 0 }); 
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  // タイマーIDを保持するRef
  const warningTimerRef = useRef(null);
  const alarmRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  // 計測データ用
  const startAtRef = useRef(null);
  const totalFocusedSecondsRef = useRef(0);
  
  // 内部状態フラグ（これが最も重要）
  const isTransitioningRef = useRef(false); 

  // タイマーとアラームを物理的に停止する
  const stopAllSideEffects = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (alarmRef.current) {
      clearInterval(alarmRef.current);
      alarmRef.current = null;
    }
    setIsWarning(false);
  }, []);

  const toggleAlarm = useCallback((start) => {
    if (!start) {
      if (alarmRef.current) clearInterval(alarmRef.current);
      alarmRef.current = null;
      return;
    }
    if (alarmRef.current) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const play = () => {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    };
    play();
    alarmRef.current = setInterval(play, 1500);
  }, []);

  const startReflectionPhase = useCallback((data) => {
    // すでに遷移処理が始まっていれば、後の呼び出しは無視
    if (isTransitioningRef.current === 'ready') return;
    isTransitioningRef.current = 'ready';

    stopAllSideEffects();
    toggleAlarm(false);
    
    setPendingResult({
      ...data,
      endedAt: new Date().toISOString()
    });
    setShowReflection(true);
  }, [stopAllSideEffects, toggleAlarm]);

  const handleFlip = useCallback((flipped) => {
    // 遷移中、または内省画面表示中は何もしない
    if (isTransitioningRef.current || showReflection) return;

    setIsFlipped(flipped);

    if (flipped) {
      // 伏せた場合は警告タイマーをリセット
      stopAllSideEffects();
      if (phase === 'waiting') {
        setPhase('focusing');
        startAtRef.current = new Date().toISOString();
        totalFocusedSecondsRef.current = 0; 
      }
    } else if (phase === 'focusing') {
      const sessionData = {
        duration: totalFocusedSecondsRef.current,
        startedAt: startAtRef.current,
        mode: selectedMode,
        logs: getLatestLogs ? getLatestLogs() : []
      };

      if (isTimeUp) {
        // 時間切れの場合は即座に遷移
        startReflectionPhase({ ...sessionData, completed: true, interrupted: false });
      } else {
        // 中断警告フェーズ
        setIsWarning(true);
        
        // 【重要】既存のタイマーがあれば確実に消してから新しくセット
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
        
        warningTimerRef.current = setTimeout(() => {
          // 3秒後、まだ他の処理で遷移していなければ実行
          if (!isTransitioningRef.current) {
            startReflectionPhase({ ...sessionData, completed: false, interrupted: true });
          }
          warningTimerRef.current = null;
        }, 3000);
      }
    }
  }, [phase, isTimeUp, selectedMode, showReflection, getLatestLogs, startReflectionPhase, stopAllSideEffects]);

  const handleReflectionSubmit = async (reflectionData) => {
    if (!pendingResult || isTransitioningRef.current === 'submitting') return;
    
    isTransitioningRef.current = 'submitting';
    
    const dataToSend = { ...pendingResult, ...reflectionData };

    try {
      const result = await createFocusRecord(dataToSend);
      setPendingResult(null);
      setShowReflection(false);
      setPhase('analysis');
      if (onComplete) {
        onComplete({ ...dataToSend, id: result.id });
      }
    } catch (error) {
      console.error("Rails API 保存エラー:", error);
      // エラー時は再試行できるようにフラグを戻す
      isTransitioningRef.current = 'ready'; 
    }
  };

  useEffect(() => {
    let interval;
    if (phase === 'focusing' && isFlipped && !showReflection && !isTransitioningRef.current) {
      interval = setInterval(() => {
        totalFocusedSecondsRef.current += 1;
        setTime(p => {
          let totalSecs = p.h * 3600 + p.m * 60 + p.s;
          if (selectedMode === 'timer') {
            if (totalSecs <= 0) {
              if (!isTimeUp) {
                setIsTimeUp(true);
                toggleAlarm(true);
              }
              return { h: 0, m: 0, s: 0 };
            }
            totalSecs -= 1;
          } else {
            totalSecs += 1;
          }
          return {
            h: Math.floor(totalSecs / 3600),
            m: Math.floor((totalSecs % 3600) / 60),
            s: totalSecs % 60
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, isFlipped, selectedMode, isTimeUp, showReflection, toggleAlarm]);

  return {
    phase, setPhase,
    selectedMode, setSelectedMode,
    time, setTime,
    setQuickTime: (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      setTime({ h, m: min, s: 0 });
      setPhase('timer_setup');
    },
    isFlipped, setIsFlipped,
    isWarning, setIsWarning,
    isTimeUp,
    showReflection, setShowReflection,
    handleFlip,
    handleReflectionSubmit,
    pendingResult,
    startAt: startAtRef.current
  };
};