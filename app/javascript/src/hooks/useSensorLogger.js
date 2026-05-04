import { useState, useEffect, useRef } from 'react';

/**
 * センサーログ収集専用のカスタムフック
 * @param {boolean} isActive - 集中フェーズ中かどうか
 */
export const useSensorLogger = (isActive) => {
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]); 
  const lastRecordedAngle = useRef(null);
  const lastRecordTimestamp = useRef(0);

  const ANGLE_THRESHOLD = 5; 
  const HEARTBEAT_INTERVAL = 30000; // 30秒ごとに強制記録

  // 常に最新のlogsをRefに同期（親コンポーネントからの取得用）
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    // isActive が false の時は何もしないが、既存のログは保持する
    if (!isActive) return;

    // ログを記録する内部関数
    const recordLog = (angle) => {
      const now = Date.now();
      const newLog = {
        t: new Date().toISOString(),
        angle: Math.round(angle)
      };

      setLogs(prev => [...prev, newLog]);
      lastRecordedAngle.current = Math.round(angle);
      lastRecordTimestamp.current = now;
    };

    const handleOrientation = (event) => {
      const currentAngle = Math.round(event.beta || 0);
      const now = Date.now();

      // 初回記録、または大きな変化、または一定時間経過
      const isFirstRecord = lastRecordedAngle.current === null;
      const hasSignificantChange = !isFirstRecord && Math.abs(currentAngle - lastRecordedAngle.current) > ANGLE_THRESHOLD;
      const isHeartbeatTime = (now - lastRecordTimestamp.current) > HEARTBEAT_INTERVAL;

      if (isFirstRecord || hasSignificantChange || isHeartbeatTime) {
        recordLog(currentAngle);
      }
    };

    // リスナー登録
    window.addEventListener('deviceorientation', handleOrientation, true);

    // デバッグ用: 登録された瞬間に一度イベントを待たずに現在の状態を取得したいが、
    // DeviceOrientationはイベント駆動のため、最初のイベントを待つ。
    
    return () => {
      // クリーンアップ時（isActiveがfalseになった時）も logs ステートは破棄しない
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isActive]);

  return { 
    logs, 
    getLatestLogs: () => logsRef.current,
    resetLogs: () => {
      setLogs([]);
      lastRecordedAngle.current = null;
      lastRecordTimestamp.current = 0;
    }
  };
};