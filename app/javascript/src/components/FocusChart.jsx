import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

// コンポーネント外で一度だけ登録を実行
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Filler,
  Legend
);

/**
 * FocusChart - グラフ描画のコンポーネント
 */
const FocusChart = ({ logs = [] }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  // 翻訳テキスト
  const labelText = t('logs.focus_level');
  const noDataText = t('logs.no_data');

  // 1. データの加工
  const dataPoints = useMemo(() => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) return [];
    
    const targetLogs = logs.length > 100 ? logs.slice(-100) : logs;

    return targetLogs.map(log => {
      const absBeta = Math.abs(log.angle || 0);
      let score = Math.round((absBeta / 180) * 100);

      if (score > 95) score = 100;
      if (score < 5) score = 0;

      return score;
    });
  }, [logs]);

  // 2. チャートの描画
  useLayoutEffect(() => {
    if (!canvasRef.current || !containerRef.current || dataPoints.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const rect = containerRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    
    // 高解像度ディスプレイ等でのぼやけ防止
    canvasRef.current.width = rect.width;
    canvasRef.current.height = 160;

    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: dataPoints.map((_, i) => i),
        datasets: [{
          label: labelText,
          data: dataPoints,
          fill: true,
          borderColor: '#6366f1',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          backgroundColor: gradient,
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            callbacks: {
              title: () => '',
              label: (context) => `${labelText}: ${context.parsed.y}%`
            }
          }
        },
        scales: {
          x: { display: false },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(71, 85, 105, 0.1)', drawBorder: false },
            ticks: {
              stepSize: 25,
              color: '#94a3b8',
              font: { size: 9 },
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPoints, labelText]);

  if (dataPoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 w-full border-2 border-dashed border-slate-800 bg-slate-900/40 rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          {noDataText}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        ref={containerRef} 
        className="relative w-full overflow-hidden"
        style={{ height: '160px' }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ display: 'block' }} 
        />
      </div>
    </div>
  );
};

export default React.memo(FocusChart);