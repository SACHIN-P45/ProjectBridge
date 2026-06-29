import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter | pulse | exit

  useEffect(() => {
    // Phase 1: Logo enters (0 → 600ms)
    // Phase 2: Pulse / progress (600ms → 2400ms)
    const pulseTimer = setTimeout(() => setPhase('pulse'), 600);
    // Phase 3: Exit (2400ms → 3000ms)
    const exitTimer = setTimeout(() => setPhase('exit'), 2400);
    // Done (3000ms)
    const doneTimer = setTimeout(() => onComplete?.(), 3000);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`splash-root ${phase === 'exit' ? 'splash-exit' : ''}`}
      aria-label="Loading ProjectBridge"
      role="status"
    >
      {/* Animated mesh background */}
      <div className="splash-mesh" />

      {/* Floating orbs */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="splash-particle" style={{ '--i': i }} />
      ))}

      {/* Center card */}
      <div className={`splash-card ${phase !== 'enter' ? 'splash-card-in' : ''}`}>
        {/* Glow ring behind logo */}
        <div className="splash-glow-ring" />

        {/* Logo */}
        <div className="splash-logo-wrap">
          <img
            src="/logo.png"
            alt="ProjectBridge"
            className={`splash-logo ${phase === 'pulse' ? 'splash-logo-pulse' : ''}`}
            draggable={false}
          />
        </div>

        {/* Tag line */}
        <p className={`splash-tagline ${phase !== 'enter' ? 'splash-tagline-in' : ''}`}>
          Connect. Build. Deliver.
        </p>

        {/* Progress track */}
        <div className="splash-progress-track">
          <div className={`splash-progress-bar ${phase !== 'enter' ? 'splash-progress-run' : ''}`} />
        </div>

        {/* Loading dots */}
        <div className="splash-dots">
          <span className="splash-dot" style={{ '--d': '0s' }} />
          <span className="splash-dot" style={{ '--d': '0.18s' }} />
          <span className="splash-dot" style={{ '--d': '0.36s' }} />
        </div>
      </div>

      {/* Sweep overlay on exit */}
      <div className={`splash-sweep ${phase === 'exit' ? 'splash-sweep-go' : ''}`} />
    </div>
  );
}
