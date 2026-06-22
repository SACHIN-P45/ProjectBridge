import { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Code, Coins, ArrowRight, User } from 'lucide-react';
import BackgroundAnimation from './BackgroundAnimation';

export default function AuthVisualShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-900 via-indigo-950 to-violet-900 relative overflow-hidden items-center justify-center p-16 select-none">
      {/* Background blobs & grid */}
      <BackgroundAnimation />

      {/* Decorative floating grids */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-white/5 rounded-3xl blur-xl animate-float-slow-1 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl animate-float-slow-2 pointer-events-none" />

      {/* Showcase Content */}
      <div className="relative z-10 w-full max-w-xl text-white flex flex-col justify-between h-full">
        {/* Header - Brand logo */}
        <div className="flex items-center gap-3 animate-fade-in">
          <img 
            src="/logo.png" 
            alt="ProjectBridge Logo" 
            className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="h-6 w-[1px] bg-white/20" />
          <span className="font-display font-bold text-lg tracking-wider text-brand-300">PROJECTBRIDGE</span>
        </div>

        {/* Centerpiece: The Animated Collaboration Bridge */}
        <div className="my-auto py-10 flex flex-col items-center">
          {/* Main Visual Platform */}
          <div className="w-full relative flex items-center justify-between mb-12 gap-4">
            
            {/* Student Card (Left) */}
            <div className={`w-[170px] rounded-2xl p-4 transition-all duration-500 transform border ${
              step >= 1 
                ? 'bg-white/10 dark:bg-black/30 border-brand-400 shadow-[0_0_25px_rgba(59,130,246,0.25)] scale-105' 
                : 'bg-white/5 dark:bg-white/5 border-white/10 opacity-70 scale-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">STUDENT</span>
                <span className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-brand-500 animate-pulse' : 'bg-white/30'}`} />
              </div>
              <div className="font-semibold text-xs text-white/90 mb-1 line-clamp-1">Machine Learning Model</div>
              <div className="text-[10px] text-white/50 mb-3 font-light">Python, Streamlit</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-300">$350</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  step >= 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {step >= 3 ? 'Assigned' : 'Open Posting'}
                </span>
              </div>
            </div>

            {/* Connecting SVG Bridge Line */}
            <div className="flex-1 relative h-20 flex items-center justify-center">
              {/* SVG connection path */}
              <svg className="w-full h-full absolute inset-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Default static connecting path */}
                <path 
                  d="M 0,50 Q 50,20 100,50" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.08)" 
                  strokeWidth="2" 
                />
                
                {/* Glowing flow animation path */}
                {step >= 2 && (
                  <path 
                    d="M 0,50 Q 50,20 100,50" 
                    fill="none" 
                    className="animate-flow-dash text-brand-400"
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' }}
                  />
                )}
              </svg>

              {/* Pulsing Match Core Indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 relative ${
                step >= 2 
                  ? 'bg-brand-500/20 border-brand-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] rotate-180 scale-110' 
                  : 'bg-white/5 border-white/10 scale-90'
              }`}>
                <Sparkles size={14} className={step >= 2 ? 'text-brand-300 animate-spin-slow' : 'text-white/30'} />
              </div>
            </div>

            {/* Developer Card (Right) */}
            <div className={`w-[170px] rounded-2xl p-4 transition-all duration-500 transform border ${
              step >= 3 
                ? 'bg-white/10 dark:bg-black/30 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.25)] scale-105' 
                : 'bg-white/5 dark:bg-white/5 border-white/10 opacity-70 scale-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 font-display">DEVELOPER</span>
                <span className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? 'bg-violet-500 animate-pulse' : 'bg-white/30'}`} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-violet-500/30 border border-violet-400/20 flex items-center justify-center">
                  <User size={12} className="text-violet-300" />
                </div>
                <div className="font-semibold text-xs text-white/90 truncate">DevAlex_99</div>
              </div>
              <div className="text-[10px] text-white/50 mb-2">⭐ 4.9 (24 Completed)</div>
              <div className="text-[9px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 py-0.5 px-2 rounded-md w-fit">
                Full Stack Expert
              </div>
            </div>

          </div>

          {/* Interactive Milestones Checklist */}
          <div className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-sm tracking-wide text-white/80 border-b border-white/10 pb-2">
              Secure Collaborative Milestones
            </h4>
            
            <div className="grid grid-cols-1 gap-3 text-xs">
              
              {/* Milestone 1 */}
              <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                step >= 1 ? 'bg-brand-500/10 border-brand-500/30' : 'border-transparent opacity-50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    step >= 1 ? 'bg-brand-500/20 text-brand-300' : 'bg-white/10 text-white/40'
                  }`}>
                    <Code size={12} />
                  </div>
                  <span className="font-medium text-white/90">Milestone 1: Project Scope Lock</span>
                </div>
                {step >= 1 ? (
                  <CheckCircle2 size={15} className="text-brand-400 animate-fade-in" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20" />
                )}
              </div>

              {/* Milestone 2 */}
              <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                step >= 4 ? 'bg-emerald-500/10 border-emerald-500/30' : 'border-transparent opacity-50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    step >= 4 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'
                  }`}>
                    <ShieldCheck size={12} />
                  </div>
                  <span className="font-medium text-white/90">Milestone 2: Escrow Funded Securely</span>
                </div>
                {step >= 4 ? (
                  <CheckCircle2 size={15} className="text-emerald-400 animate-fade-in" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20" />
                )}
              </div>

              {/* Milestone 3 */}
              <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                step === 4 ? 'bg-violet-500/15 border-violet-500/30' : 'border-transparent opacity-50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    step === 4 ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white/40'
                  }`}>
                    <Coins size={12} />
                  </div>
                  <span className="font-medium text-white/90">Milestone 3: Code Approval & Release</span>
                </div>
                {step === 4 ? (
                  <CheckCircle2 size={15} className="text-violet-400 animate-fade-in" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20" />
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-left animate-fade-in">
          <h2 className="text-3xl font-display font-black mb-3 leading-tight tracking-tight">
            Connecting ambition with expertise.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed font-light">
            ProjectBridge is the premier platform connecting students with expert developers to turn academic concepts into production-ready software.
          </p>
        </div>

      </div>
    </div>
  );
}
