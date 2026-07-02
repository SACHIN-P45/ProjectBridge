import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [show, setShow] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const statuses = [
    'Preparing workspace...',
    'Securing connection...',
    'Optimizing interface...',
    'Synchronizing session...',
    'Loading modules...',
  ];

  useEffect(() => {
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

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + Math.random() * 12));
    }, 400);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060810]/80 backdrop-blur-2xl animate-fade-in">

      {/* Ambient background orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full filter blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-500/10 rounded-full filter blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="flex flex-col items-center gap-6">

        {/* ── Orbital Ring Spinner ── */}
        <div className="relative w-32 h-32 flex items-center justify-center">

          {/* Outer conic ring */}
          <svg className="absolute inset-0 w-full h-full" style={{ animation: 'spinLoader 1.4s linear infinite' }} viewBox="0 0 128 128">
            <defs>
              <linearGradient id="pg-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity="0" />
                <stop offset="40%"  stopColor="#8b5cf6" stopOpacity="1" />
                <stop offset="80%"  stopColor="#06b6d4" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="5" />
            {/* Animated arc */}
            <circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke="url(#pg-grad-outer)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="260"
              strokeDashoffset="65"
            />
          </svg>

          {/* Middle counter-rotating ring */}
          <svg className="absolute inset-0 w-full h-full" style={{ width: '78%', height: '78%', top: '11%', left: '11%', animation: 'spinLoaderRev 2s linear infinite' }} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="pg-grad-mid" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0" />
                <stop offset="50%"  stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#pg-grad-mid)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="160"
              strokeDashoffset="100"
            />
          </svg>

          {/* Inner fast ring */}
          <svg className="absolute inset-0 w-full h-full" style={{ width: '52%', height: '52%', top: '24%', left: '24%', animation: 'spinLoader 0.8s linear infinite' }} viewBox="0 0 64 64">
            <defs>
              <linearGradient id="pg-grad-inner" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="24"
              fill="none"
              stroke="url(#pg-grad-inner)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="80"
              strokeDashoffset="55"
            />
          </svg>

          {/* Center logo pulse */}
          <div className="relative w-14 h-14 rounded-full bg-[#0f1117] border border-violet-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center z-10" style={{ animation: 'centerPulse 2s ease-in-out infinite' }}>
            <img src="/logo.png" alt="ProjectBridge" className="w-10 h-10 object-contain logo-img" />
          </div>

          {/* Orbiting dot */}
          <div className="absolute inset-0" style={{ animation: 'spinLoader 1.4s linear infinite' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
          </div>
          <div className="absolute inset-0" style={{ animation: 'spinLoaderRev 2s linear infinite' }}>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
          </div>
        </div>

        {/* Text block */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-white font-display font-black text-xl tracking-tight">
            Project<span className="text-brand-400">Bridge</span>
          </h3>

          {/* Rotating status text */}
          <div className="h-5 overflow-hidden">
            <p key={statusIndex} className="text-xs text-slate-400 font-medium tracking-widest uppercase text-center animate-slide-up">
              {statuses[statusIndex]}
            </p>
          </div>

          {/* Thin progress bar */}
          <div className="w-48 h-0.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                boxShadow: '0 0 8px rgba(99,102,241,0.6)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes spinLoader {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinLoaderRev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes centerPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3), 0 0 0 0 rgba(99,102,241,0.2); }
          50%       { box-shadow: 0 0 32px rgba(99,102,241,0.5), 0 0 16px rgba(99,102,241,0.1); }
        }
      `}</style>
    </div>
  );
}
