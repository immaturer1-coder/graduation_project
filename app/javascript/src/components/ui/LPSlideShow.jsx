import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Smartphone, Brain, Zap } from 'lucide-react';

/**
 * ランディングページ用のスライドショーコンポーネント
 */
const LPSlideShow = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  // スライドのアイコンと翻訳キーの定義
  const slides = [
    {
      icon: <Timer size={48} className="text-indigo-400" />,
      key: "lp_slide_1"
    },
    {
      icon: <Smartphone size={48} className="text-cyan-400" />,
      key: "lp_slide_2"
    },
    {
      icon: <Brain size={48} className="text-purple-400" />,
      key: "lp_slide_3"
    },
    {
      icon: <Zap size={48} className="text-yellow-400" />,
      key: "lp_slide_4"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  return (
    <div 
      className="w-full max-w-sm mx-auto relative overflow-hidden touch-pan-y px-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex flex-col items-center text-center space-y-6 min-h-[240px] justify-center">
        
        <div key={`icon-${currentSlide}`} className="p-5 bg-slate-900/50 rounded-3xl shadow-inner animate-in fade-in zoom-in duration-500">
          {slides[currentSlide].icon}
        </div>
        
        <div className="space-y-3">
          <h3 key={`title-${currentSlide}`} className="text-2xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
            {t(`${slides[currentSlide].key}.title`)}
          </h3>
          
          <p key={`desc-${currentSlide}`} className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700">
            {t(`${slides[currentSlide].key}.description`)}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentSlide === index ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LPSlideShow;