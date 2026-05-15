import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Smartphone, 
  ArrowLeft, 
  Volume2, 
  Monitor, 
  Timer, 
  Brain, 
  Zap
} from 'lucide-react';

/**
 * Focus Detection Engine - Professional PC Edition
 */
const App = ({ onNavigate = (path) => console.log('Navigate to:', path) }) => {
  const { t } = useTranslation();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ランディングページの翻訳リソース（lp_slide_1〜4）を流用
  const slides = [
    {
      id: "01",
      icon: <Timer size={28} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />,
      title: t('lp_slide_1.title'),
      description: t('lp_slide_1.description'),
      tag: t('engine_capabilities.tag_efficiency', 'EFFICIENCY'),
      glow: "group-hover:shadow-[0_0_40px_rgba(129,140,248,0.1)]"
    },
    {
      id: "02",
      icon: <Smartphone size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />,
      title: t('lp_slide_2.title'),
      description: t('lp_slide_2.description'),
      tag: t('engine_capabilities.tag_hardware', 'HARDWARE'),
      glow: "group-hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]"
    },
    {
      id: "03",
      icon: <Brain size={28} className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]" />,
      title: t('lp_slide_3.title'),
      description: t('lp_slide_3.description'),
      tag: t('engine_capabilities.tag_psychology', 'PSYCHOLOGY'),
      glow: "group-hover:shadow-[0_0_40px_rgba(192,132,252,0.1)]"
    },
    {
      id: "04",
      icon: <Zap size={28} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />,
      title: t('lp_slide_4.title'),
      description: t('lp_slide_4.description'),
      tag: t('engine_capabilities.tag_connectivity', 'CONNECTIVITY'),
      glow: "group-hover:shadow-[0_0_40px_rgba(250,204,21,0.1)]"
    },
  ];

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsDesktop(!isMobileUA && width >= 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleOrientation = useCallback((event) => {
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    const flipped = Math.abs(beta) > 160 && Math.abs(gamma) < 20;
    setIsFlipped(flipped);
  }, []);

  const initializeSensor = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      } else {
        setPermissionGranted(true);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    } catch (err) {
      console.error('Sensor error');
    }
  };

  // PC用レイアウト
  if (isDesktop) {
    return (
      <div className="h-screen w-full bg-[#05070a] text-slate-200 flex flex-col items-center justify-center overflow-hidden p-8 font-sans select-none relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] opacity-40 pointer-events-none" />
        
        <div className="w-full max-w-6xl relative z-10">
          <header className="mb-16 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 mb-6 shadow-lg shadow-indigo-500/10">
              <Monitor size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-400">
                {t('engine_capabilities.arch_badge', 'System Integrated Architecture')}
              </span>
            </div>
            
            <h1 className="text-7xl font-black italic tracking-tighter text-white mb-4 leading-none uppercase">
              {t('engine_capabilities.hero_title_part1', 'ENGINE')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('engine_capabilities.hero_title_part2', 'CAPABILITIES')}</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium tracking-tight">
              {t('engine_capabilities.hero_subtitle')}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
            {slides.map((item) => (
              <div key={item.id} className={`group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm ${item.glow}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-indigo-500/40 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-black italic text-slate-700/50 tracking-tighter group-hover:text-white/20 transition-colors leading-none">
                      {item.id}
                    </span>
                  </div>
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white italic tracking-tight uppercase mb-3 group-hover:translate-x-1 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[90%] font-medium">
                  {item.description}
                </p>

                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="mt-20 flex items-center justify-center gap-6 opacity-20">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-slate-500" />
            <span className="text-[9px] font-bold tracking-[0.5em] uppercase text-slate-500 italic">
              {t('engine_capabilities.footer_text', 'Focused Architecture')}
            </span>
            <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-slate-500" />
          </div>
        </div>
      </div>
    );
  }

  // スマホ用レイアウト
  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none touch-none">
      <nav className="flex items-center px-6 h-20 shrink-0">
        <button onClick={() => onNavigate('timer')} className="text-slate-400 active:opacity-50">
          <ArrowLeft size={28} strokeWidth={2.5} />
        </button>
      </nav>

      <main className="flex-1 flex flex-col px-8 justify-center">
        {!permissionGranted ? (
          <div className="flex flex-col gap-8">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              {t('engine_capabilities.mobile_sensor_title_1', 'MOBILE')}<br />
              <span className="text-indigo-500 text-5xl">{t('engine_capabilities.mobile_sensor_title_2', 'SENSOR')}</span>
            </h2>
            <p className="text-slate-500 text-sm font-bold leading-relaxed">
              {t('engine_capabilities.sensor_desc')}
            </p>
            <button
              onClick={initializeSensor}
              className="w-full py-6 rounded-3xl bg-indigo-600 font-black text-sm uppercase tracking-[0.2em] text-white shadow-2xl shadow-indigo-600/30 active:scale-95 transition-transform"
            >
              {t('engine_capabilities.btn_init')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              isFlipped ? 'bg-indigo-600 border-white scale-110 shadow-[0_0_50px_rgba(79,70,229,0.4)]' : 'bg-slate-900 border-slate-800'
            }`}>
              {isFlipped ? <Volume2 size={80} className="text-white" /> : <Smartphone size={80} className="text-slate-700" />}
            </div>
            
            <div className="text-center">
              <h3 className={`text-5xl font-black italic uppercase tracking-tighter transition-colors ${isFlipped ? 'text-white' : 'text-slate-800'}`}>
                {isFlipped ? t('engine_capabilities.status_focused') : t('engine_capabilities.status_standby')}
              </h3>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-500 mt-4">
                {t('engine_capabilities.algo_active')}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;