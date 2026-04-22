import React from 'react';

const LoadingOverlay = ({ message = "PROCESSING..." }) => (
  <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
    <p className="text-indigo-400 font-black italic animate-pulse tracking-widest text-sm uppercase">
      {message}
    </p>
  </div>
);

export default LoadingOverlay;