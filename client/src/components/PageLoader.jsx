import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [show, setShow] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    'Preparing workspace...',
    'Securing connection...',
    'Optimizing interface...',
    'Synchronizing session...',
    'Loading modules...'
  ];

  useEffect(() => {
    // Prevent flashing for extremely fast loads by delaying visibility
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 800);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060810]/70 backdrop-blur-xl transition-all duration-500 animate-fade-in">
      <div className="relative flex flex-col items-center p-8 rounded-3xl bg-[#0f1117]/80 border border-brand-500/10 shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-brand-500/15 filter blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-violet-500/15 filter blur-xl pointer-events-none" />

        {/* Custom SVG Gradient Spinner */}
        <div className="relative flex items-center justify-center w-20 h-20 mb-5">
          {/* Logo in center */}
          <div className="absolute flex items-center justify-center w-10 h-10 rounded-full">
            <img
              src="/logo.png"
              alt="ProjectBridge"
              className="w-9 h-9 object-contain"
              style={{
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.8)) brightness(1.1)',
              }}
            />
          </div>
          
          <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
            <defs>
              <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle
              className="text-slate-800/40"
              cx="25"
              cy="25"
              r="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <circle
              cx="25"
              cy="25"
              r="21"
              fill="none"
              stroke="url(#loader-gradient)"
              strokeWidth="3.5"
              strokeDasharray="90"
              strokeDashoffset="30"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title and Animated Tag */}
        <h3 className="text-base font-bold text-slate-100 font-display tracking-tight">
          ProjectBridge
        </h3>
        
        {/* Status Text with elegant transition */}
        <div className="h-5 mt-2 overflow-hidden">
          <p key={statusIndex} className="text-xs text-brand-400/90 font-medium tracking-wide animate-slide-up">
            {statuses[statusIndex]}
          </p>
        </div>

        {/* Tiny progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {statuses.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === statusIndex ? 'w-4 bg-brand-500' : 'w-1 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
