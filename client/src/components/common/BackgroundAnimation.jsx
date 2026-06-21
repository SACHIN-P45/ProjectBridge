import React from 'react';

export default function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-custom-blob {
          animation: custom-blob 12s infinite alternate ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />
      
      {/* Animated Glowing Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-brand-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-custom-blob top-0 -left-48" />
      <div className="absolute w-[700px] h-[700px] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-custom-blob animation-delay-2000 top-20 -right-20" />
      <div className="absolute w-[500px] h-[500px] bg-pink-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-custom-blob animation-delay-4000 bottom-0 left-20" />
      
      {/* Dynamic Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
    </div>
  );
}
