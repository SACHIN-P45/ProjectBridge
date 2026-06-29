import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProjects } from '../../store/slices/projectSlice';
import { fetchPaymentHistory } from '../../store/slices/paymentSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Link } from 'react-router-dom';
import {
  FolderOpen, Clock, CheckCircle, CreditCard, MessageSquare,
  PlusCircle, TrendingUp, Star, ArrowRight, ChevronRight,
  Zap, Activity, DollarSign, Users, Layers, BarChart2,
  Target, Flame, Trophy, Sparkles, Rocket, Globe
} from 'lucide-react';

/* ── Animated counter ── */
function AnimNum({ to, duration = 1000 }) {
  const [v, setV] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!to) { setV(0); return; }
    let s = null;
    const run = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf.current = requestAnimationFrame(run); else setV(to);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [to]);
  return <>{v}</>;
}

/* ── Mini sparkline ── */
function Spark({ data, color }) {
  const h = 32, w = 90;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 32, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Status display map ── */
const STATUS_MAP = {
  open:         { label: 'Open',        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)' },
  'in-progress':{ label: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.25)' },
  testing:      { label: 'Testing',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
  delivered:    { label: 'Delivered',   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.25)' },
  completed:    { label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)' },
  cancelled:    { label: 'Cancelled',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
};

/* ── Activity item ── */
function ActivityDot({ icon: Icon, color, bg, title, sub, time, isLast }) {
  return (
    <div className="sd-act-item">
      <div className="sd-act-dot-col">
        <div className="sd-act-dot" style={{ background: bg }}>
          <Icon size={12} style={{ color }} />
        </div>
        {!isLast && <div className="sd-act-line" />}
      </div>
      <div className="sd-act-body">
        <p className="sd-act-title">{title}</p>
        <p className="sd-act-sub">{sub}</p>
      </div>
      <span className="sd-act-time">{time}</span>
    </div>
  );
}

/* ════════════════════════════
   MAIN DASHBOARD
════════════════════════════ */
export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { myProjects } = useSelector(s => s.projects);
  const { history: payments } = useSelector(s => s.payment);
  const [greeting, setGreeting] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    dispatch(fetchMyProjects());
    dispatch(fetchPaymentHistory());
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, [dispatch]);

  const active    = myProjects.filter(p => ['in-progress', 'testing'].includes(p.status));
  const completed = myProjects.filter(p => p.status === 'completed');
  const open      = myProjects.filter(p => p.status === 'open');
  const pendingPay = payments.filter(p => p.status === 'pending');
  const totalSpent = payments.filter(p => p.status !== 'pending').reduce((a, p) => a + p.amount, 0);
  const successRate = myProjects.length ? Math.round((completed.length / myProjects.length) * 100) : 0;

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const statCards = [
    { label: 'Active Projects', value: active.length,    icon: Activity,      grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.32)',  spark: [0,1,active.length,active.length,active.length+1], sparkColor: '#818cf8', link: '/student/projects' },
    { label: 'Open Requests',   value: open.length,      icon: Globe,         grad: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.32)',  spark: [1,2,open.length,open.length+1,open.length], sparkColor: '#fbbf24', link: '/student/projects' },
    { label: 'Completed',       value: completed.length, icon: Trophy,        grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.32)', spark: [0,0,1,completed.length-1,completed.length], sparkColor: '#34d399', link: '/student/projects' },
    { label: 'Pending Payments',value: pendingPay.length,icon: CreditCard,    grad: 'linear-gradient(135deg,#ec4899,#f43f5e)', glow: 'rgba(236,72,153,0.32)',  spark: [1,1,pendingPay.length,pendingPay.length,pendingPay.length+1], sparkColor: '#f472b6', link: '/student/payments' },
  ];

  const quickActions = [
    { icon: PlusCircle,   label: 'Post Project',    sub: 'Start a new project', to: '/student/create-project', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { icon: FolderOpen,   label: 'My Projects',     sub: 'View all projects',   to: '/student/projects',       grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
    { icon: MessageSquare,label: 'Messages',         sub: 'Chat with devs',      to: '/student/messages',       grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
    { icon: CreditCard,   label: 'Payments',         sub: 'Transaction history', to: '/student/payments',       grad: 'linear-gradient(135deg,#10b981,#059669)' },
  ];

  const activities = [
    { icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.15)', title: 'Project marked as delivered',   sub: 'Developer submitted their work',       time: '1h ago'    },
    { icon: Users,        color: '#6366f1', bg: 'rgba(99,102,241,0.15)', title: 'New bid received',               sub: `On "${open[0]?.title || 'your project'}"`, time: '3h ago'  },
    { icon: DollarSign,   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', title: 'Payment processed',              sub: `₹${(totalSpent / Math.max(completed.length,1)).toFixed(0)} released`, time: 'Yesterday' },
    { icon: Star,         color: '#ec4899', bg: 'rgba(236,72,153,0.15)', title: 'Review reminder',                sub: 'Rate your completed project',          time: '2d ago'    },
    { icon: Rocket,       color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',  title: 'Project started',                sub: 'Developer began work today',           time: '3d ago'    },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
      <style>{`
        /* ── Hero ── */
        .sd-hero {
          position: relative; border-radius: 24px; padding: 36px 40px; margin-bottom: 26px;
          overflow: hidden;
          background: linear-gradient(135deg, #0d0a1f 0%, #12103a 45%, #1a1550 100%);
          border: 1px solid rgba(99,102,241,0.2);
          box-shadow: 0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .sd-hero-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 90% at 90% 30%, rgba(139,92,246,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 45% 70% at 10% 70%, rgba(59,130,246,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 30% 50% at 55% 55%, rgba(236,72,153,0.1) 0%, transparent 50%);
        }
        .sd-hero-grid {
          position: absolute; inset: 0; opacity: 0.03;
          background-image:
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        /* floating orbs */
        .sd-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
        }
        .sd-orb-1 { width: 200px; height: 200px; background: rgba(139,92,246,0.2); top: -60px; right: -40px; animation: sdFloat 7s ease-in-out infinite; }
        .sd-orb-2 { width: 140px; height: 140px; background: rgba(59,130,246,0.15); bottom: -40px; left: 30%; animation: sdFloat 9s ease-in-out infinite reverse; }
        @keyframes sdFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .sd-hero-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .sd-hero-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.35);
          font-size: 11px; font-weight: 700; color: #a78bfa; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 14px;
        }
        .sd-hero-greeting { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
        .sd-hero-name { font-size: 40px; font-weight: 900; color: #fff; letter-spacing: -1.5px; line-height: 1.05; margin-bottom: 12px; }
        .sd-hero-name span {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #f472b6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sd-hero-sub { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.6; max-width: 400px; margin-bottom: 24px; }
        .sd-hero-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .sd-hero-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: 14px; font-size: 14px; font-weight: 800;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; text-decoration: none;
          box-shadow: 0 8px 24px rgba(99,102,241,0.5); transition: transform .2s, box-shadow .2s;
        }
        .sd-hero-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,0.6); }
        .sd-hero-cta-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 13px 20px; border-radius: 14px; font-size: 14px; font-weight: 700;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); text-decoration: none;
          transition: background .2s, border-color .2s;
        }
        .sd-hero-cta-ghost:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); }
        .sd-hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; flex-shrink: 0; }
        .sd-hero-clock {
          text-align: right; color: rgba(255,255,255,0.35); font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .06em;
        }
        .sd-hero-clock strong { display: block; font-size: 30px; font-weight: 900; color: rgba(255,255,255,0.8); letter-spacing: -1px; }
        .sd-hero-stat-mini { display: flex; gap: 20px; }
        .sd-hero-mini-stat { text-align: center; }
        .sd-hero-mini-val { font-size: 22px; font-weight: 900; color: #fff; line-height: 1; }
        .sd-hero-mini-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: .06em; margin-top: 3px; }
        .sd-online-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
          border-radius: 999px; padding: 5px 12px;
        }
        .sd-online-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        .sd-online-text { font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: .06em; }

        /* ── Stat cards ── */
        .sd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 1100px) { .sd-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 580px)  { .sd-stats { grid-template-columns: 1fr 1fr; } }
        .sd-stat-card {
          border-radius: 20px; padding: 20px; background: var(--card); border: 1px solid var(--border);
          text-decoration: none; display: block; position: relative; overflow: hidden;
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .sd-stat-card:hover { transform: translateY(-5px); border-color: transparent; }
        .sd-stat-glow { position: absolute; inset: 0; border-radius: 20px; opacity: 0; transition: opacity .3s; }
        .sd-stat-card:hover .sd-stat-glow { opacity: 1; }
        .sd-stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; position: relative; z-index: 1; }
        .sd-stat-icon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: transform .25s; }
        .sd-stat-card:hover .sd-stat-icon { transform: scale(1.12) rotate(6deg); }
        .sd-stat-trend { font-size: 10px; font-weight: 700; color: var(--text-muted); background: var(--bg-secondary); border: 1px solid var(--border); padding: 3px 8px; border-radius: 999px; }
        .sd-stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); margin-bottom: 4px; position: relative; z-index: 1; }
        .sd-stat-value { font-size: 34px; font-weight: 900; color: var(--text); letter-spacing: -1.5px; line-height: 1; margin-bottom: 10px; position: relative; z-index: 1; }
        .sd-stat-spark { position: relative; z-index: 1; margin-bottom: 6px; }
        .sd-stat-footer { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
        .sd-view-link { font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 3px; opacity: 0; transform: translateX(-6px); transition: opacity .25s, transform .25s; }
        .sd-stat-card:hover .sd-view-link { opacity: 1; transform: translateX(0); }

        /* ── Main grid ── */
        .sd-main { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        @media (max-width: 1060px) { .sd-main { grid-template-columns: 1fr; } }

        /* ── Section header ── */
        .sd-sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .sd-sec-title { font-size: 16px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 7px; letter-spacing: -.2px; }
        .sd-sec-link {
          font-size: 12px; font-weight: 700; color: #6366f1; text-decoration: none;
          display: flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 8px;
          background: rgba(99,102,241,0.08); transition: background .2s;
        }
        .sd-sec-link:hover { background: rgba(99,102,241,0.16); }

        /* ── Project rows ── */
        .sd-project-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px;
          background: var(--card); border: 1px solid var(--border); margin-bottom: 9px;
          text-decoration: none; transition: transform .2s, border-color .2s, box-shadow .2s;
        }
        .sd-project-row:hover { transform: translateX(5px); border-color: rgba(99,102,241,0.35); box-shadow: -5px 0 0 0 #6366f1; }
        .sd-project-cat { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; background: var(--bg-secondary); }
        .sd-project-info { flex: 1; min-width: 0; }
        .sd-project-title { font-size: 14px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .sd-project-meta { display: flex; align-items: center; gap: 8px; }
        .sd-project-status { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: .04em; }
        .sd-project-budget { font-size: 11px; color: var(--text-muted); font-weight: 600; }
        .sd-project-right { text-align: right; flex-shrink: 0; }
        .sd-project-days { font-size: 12px; font-weight: 700; color: var(--text); }
        .sd-project-bids { font-size: 10px; color: var(--text-muted); font-weight: 600; margin-top: 2px; }

        /* ── Empty ── */
        .sd-empty { text-align: center; padding: 48px 20px; }
        .sd-empty-icon { width: 68px; height: 68px; border-radius: 50%; background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .sd-empty h4 { font-size: 17px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
        .sd-empty p { font-size: 13px; color: var(--text-muted); max-width: 240px; margin: 0 auto 16px; line-height: 1.55; }
        .sd-empty-cta {
          display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 11px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 13px; font-weight: 700;
          text-decoration: none; box-shadow: 0 5px 16px rgba(99,102,241,0.35); transition: opacity .2s, transform .2s;
        }
        .sd-empty-cta:hover { opacity: .9; transform: translateY(-1px); }

        /* ── Right col ── */
        .sd-panel { border-radius: 18px; padding: 18px; background: var(--card); border: 1px solid var(--border); margin-bottom: 16px; }
        .sd-panel-title { font-size: 14px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 7px; margin-bottom: 14px; letter-spacing: -.15px; }

        /* ── Quick actions ── */
        .sd-qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
        .sd-qa-btn {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          gap: 8px; padding: 14px 10px; border-radius: 13px; text-decoration: none;
          border: 1px solid var(--border); background: var(--bg);
          transition: transform .2s, box-shadow .2s, border-color .2s;
          position: relative; overflow: hidden;
        }
        .sd-qa-btn:hover { transform: translateY(-3px); border-color: transparent; box-shadow: 0 10px 26px rgba(0,0,0,0.1); }
        .sd-qa-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .sd-qa-label { font-size: 12px; font-weight: 800; color: var(--text); }
        .sd-qa-sub { font-size: 10px; color: var(--text-muted); font-weight: 500; }

        /* ── Stats panel ── */
        .sd-stats-panel-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-top: 1px solid var(--border); }
        .sd-stats-panel-key { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .sd-stats-panel-val { font-size: 13px; font-weight: 800; color: var(--text); }

        /* ── Spend panel ── */
        .sd-spend-panel {
          border-radius: 18px; padding: 20px; margin-bottom: 16px;
          background: linear-gradient(145deg,#0a1628,#0d1e3a);
          border: 1px solid rgba(59,130,246,0.2); position: relative; overflow: hidden;
        }
        .sd-spend-bg { position: absolute; bottom: -20px; right: -20px; opacity: 0.05; }
        .sd-spend-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: rgba(96,165,250,0.6); margin-bottom: 4px; }
        .sd-spend-val { font-size: 32px; font-weight: 900; color: #60a5fa; letter-spacing: -1.5px; margin-bottom: 12px; }
        .sd-spend-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-top: 1px solid rgba(59,130,246,0.12); }
        .sd-spend-row-key { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); }
        .sd-spend-row-val { font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.7); }
        .sd-spend-cta {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 11px; border-radius: 11px; margin-top: 12px;
          background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; font-size: 13px; font-weight: 800;
          text-decoration: none; box-shadow: 0 5px 18px rgba(59,130,246,0.3); transition: opacity .2s, transform .2s;
          position: relative; z-index: 1;
        }
        .sd-spend-cta:hover { opacity: .9; transform: translateY(-1px); }

        /* ── Activity feed ── */
        .sd-act-item { display: flex; align-items: flex-start; gap: 10px; padding: 2px 0 10px; }
        .sd-act-dot-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .sd-act-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sd-act-line { width: 1px; flex: 1; min-height: 12px; background: var(--border); margin-top: 4px; }
        .sd-act-body { flex: 1; min-width: 0; }
        .sd-act-title { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 1px; }
        .sd-act-sub { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sd-act-time { font-size: 10px; font-weight: 700; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; background: var(--bg-secondary); border: 1px solid var(--border); padding: 2px 7px; border-radius: 999px; }

        /* ── Progress ring ── */
        .sd-ring-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
        .sd-ring-svg { transform: rotate(-90deg); }
        .sd-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .sd-ring-val { font-size: 16px; font-weight: 900; color: var(--text); }
        .sd-ring-sub { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        /* ── Animations ── */
        @keyframes sdFadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
        .sd-fu1{animation:sdFadeUp .45s ease .04s forwards;opacity:0;}
        .sd-fu2{animation:sdFadeUp .45s ease .09s forwards;opacity:0;}
        .sd-fu3{animation:sdFadeUp .45s ease .13s forwards;opacity:0;}
        .sd-fu4{animation:sdFadeUp .45s ease .17s forwards;opacity:0;}
        .sd-fu5{animation:sdFadeUp .45s ease .21s forwards;opacity:0;}

        @media (max-width: 640px) {
          .sd-hero { padding: 24px 20px; border-radius: 16px; margin-bottom: 20px; }
          .sd-hero-name { font-size: 28px; }
          .sd-hero-sub { font-size: 13px; margin-bottom: 16px; }
          .sd-hero-right { align-items: flex-start; width: 100%; flex-direction: row; justify-content: space-between; border-t border-white/10 pt-4 mt-2; }
          .sd-hero-clock { text-align: left; }
          .sd-hero-clock strong { font-size: 24px; }
          .sd-hero-stat-mini { gap: 16px; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <div className="sd-hero sd-fu1">
        <div className="sd-hero-mesh" />
        <div className="sd-hero-grid" />
        <div className="sd-orb sd-orb-1" />
        <div className="sd-orb sd-orb-2" />

        <div className="sd-hero-content">
          <div>
            <div className="sd-hero-badge">
              <Sparkles size={12} /> Student Dashboard
            </div>
            <p className="sd-hero-greeting">{greeting},</p>
            <h2 className="sd-hero-name">
              {user?.name?.split(' ')[0] || 'Student'}<span>.</span>
            </h2>
            <p className="sd-hero-sub">
              You have <strong style={{ color: '#a78bfa' }}>{active.length} active project{active.length !== 1 ? 's' : ''}</strong> in progress. 
              Ready to bring your next idea to life?
            </p>
            <div className="sd-hero-cta-row">
              <Link to="/student/create-project" className="sd-hero-cta-primary">
                <PlusCircle size={17} /> Post New Project
              </Link>
              <Link to="/student/projects" className="sd-hero-cta-ghost">
                <FolderOpen size={15} /> View Projects
              </Link>
            </div>
          </div>

          <div className="sd-hero-right">
            <div className="sd-online-pill">
              <div className="sd-online-dot" />
              <span className="sd-online-text">Active</span>
            </div>
            <div className="sd-hero-clock">
              <strong>{timeStr}</strong>
              {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <div className="sd-hero-stat-mini">
              <div className="sd-hero-mini-stat">
                <p className="sd-hero-mini-val">{myProjects.length}</p>
                <p className="sd-hero-mini-label">Projects</p>
              </div>
              <div className="sd-hero-mini-stat">
                <p className="sd-hero-mini-val">{successRate}%</p>
                <p className="sd-hero-mini-label">Success</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="sd-stats sd-fu2">
        {statCards.map(({ label, value, icon: Icon, grad, glow, spark, sparkColor, link }, i) => (
          <Link key={label} to={link} className="sd-stat-card"
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 16px 40px ${glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <div className="sd-stat-glow" style={{ background: `radial-gradient(ellipse at top right, ${glow}, transparent 70%)` }} />
            <div className="sd-stat-top">
              <div className="sd-stat-icon" style={{ background: grad }}>
                <Icon size={22} color="#fff" />
              </div>
              <span className="sd-stat-trend">+{i === 3 ? pendingPay.length : i === 2 ? completed.length : i === 0 ? active.length : open.length} total</span>
            </div>
            <p className="sd-stat-label">{label}</p>
            <p className="sd-stat-value"><AnimNum to={value} /></p>
            <div className="sd-stat-spark">
              <Spark data={spark.map(v => v || 0.5)} color={sparkColor} />
            </div>
            <div className="sd-stat-footer">
              <span className="sd-view-link" style={{ color: sparkColor }}>
                View all <ChevronRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="sd-main">

        {/* ─ Left: Recent Projects + Activity ─ */}
        <div>
          {/* Recent Projects */}
          <div className="sd-fu3">
            <div className="sd-sec-head">
              <h3 className="sd-sec-title">
                <Layers size={18} color="#6366f1" /> Recent Projects
              </h3>
              <Link to="/student/projects" className="sd-sec-link">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {myProjects.length === 0 ? (
              <div className="sd-empty" style={{ background: 'var(--card)', border: '2px dashed var(--border)', borderRadius: 18 }}>
                <div className="sd-empty-icon"><FolderOpen size={30} color="#6366f1" /></div>
                <h4>No projects yet</h4>
                <p>Post your first project and connect with talented developers instantly.</p>
                <Link to="/student/create-project" className="sd-empty-cta">
                  <PlusCircle size={14} /> Post First Project
                </Link>
              </div>
            ) : (
              <div>
                {myProjects.slice(0, 5).map((project, i) => {
                  const sm = STATUS_MAP[project.status] || STATUS_MAP.open;
                  const days = Math.ceil((new Date(project.deadline) - new Date()) / 86400000);
                  const catMap = { web:'🌐', mobile:'📱', ml:'🤖', 'data-science':'📊', blockchain:'⛓️', iot:'📡', other:'💡' };
                  return (
                    <Link
                      key={project._id}
                      to={`/student/projects/${project._id}`}
                      className="sd-project-row"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="sd-project-cat">{catMap[project.category] || '💡'}</div>
                      <div className="sd-project-info">
                        <p className="sd-project-title">{project.title}</p>
                        <div className="sd-project-meta">
                          <span className="sd-project-status" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>
                            {sm.label}
                          </span>
                          <span className="sd-project-budget">₹{project.budget?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="sd-project-right">
                        <p className="sd-project-days" style={{ color: days <= 0 ? '#ef4444' : days <= 3 ? '#f59e0b' : 'var(--text)' }}>
                          {days <= 0 ? 'Expired' : `${days}d left`}
                        </p>
                        <p className="sd-project-bids">{project.bidCount || 0} bids</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.07em', whiteSpace:'nowrap' }}>
              Recent Activity
            </span>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          {/* Activity Feed */}
          <div className="sd-panel sd-fu4">
            <div className="sd-panel-title">
              <Activity size={16} color="#6366f1" /> Activity Feed
            </div>
            {activities.map((a, i) => (
              <ActivityDot key={i} {...a} isLast={i === activities.length - 1} />
            ))}
          </div>
        </div>

        {/* ─ Right col ─ */}
        <div>
          {/* Quick Actions */}
          <div className="sd-panel sd-fu3">
            <div className="sd-panel-title">
              <Zap size={16} color="#f59e0b" /> Quick Actions
            </div>
            <div className="sd-qa-grid">
              {quickActions.map(({ icon: Icon, label, sub, to, grad }) => (
                <Link key={to} to={to} className="sd-qa-btn"
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 26px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <div className="sd-qa-icon" style={{ background: grad }}>
                    <Icon size={18} color="#fff" />
                  </div>
                  <span className="sd-qa-label">{label}</span>
                  <span className="sd-qa-sub">{sub}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Spend Panel */}
          <div className="sd-spend-panel sd-fu4">
            <div className="sd-spend-bg"><DollarSign size={130} color="#3b82f6" /></div>
            <div style={{ position:'relative', zIndex:1 }}>
              <div className="sd-panel-title" style={{ color:'rgba(255,255,255,0.6)' }}>
                <BarChart2 size={16} color="#60a5fa" /> Spending Overview
              </div>
              <p className="sd-spend-label">Total Invested</p>
              <p className="sd-spend-val">₹{totalSpent.toLocaleString('en-IN')}</p>
              <div className="sd-spend-row">
                <span className="sd-spend-row-key">Completed Projects</span>
                <span className="sd-spend-row-val">{completed.length}</span>
              </div>
              <div className="sd-spend-row">
                <span className="sd-spend-row-key">Pending Payments</span>
                <span className="sd-spend-row-val">{pendingPay.length}</span>
              </div>
              <div className="sd-spend-row">
                <span className="sd-spend-row-key">Avg per Project</span>
                <span className="sd-spend-row-val">
                  ₹{completed.length ? Math.round(totalSpent / completed.length).toLocaleString('en-IN') : 0}
                </span>
              </div>
              <Link to="/student/payments" className="sd-spend-cta">
                <CreditCard size={14} /> Payment History <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Stats panel */}
          <div className="sd-panel sd-fu5">
            <div className="sd-panel-title">
              <Trophy size={16} color="#ec4899" /> Your Stats
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
              {/* success ring */}
              <div className="sd-ring-wrap">
                <svg width="80" height="80" className="sd-ring-svg">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" style={{ opacity:.1, color:'var(--text-muted)' }} />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${successRate / 100 * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                    style={{ transition:'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
                </svg>
                <div className="sd-ring-label">
                  <span className="sd-ring-val" style={{ color:'#10b981' }}>{successRate}%</span>
                  <span className="sd-ring-sub">Success</span>
                </div>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Success Rate</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>
                  {completed.length} of {myProjects.length} projects completed successfully
                </p>
              </div>
            </div>
            {[
              { key: 'Total Projects',  val: myProjects.length },
              { key: 'Active Now',      val: active.length },
              { key: 'Open Bids',       val: open.reduce((a,p) => a + (p.bidCount || 0), 0) },
            ].map(({ key, val }) => (
              <div key={key} className="sd-stats-panel-row">
                <span className="sd-stats-panel-key">{key}</span>
                <span className="sd-stats-panel-val">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
