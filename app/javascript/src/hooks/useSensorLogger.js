import { useState, useEffect, useRef } from 'react';

/**
 * センサーログ収集専用のカスタムフック
 * @param {boolean} isActive - 集中フェーズかつスマホが裏向きかどうか
 */
export const useSensorLogger = (isActive) => {
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]); // 最新のログを保持するRef
  const lastRecordedAngle = useRef(null);
  const lastRecordTimestamp = useRef(0);

  const ANGLE_THRESHOLD = 5; 
  const HEARTBEAT_INTERVAL = 30000;

  // logsが更新されるたびにRefを更新
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    if (!isActive) return;

    const handleOrientation = (event) => {
      const currentAngle = Math.round(event.beta || 0);
      const now = Date.now();

      const hasSignificantChange =
        lastRecordedAngle.current === null ||
        Math.abs(currentAngle - lastRecordedAngle.current) > ANGLE_THRESHOLD;

      const isHeartbeatTime = (now - lastRecordTimestamp.current) > HEARTBEAT_INTERVAL;

      if (hasSignificantChange || isHeartbeatTime) {
        const newLog = {
          t: new Date().toISOString(),
          angle: currentAngle
        };

        setLogs(prev => [...prev, newLog]);
        lastRecordedAngle.current = currentAngle;
        lastRecordTimestamp.current = now;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [isActive]);

  return { 
    logs, 
    getLatestLogs: () => logsRef.current,
    resetLogs: () => {
      setLogs([]);
      logsRef.current = [];
    }
  };
};