import React, { useEffect, useRef, useCallback } from 'react';

/**
 * DrumRoll Component
 * 慣性スクロールやクイック選択時の競合を解消した安定版
 */
const DrumRoll = ({ list, value, onChange, label }) => {
  const scrollRef = useRef(null);
  const isInternalScrolling = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // 目的の数値(value)へスクロールさせる
  const scrollToValue = useCallback((targetValue, smooth = true) => {
    if (!scrollRef.current) return;

    const index = list.indexOf(targetValue);
    if (index === -1) return;

    const itemHeight = 44; 
    const targetScrollTop = index * itemHeight;

    // スクロール開始前にロック
    isInternalScrolling.current = true;

    scrollRef.current.scrollTo({
      top: targetScrollTop,
      behavior: smooth ? 'smooth' : 'auto'
    });

    // ロック解除のタイマー管理（既存のものをクリアして再設定）
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isInternalScrolling.current = false;
    }, 600); // 余裕を持って600msに設定
  }, [list]);

  // 外部(親のステート)が変更された時に追従
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const itemHeight = 44;
    const currentIdx = Math.round(scrollRef.current.scrollTop / itemHeight);
    
    // 現在のスクロール位置が期待する値と異なる場合のみ実行
    if (list[currentIdx] !== value) {
      scrollToValue(value, true);
    }
  }, [value, list, scrollToValue]);

  const handleScroll = (e) => {
    // クイック選択など「プログラムによるスクロール」の間は無視
    if (isInternalScrolling.current) return;

    const scrollTop = e.target.scrollTop;
    const itemHeight = 44;
    
    // 四捨五入で現在のインデックスを特定
    const idx = Math.round(scrollTop / itemHeight);
    const newValue = list[idx];

    // 値が有効で、かつ現在の値と異なる場合のみ更新
    if (newValue !== undefined && newValue !== value) {
      // ユーザーの手動操作であることを担保しつつ、親に通知
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">
        {label}
      </span>

      <div className="relative h-[132px] w-20 overflow-hidden bg-slate-900/50 rounded-xl border border-white/5 shadow-inner">
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar py-[44px] scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' // iOSでの滑らかなスクロール用
          }}
        >
          {list.map((item) => (
            <div 
              key={item} 
              className={`h-[44px] flex items-center justify-center snap-center snap-stop-always transition-all duration-300 ${
                value === item 
                  ? 'text-3xl font-black text-indigo-400 scale-110' 
                  : 'text-lg font-medium text-slate-500 opacity-30'
              }`}
            >
              {item.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* 選択エリアのハイライトガード（中央の固定枠） */}
        <div className="absolute top-[44px] left-0 w-full h-[44px] border-y border-indigo-500/30 pointer-events-none bg-indigo-500/10 z-10"></div>
        
        {/* 上下のグラデーションフェード */}
        <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

export default DrumRoll;