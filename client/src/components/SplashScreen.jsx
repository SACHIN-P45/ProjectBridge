import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter | pulse | exit

  useEffect(() => {
    const pulseTimer = setTimeout(() => setPhase('pulse'), 300);
    const exitTimer  = setTimeout(() => setPhase('exit'),  1600);
    const doneTimer  = setTimeout(() => onComplete?.(),    2200);
    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-root ${phase === 'exit' ? 'splash-exit' : ''}`} aria-label="Loading ProjectBridge" role="status">

      {/* Animated mesh grid */}
      <div className="splash-mesh" />

      {/* Ambient orbs */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="splash-particle" style={{ '--i': i }} />
      ))}

      {/* ── Centre stage ── */}
      <div className={`splash-card ${phase !== 'enter' ? 'splash-card-in' : ''}`}>

        {/* ── Orbital ring system ── */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-8">

          {/* Outer slow ring */}
          <svg className="absolute inset-0 w-full h-full" style={{ animation: 'splashSpin 2.8s linear infinite' }} viewBox="0 0 176 176">
            <defs>
              <linearGradient id="sp-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity="0" />
                <stop offset="35%"  stopColor="#8b5cf6" />
                <stop offset="70%"  stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="88" cy="88" r="80" fill="none" stroke="rgba(99,102,241,0.07)" strokeWidth="5" />
            {/* Glowing arc */}
            <circle cx="88" cy="88" r="80" fill="none" stroke="url(#sp-g1)" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="380" strokeDashoffset="95" />
          </svg>

          {/* Middle counter-ring */}
          <svg className="absolute" style={{ width: '72%', height: '72%', top: '14%', left: '14%', animation: 'splashSpinRev 2s linear infinite' }} viewBox="0 0 128 128">
            <defs>
              <linearGradient id="sp-g2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0" />
                <stop offset="60%"  stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="4.5" />
            <circle cx="64" cy="64" r="56" fill="none" stroke="url(#sp-g2)" strokeWidth="4" strokeLinecap="round" strokeDasharray="220" strokeDashoffset="140" />
          </svg>

          {/* Inner fast ring */}
          <svg className="absolute" style={{ width: '46%', height: '46%', top: '27%', left: '27%', animation: 'splashSpin 1s linear infinite' }} viewBox="0 0 80 80">
            <defs>
              <linearGradient id="sp-g3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(6,182,212,0.07)" strokeWidth="4" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#sp-g3)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="110" strokeDashoffset="75" />
          </svg>

          {/* Orbiting glow dot — outer ring */}
          <div className="absolute inset-0" style={{ animation: 'splashSpin 2.8s linear infinite' }}>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-violet-400 shadow-[0_0_14px_6px_rgba(139,92,246,0.7)]" />
          </div>
          {/* Counter orbiting dot */}
          <div className="absolute inset-0" style={{ animation: 'splashSpinRev 2s linear infinite' }}>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_5px_rgba(245,158,11,0.7)]" />
          </div>
          {/* Third orbiting dot — inner */}
          <div className="absolute" style={{ width: '46%', height: '46%', top: '27%', left: '27%', animation: 'splashSpin 1s linear infinite' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_4px_rgba(6,182,212,0.8)]" />
          </div>

          {/* ── Logo centre ── */}
          <div
            className="relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #1a1d2e, #0c0e17)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 40px rgba(99,102,241,0.25), 0 0 80px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation: 'centerPulseSplash 2.2s ease-in-out infinite',
            }}
          >
            <img
              src="/logo.png"
              alt="ProjectBridge"
              className={`w-14 h-14 object-contain splash-logo ${phase === 'pulse' ? 'splash-logo-pulse' : ''}`}
              draggable={false}
            />
          </div>
        </div>

        {/* Brand name */}
        <h1
          className="font-display font-black text-2xl tracking-tight text-white mb-1"
          style={{ textShadow: '0 0 30px rgba(99,102,241,0.5)' }}
        >
          Project<span style={{ color: '#06b6d4' }}>Bridge</span>
        </h1>

        {/* Tagline */}
        <p className={`splash-tagline ${phase !== 'enter' ? 'splash-tagline-in' : ''}`}>
          Connect. Build. Deliver.
        </p>

        {/* ── Thin glow progress bar ── */}
        <div className="splash-progress-track">
          <div className={`splash-progress-bar ${phase !== 'enter' ? 'splash-progress-run' : ''}`} />
        </div>

        {/* 3 pulsing dots */}
        <div className="splash-dots">
          <span className="splash-dot" style={{ '--d': '0s' }} />
          <span className="splash-dot" style={{ '--d': '0.18s' }} />
          <span className="splash-dot" style={{ '--d': '0.36s' }} />
        </div>
      </div>

      {/* Sweep exit overlay */}
      <div className={`splash-sweep ${phase === 'exit' ? 'splash-sweep-go' : ''}`} />

      <style>{`
        @keyframes splashSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes splashSpinRev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes centerPulseSplash {
          0%, 100% { box-shadow: 0 0 40px rgba(99,102,241,0.25), 0 0 80px rgba(99,102,241,0.1); }
          50%       { box-shadow: 0 0 60px rgba(99,102,241,0.45), 0 0 100px rgba(99,102,241,0.2); }
        }
      `}</style>
    </div>
  );
}
