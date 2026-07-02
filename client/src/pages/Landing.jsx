import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  ArrowRight, Code2, GraduationCap, Star, Shield, Zap, MessageSquare,
  CreditCard, CheckCircle, Globe, Github, Users, Database, Server,
  Smartphone, Cpu, Layers, TrendingUp, Lock, Award, ChevronRight,
  Sparkles, Moon, Sun, Play, LogOut, User, LayoutDashboard, FolderOpen, Menu, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─── Static Data ─────────────────────────────── */
const TECHS = ['React', 'Node.js', 'Python', 'ML / AI', 'Next.js', 'Firebase', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Flutter', 'TypeScript', 'Vue.js', 'Django', 'GraphQL'];



const STATS = [
  { value: '2,400+', label: 'Projects Delivered', color: '#6366f1' },
  { value: '850+', label: 'Expert Developers', color: '#8b5cf6' },
  { value: '98%', label: 'Client Satisfaction', color: '#10b981' },
  { value: '4.9★', label: 'Average Rating', color: '#f59e0b' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'CS Student, IIT Bombay', avatar: 'https://i.pravatar.cc/100?img=47', text: 'Got my final year ML project done in 2 weeks. Absolutely top quality — the developer even added extra features!', rating: 5 },
  { name: 'Arjun M.', role: 'Freelance Dev', avatar: 'https://i.pravatar.cc/100?img=33', text: 'ProjectBridge helped me land 12 projects in my first month. The escrow system gives both sides confidence.', rating: 5 },
  { name: 'Keerthana R.', role: 'MCA Student', avatar: 'https://i.pravatar.cc/100?img=44', text: 'The real-time chat and file sharing made collaboration super smooth. Got an A+ for my project!', rating: 5 },
];

const HOW_STEPS = [
  { num: '01', title: 'Post Your Project', desc: 'Describe requirements, set your budget & deadline, upload any reference docs.', icon: GraduationCap, color: '#6366f1' },
  { num: '02', title: 'Receive Proposals', desc: 'Expert developers review and submit competitive bids with timelines.', icon: Users, color: '#8b5cf6' },
  { num: '03', title: 'Hire & Pay Securely', desc: 'Choose your developer, funds held in secure escrow via Razorpay.', icon: Lock, color: '#10b981' },
  { num: '04', title: 'Project Delivered', desc: 'Receive source code, GitHub repo, documentation & a live demo link.', icon: CheckCircle, color: '#3b82f6' },
];

/* ─── Component ───────────────────────────────── */
export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-x-hidden font-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
        /* ── Orbit ── */
        @keyframes orbit {
          from { transform: rotate(var(--start)) translateX(var(--r)) rotate(calc(-1 * var(--start))); }
          to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--r)) rotate(calc(-1 * (var(--start) + 360deg))); }
        }
        .orbit-icon {
          position: absolute;
          top: 50%; left: 50%;
          margin-top: -28px;
          margin-left: -28px;
          animation: orbit var(--dur) var(--delay) linear infinite;
        }

        /* ── Float ── */
        @keyframes hero-float {
          0%,100% { transform: translateY(0px) rotateX(8deg) rotateY(-4deg); filter: drop-shadow(0 24px 40px rgba(99,102,241,0.35)); }
          50%      { transform: translateY(-18px) rotateX(8deg) rotateY(-4deg); filter: drop-shadow(0 50px 70px rgba(139,92,246,0.45)); }
        }
        .logo-float { animation: hero-float 7s ease-in-out infinite; transform-style: preserve-3d; }

        /* ── Blob ── */
        @keyframes blob-move {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(30px,-40px) scale(1.08); }
          66%  { transform: translate(-20px,25px) scale(0.95); }
          100% { transform: translate(0,0) scale(1); }
        }
        .bg-blob { animation: blob-move var(--bd, 12s) var(--bdelay, 0s) ease-in-out infinite alternate; }

        /* ── Marquee ── */
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { display: flex; width: max-content; animation: marquee-left 45s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        /* ── Glow border card ── */
        .glow-card {
          position: relative;
          border-radius: 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: transform .3s, box-shadow .3s;
        }
        .glow-card::before {
          content: '';
          position: absolute; inset: -1px; border-radius: inherit; z-index: 0;
          background: conic-gradient(from 0deg, transparent 0%, var(--gc, #6366f1) 20%, transparent 40%);
          opacity: 0; transition: opacity .4s;
          animation: spin-border 4s linear infinite;
        }
        @keyframes spin-border { to { transform: rotate(360deg); } }
        .glow-card:hover::before { opacity: 0.6; }
        .glow-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(99,102,241,0.15); }
        .glow-card-inner {
          position: relative; z-index: 1;
          background: var(--card);
          border-radius: calc(1.5rem - 1px);
          height: 100%;
        }

        /* ── Slide up ── */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .su { animation: slide-up .7s ease forwards; opacity: 0; }
        .su-1 { animation-delay: .05s; }
        .su-2 { animation-delay: .15s; }
        .su-3 { animation-delay: .25s; }
        .su-4 { animation-delay: .4s; }
        .su-5 { animation-delay: .55s; }

        /* ── Gradient animated text ── */
        @keyframes grad-shift {
          0%  { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }
        .animated-gradient-text {
          background: linear-gradient(270deg, #6366f1, #8b5cf6, #ec4899, #06b6d4, #10b981, #6366f1);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: grad-shift 6s ease infinite;
        }

        /* ── Stat number ── */
        @keyframes count-up {
          from { opacity: 0; transform: scale(.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        .stat-num { animation: count-up .6s ease forwards; }

        /* ── Shimmer badge ── */
        @keyframes shimmer-move {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        .shimmer-badge {
          background: linear-gradient(90deg, rgba(99,102,241,0.15) 25%, rgba(99,102,241,0.35) 50%, rgba(99,102,241,0.15) 75%);
          background-size: 200% auto;
          animation: shimmer-move 2.5s linear infinite;
        }

        /* ── Radial cursor glow ── */
        .cursor-glow {
          background: radial-gradient(
            circle at var(--mx, 50%) var(--my, 50%),
            rgba(99,102,241,0.08) 0%,
            transparent 60%
          );
          pointer-events: none;
        }
      `}} />

      {/* ══ BACKGROUND ORBS ══ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="bg-blob absolute w-[500px] h-[500px] rounded-full bg-brand-500/20 blur-[130px] -top-32 -left-32" style={{ '--bd': '14s', '--bdelay': '0s' }} />
        <div className="bg-blob absolute w-[400px] h-[400px] rounded-full bg-violet-500/20 blur-[110px] top-[40%] -right-20" style={{ '--bd': '18s', '--bdelay': '-4s' }} />
        <div className="bg-blob absolute w-[350px] h-[350px] rounded-full bg-emerald-500/15 blur-[100px] bottom-0 left-[30%]" style={{ '--bd': '10s', '--bdelay': '-8s' }} />
        <div className="bg-blob absolute w-[300px] h-[300px] rounded-full bg-pink-500/15 blur-[90px] bottom-[20%] -right-10" style={{ '--bd': '16s', '--bdelay': '-2s' }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.25,
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)',
        }} />
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-[var(--border)] shadow-sm' : ''}`}>
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="ProjectBridge Logo"
              className="h-8 sm:h-10 w-auto object-contain logo-img transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-display font-black text-lg sm:text-xl text-[var(--text)] tracking-tight">
              Project<span className="text-brand-500">Bridge</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--text-muted)]">
            {['Features', 'How It Works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-[var(--text)] transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {user ? (
              <div className="relative flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
                <Link
                  to={user.role === 'student' ? '/student/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard'}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:-translate-y-0.5"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-brand-500/50 hover:border-brand-500 transition-all focus:outline-none flex items-center justify-center"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold capitalize">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-60 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-bold text-[var(--text)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5 font-medium">{user.role}</p>
                    </div>
                    <div className="p-1">
                      <Link to={user.role === 'student' ? '/student/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard'} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"><LayoutDashboard size={16} className="text-brand-500" />My Dashboard</Link>
                      <Link to={user.role === 'admin' ? '/admin/profile' : user.role === 'student' ? '/student/profile' : '/developer/profile'} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"><User size={16} className="text-violet-500" />My Profile</Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"><LogOut size={16} />Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:flex px-4 py-2 rounded-xl font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-all text-sm">Sign In</Link>
                <Link to="/register" className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5">Get Started <ChevronRight size={15} className="hidden sm:block" /></Link>
              </>
            )}
            {/* Mobile hamburger for non-logged-in users on small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-2xl ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-1">
            {['Features', 'How It Works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors">{l}</a>
            ))}
            {!user && (
              <div className="pt-2 border-t border-[var(--border)] mt-2 space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex justify-center px-4 py-3 rounded-xl font-semibold text-sm text-[var(--text)] bg-[var(--bg-secondary)] transition-all">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-500 to-violet-600">Get Started <ArrowRight size={15} /></Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section ref={heroRef} onMouseMove={handleMouseMove}
        className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-28 pb-16 sm:pb-24 overflow-hidden z-10">
        <div className="cursor-glow absolute inset-0 z-0 transition-all duration-200"
          style={{ '--mx': `${mousePos.x}%`, '--my': `${mousePos.y}%` }} />

        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 flex flex-col lg:flex-row items-center gap-10 sm:gap-16 relative z-10">

          {/* Left: copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="su su-1 inline-flex items-center gap-2 px-4 py-2 rounded-full shimmer-badge border border-brand-500/25 text-brand-500 dark:text-brand-400 text-sm font-bold mb-8 mx-auto lg:mx-0 cursor-default">
              <Sparkles size={14} />
              The #1 Academic Project Platform
            </div>

            {/* Headline */}
            <h1 className="su su-2 font-display font-black text-[var(--text)] leading-[1.05] tracking-tighter mb-6"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}>
              Where student ideas
              <br />
              <span className="animated-gradient-text">become real products.</span>
            </h1>

            <p className="su su-3 text-base sm:text-xl text-[var(--text-muted)] leading-relaxed mb-8 sm:mb-10 font-light">
              Post your project, get bids from verified developers, collaborate in real-time, and receive a fully working application — with code, docs & live demo.
            </p>

            {/* CTAs */}
            <div className="su su-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user ? (
                <>
                  <Link to="/register"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-[0_10px_40px_rgba(99,102,241,0.4)] hover:shadow-[0_16px_50px_rgba(99,102,241,0.55)] transition-all hover:-translate-y-1">
                    Post a Project
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold text-[var(--text)] bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-brand-500/40 hover:bg-[var(--card)] transition-all hover:-translate-y-1">
                    <Play size={16} className="text-brand-500" />
                    Browse Projects
                  </Link>
                </>
              ) : user.role === 'student' ? (
                <>
                  <Link to="/student/create-project"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-[0_10px_40px_rgba(99,102,241,0.4)] hover:shadow-[0_16px_50px_rgba(99,102,241,0.55)] transition-all hover:-translate-y-1">
                    Post a Project
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/student/projects"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold text-[var(--text)] bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-brand-500/40 hover:bg-[var(--card)] transition-all hover:-translate-y-1">
                    <FolderOpen size={16} className="text-brand-500 animate-pulse" />
                    My Projects
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-[0_10px_40px_rgba(99,102,241,0.4)] hover:shadow-[0_16px_50px_rgba(99,102,241,0.55)] transition-all hover:-translate-y-1">
                    Go to Dashboard
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/developer/browse"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-black text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-[0_10px_40px_rgba(99,102,241,0.4)] hover:shadow-[0_16px_50px_rgba(99,102,241,0.55)] transition-all hover:-translate-y-1">
                    Browse Projects
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/developer/dashboard"
                    className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold text-[var(--text)] bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-brand-500/40 hover:bg-[var(--card)] transition-all hover:-translate-y-1">
                    <LayoutDashboard size={16} className="text-brand-500" />
                    My Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="su su-5 flex items-center justify-center lg:justify-start gap-6 mt-12">
              <div className="flex -space-x-3">
                {[47, 33, 44, 12].map((n, i) => (
                  <img key={i} src={`https://i.pravatar.cc/80?img=${n}`} alt=""
                    className="w-11 h-11 rounded-full border-2 border-[var(--bg)] object-cover" />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm font-bold text-[var(--text)]">Trusted by <span className="text-brand-500">2,400+</span> students</p>
              </div>
            </div>
          </div>

          {/* Right: Modern 3D Illustration Mockup */}
          <div className="flex-1 relative hidden md:flex items-center justify-center" style={{ height: 560 }}>
            {/* Rich glowing background gradient pool */}
            <div className="absolute w-[380px] h-[380px] rounded-full bg-brand-500/20 blur-[110px]" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-violet-500/20 blur-[90px]" />

            {/* 3D Mockup Card */}
            <div className="logo-float relative z-20 w-full max-w-[460px] aspect-square rounded-[2.5rem] flex items-center justify-center p-2"
              style={{
                perspective: '1000px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                border: '1.5px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 80px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}>
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden border border-white/5 relative bg-[var(--bg)]/40">
                <img src="/hero_3d_bridge.png" alt="Student and Developer Collaboration" className="w-full h-full object-cover select-none" />
                {/* Sleek overlay gradient to blend with the dark background */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/10 via-transparent to-transparent pointer-events-none" />
                {/* Glowing pulse ring */}
                <div className="absolute inset-0 rounded-[2.2rem] opacity-25"
                  style={{ background: 'radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 80%)', animation: 'blob-move 6s ease-in-out infinite' }} />
              </div>
            </div>

            {/* Floating status badges with glassmorphic styles and shadow-glow */}
            <div className="absolute top-10 -left-6 z-30 bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-transform hover:scale-105 duration-300"
              style={{ animation: 'hero-float 6s 1s ease-in-out infinite', boxShadow: '0 10px 30px rgba(16,185,129,0.15), 0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Delivered</p>
                <p className="text-sm font-black text-[var(--text)]">E-Commerce App ✓</p>
              </div>
            </div>

            <div className="absolute bottom-16 -right-6 z-30 bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-transform hover:scale-105 duration-300"
              style={{ animation: 'hero-float 6s 2.5s ease-in-out infinite', boxShadow: '0 10px 30px rgba(139,92,246,0.15), 0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">New Bid</p>
                <p className="text-sm font-black text-[var(--text)]">₹8,500 · 6 Days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAND ══ */}
      <div className="relative z-10 border-y border-[var(--border)] bg-[var(--bg-secondary)]/60 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map(({ value, label, color }, i) => (
            <div key={i} className="text-center">
              <p className="stat-num font-display font-black text-3xl sm:text-4xl mb-1 tracking-tighter"
                style={{ color }}>{value}</p>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MARQUEE ══ */}
      <div className="relative z-10 py-6 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />
        <div className="marquee-track">
          {[...TECHS, ...TECHS].map((tech, i) => (
            <div key={i} className="flex items-center gap-3 mx-8 text-[var(--text-muted)] font-display font-bold text-xl opacity-40 hover:opacity-80 hover:text-brand-500 transition-all cursor-default select-none">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* ══ BENTO FEATURES ══ */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
        <div className="w-full">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-brand-500 font-bold uppercase tracking-widest text-sm mb-4">Platform Features</p>
            <h2 className="font-display font-black text-[var(--text)] tracking-tighter mb-5"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 4rem)' }}>
              Built for students.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-violet-500 to-emerald-500">
                Trusted by developers.
              </span>
            </h2>
            <p className="text-base sm:text-xl text-[var(--text-muted)] font-light w-full max-w-3xl mx-auto">
              Every tool you need — from posting your first project to receiving a deployed live app.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5" style={{ gridAutoRows: 'minmax(220px, auto)' }}>
            {/* Big card — Real-time chat */}
            <div className="md:col-span-4 glow-card" style={{ '--gc': '#6366f1', minHeight: 340 }}>
              <div className="glow-card-inner p-10 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl" />
                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border"
                    style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)' }}>
                    <MessageSquare size={28} className="text-brand-500" />
                  </div>
                  <h3 className="font-display text-3xl font-black text-[var(--text)] mb-3">Real-Time Collaboration</h3>
                  <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-lg">
                    Instant messaging, typing indicators, read receipts and file sharing — all powered by Socket.IO. Stay perfectly synced with your developer.
                  </p>
                </div>
                {/* Mock chat UI */}
                <div className="mt-6 space-y-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-brand-500/30 flex-shrink-0" />
                    <div className="h-9 rounded-2xl rounded-tl-sm bg-[var(--bg-secondary)] border border-[var(--border)] px-4 flex items-center text-sm text-[var(--text-muted)] font-medium">Hey! The UI is ready, check it out 🚀</div>
                  </div>
                  <div className="flex gap-3 items-center justify-end">
                    <div className="h-9 rounded-2xl rounded-tr-sm px-4 flex items-center text-sm text-white font-medium" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>Looks amazing! Ship it ✓</div>
                    <div className="w-8 h-8 rounded-full bg-violet-500/30 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow card */}
            <div className="md:col-span-2 glow-card" style={{ '--gc': '#10b981', minHeight: 340 }}>
              <div className="glow-card-inner p-8 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl" />
                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border"
                    style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}>
                    <Lock size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-[var(--text)] mb-3">Escrow & Safe Payments</h3>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Pay securely via Razorpay. Funds are only released to the developer once you're 100% satisfied.
                  </p>
                </div>
                <div className="mt-6 p-4 rounded-2xl border" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <div className="flex justify-between text-xs text-[var(--text-muted)] font-bold mb-2">
                    <span>IN ESCROW</span><span className="text-emerald-500">PROTECTED</span>
                  </div>
                  <p className="font-black text-2xl text-[var(--text)]">₹15,000</p>
                </div>
              </div>
            </div>

            {/* Verified reviews */}
            <div className="md:col-span-2 glow-card" style={{ '--gc': '#f59e0b', minHeight: 220 }}>
              <div className="glow-card-inner p-8 flex flex-col justify-center h-full relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border"
                  style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' }}>
                  <Award size={24} className="text-amber-500" />
                </div>
                <h3 className="font-display text-xl font-black text-[var(--text)] mb-2">Verified Reviews</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">Rate after delivery. Build real reputation in the academic dev community.</p>
                <div className="flex gap-1 mt-4">{[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}</div>
              </div>
            </div>

            {/* Fast delivery */}
            <div className="md:col-span-2 glow-card" style={{ '--gc': '#f43f5e', minHeight: 220 }}>
              <div className="glow-card-inner p-8 flex flex-col justify-center h-full relative overflow-hidden text-center">
                <h3 className="font-display font-black text-[var(--text)] tracking-tighter mb-1" style={{ fontSize: '4rem', lineHeight: 1 }}>
                  24<span style={{ fontSize: '2rem', color: '#f43f5e' }}>h</span>
                </h3>
                <p className="font-bold text-[var(--text-muted)] uppercase tracking-widest text-xs">Average Bid Response</p>
                <div className="mt-4 flex justify-center">
                  <div className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}>Lightning Fast</div>
                </div>
              </div>
            </div>

            {/* Expert devs */}
            <div className="md:col-span-2 glow-card" style={{ '--gc': '#8b5cf6', minHeight: 220 }}>
              <div className="glow-card-inner p-8 flex flex-col justify-center h-full relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border"
                  style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)' }}>
                  <Code2 size={24} className="text-violet-500" />
                </div>
                <h3 className="font-display text-xl font-black text-[var(--text)] mb-2">Expert Developers</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">Verified professionals delivering clean, documented, deployable code every time.</p>
                <div className="flex -space-x-2 mt-4">
                  {[5, 8, 15, 22].map((n, i) => <img key={i} src={`https://i.pravatar.cc/60?img=${n}`} alt="" className="w-8 h-8 rounded-full border-2 border-[var(--bg)]" />)}
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-[var(--bg)] flex items-center justify-center text-[10px] text-violet-500 font-black">+850</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10 border-y border-[var(--border)] bg-[var(--bg-secondary)]/40 backdrop-blur-xl">
        <div className="w-full">
          <div className="text-center mb-12 sm:mb-24">
            <p className="text-violet-500 font-bold uppercase tracking-widest text-sm mb-4">Process</p>
            <h2 className="font-display font-black text-[var(--text)] tracking-tighter mb-4"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 4rem)' }}>
              Zero to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-brand-500">shipped</span> in 4 steps.
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px z-0"
              style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #10b981, #3b82f6)', opacity: 0.25 }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
              {HOW_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  {/* Icon bubble */}
                  <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8 border-2 relative transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl"
                    style={{
                      background: `${step.color}12`,
                      borderColor: `${step.color}30`,
                      boxShadow: `0 0 0 0 ${step.color}`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px ${step.color}35`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <step.icon size={44} style={{ color: step.color }} />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: step.color }}>
                      {step.num}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-black text-[var(--text)] mb-3">{step.title}</h3>
                  <p className="text-[var(--text-muted)] leading-relaxed text-base">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
        <div className="w-full">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-4">Success Stories</p>
            <h2 className="font-display font-black text-[var(--text)] tracking-tighter"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 4rem)' }}>
              Loved by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-brand-500">community</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glow-card" style={{ '--gc': '#6366f1' }}>
                <div className="glow-card-inner p-6 sm:p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-4 sm:mb-5">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} className="text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-[var(--text)] leading-relaxed font-medium text-base sm:text-lg mb-5 sm:mb-6">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 sm:pt-5 border-t border-[var(--border)]">
                    <img src={t.avatar} alt={t.name} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-brand-500/30" />
                    <div>
                      <p className="font-bold text-[var(--text)]">{t.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-brand-500/15 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-violet-500/15 blur-[100px]" />
        </div>

        <div className="w-full text-center relative">
          {/* Glowing container */}
          <div className="rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-brand-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04), rgba(16,185,129,0.04))',
              backdropFilter: 'blur(20px)',
            }}>
            <div className="absolute inset-0 rounded-[2.5rem]"
              style={{ background: 'conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)', opacity: 0.5 }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 text-brand-500 text-sm font-bold mb-8 shimmer-badge">
                <Zap size={14} className="fill-brand-500" /> Ready to launch?
              </div>

              <h2 className="font-display font-black text-[var(--text)] tracking-tighter mb-6 leading-[1.05]"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Bridge the gap between
                <br />
                <span className="animated-gradient-text">idea and reality.</span>
              </h2>

              <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                Join 2,400+ students who already got their projects built. It takes under 2 minutes to post.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register"
                  className="group flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-xl font-black text-white bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 shadow-[0_15px_50px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1">
                  Start Free Today <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="py-10 sm:py-14 px-4 sm:px-8 lg:px-16 xl:px-24 border-t border-[var(--border)] bg-[var(--bg-secondary)]/40 backdrop-blur-xl relative z-10">
        <div className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="ProjectBridge Logo"
                className="h-8 w-auto object-contain logo-img opacity-60 hover:opacity-90 transition-all duration-300 grayscale hover:grayscale-0"
              />
              <span className="font-display font-black text-lg text-[var(--text-muted)]">Project<span className="text-brand-500">Bridge</span></span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm font-semibold text-[var(--text-muted)]">
              {['Features', 'How It Works', 'Privacy', 'Terms'].map(l => (
                <a key={l} href={l === 'Privacy' || l === 'Terms' ? '#' : `#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-[var(--text)] transition-colors">{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-5">
              <Globe size={20} className="text-[var(--text-muted)] hover:text-brand-500 cursor-pointer transition-colors" />
              <Github size={20} className="text-[var(--text-muted)] hover:text-brand-500 cursor-pointer transition-colors" />
              <Users size={20} className="text-[var(--text-muted)] hover:text-brand-500 cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-[var(--border)] text-center">
            <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">© 2024 ProjectBridge. All rights reserved. Made with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

