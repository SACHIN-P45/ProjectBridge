import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProjects } from '../../store/slices/projectSlice';
import { fetchEarnings } from '../../store/slices/paymentSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Link } from 'react-router-dom';
import {
  Briefcase, DollarSign, Star, TrendingUp, Search, CheckCircle,
  Clock, MessageSquare, Code2, ArrowRight, Zap, GitBranch,
  Award, Activity, ChevronRight, Target, Flame, BarChart2,
  Shield, Cpu, Globe, Layers
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/* ── Animated counter hook ── */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    if (!numeric) { setCount(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numeric));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

/* ── Circular progress ring ── */
function RingProgress({ value = 0, max = 100, size = 88, stroke = 7, color = '#7c3aed', label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <div className="dev-ring-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="dev-ring-svg">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          strokeWidth={stroke} className="dev-ring-track" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          className="dev-ring-progress" />
      </svg>
      <div className="dev-ring-label">
        <span className="dev-ring-value">{label}</span>
        {sublabel && <span className="dev-ring-sub">{sublabel}</span>}
      </div>
    </div>
  );
}

/* ── Spark line mini chart ── */
function SparkLine({ data = [3, 7, 5, 9, 6, 8, 10], color = '#7c3aed' }) {
  const h = 36, w = 100;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="dev-spark" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Activity feed item ── */
function ActivityItem({ icon: Icon, color, bg, title, sub, time, last }) {
  return (
    <div className={`dev-activity-item ${last ? 'last' : ''}`}>
      <div className="dev-activity-dot-col">
        <div className="dev-activity-dot" style={{ background: bg }}>
          <Icon size={12} style={{ color }} />
        </div>
        {!last && <div className="dev-activity-line" />}
      </div>
      <div className="dev-activity-content">
        <p className="dev-activity-title">{title}</p>
        <p className="dev-activity-sub">{sub}</p>
      </div>
      <span className="dev-activity-time">{time}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function DevDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myProjects } = useSelector((s) => s.projects);
  const { earnings } = useSelector((s) => s.payment);
  const [greeting, setGreeting] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    dispatch(fetchMyProjects());
    dispatch(fetchEarnings());
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, [dispatch]);

  const active = myProjects.filter(p => p.status === 'in-progress');
  const completed = myProjects.filter(p => p.status === 'completed');
  const totalEarnings = earnings?.totalEarnings || 0;
  const paymentCount = earnings?.payments?.length || 0;
  const avgPerProject = paymentCount ? Math.round(totalEarnings / paymentCount) : 0;
  const rating = user?.rating ? user.rating : null;
  const successRate = myProjects.length ? Math.round((completed.length / myProjects.length) * 100) : 0;

  const statCards = [
    {
      label: 'Active Projects',
      value: active.length,
      prefix: '',
      icon: Briefcase,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      glow: 'rgba(99,102,241,0.35)',
      spark: [1, 2, active.length + 1, active.length, active.length + 2, active.length, active.length],
      sparkColor: '#818cf8',
      trend: '+2 this week',
      link: '/developer/assigned',
    },
    {
      label: 'Completed',
      value: completed.length,
      prefix: '',
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      glow: 'rgba(16,185,129,0.35)',
      spark: [0, 1, 1, 2, completed.length - 1, completed.length, completed.length],
      sparkColor: '#34d399',
      trend: 'All delivered',
      link: '/developer/assigned',
    },
    {
      label: 'Total Earned',
      value: totalEarnings,
      prefix: '₹',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      glow: 'rgba(245,158,11,0.35)',
      spark: [20, 40, 35, 60, 55, 80, totalEarnings / 1000 || 10],
      sparkColor: '#fbbf24',
      trend: `Avg ₹${avgPerProject}`,
      link: '/developer/earnings',
    },
    {
      label: 'Rating',
      value: rating ? rating.toFixed(1) : '—',
      prefix: '',
      suffix: rating ? ' ★' : '',
      icon: Star,
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      glow: 'rgba(236,72,153,0.35)',
      spark: [3, 3.5, 4, 3.8, 4.2, 4.5, rating || 4.5],
      sparkColor: '#f472b6',
      trend: rating ? 'Top performer' : 'New developer',
      link: '/developer/profile',
    },
  ];

  const quickActions = [
    { icon: Search, label: 'Browse Jobs', sub: 'Find projects', to: '/developer/browse', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { icon: TrendingUp, label: 'My Bids', sub: 'Track proposals', to: '/developer/bids', grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
    { icon: MessageSquare, label: 'Messages', sub: 'Client chat', to: '/developer/messages', grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
    { icon: DollarSign, label: 'Withdraw', sub: 'Manage earnings', to: '/developer/earnings', grad: 'linear-gradient(135deg,#10b981,#059669)' },
  ];

  const activities = [
    { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)', title: 'Project milestone delivered', sub: 'Client reviewed your submission', time: '2h ago' },
    { icon: MessageSquare, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', title: 'New message received', sub: 'From client on React Dashboard', time: '5h ago' },
    { icon: DollarSign, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', title: 'Payment released', sub: `${formatCurrency(avgPerProject)} credited`, time: 'Yesterday' },
    { icon: Star, color: '#ec4899', bg: 'rgba(236,72,153,0.15)', title: 'New 5★ review', sub: 'Excellent work and communication!', time: '2d ago' },
    { icon: GitBranch, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', title: 'Bid accepted', sub: 'Mobile App Redesign project', time: '3d ago' },
  ];

  const skills = [
    { label: 'React / Next.js', pct: 92, color: '#6366f1' },
    { label: 'Node.js / Express', pct: 85, color: '#10b981' },
    { label: 'UI / UX Design', pct: 78, color: '#ec4899' },
    { label: 'Database / API', pct: 80, color: '#f59e0b' },
  ];

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <DashboardLayout title="Developer Workspace">
      <style>{`
        /* ─── Hero ─── */
        .dev-hero {
          position: relative;
          border-radius: 24px;
          padding: 36px 40px;
          margin-bottom: 28px;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #24243e 100%);
          border: 1px solid rgba(139,92,246,0.25);
          box-shadow: 0 20px 60px rgba(99,102,241,0.2), 0 0 0 1px rgba(255,255,255,0.05) inset;
        }
        .dev-hero-mesh {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(139,92,246,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 20% 80%, rgba(99,102,241,0.2) 0%, transparent 60%),
            radial-gradient(ellipse 30% 40% at 60% 60%, rgba(236,72,153,0.1) 0%, transparent 50%);
        }
        .dev-hero-grid {
          position: absolute; inset: 0; z-index: 0; opacity: 0.04;
          background-image: linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .dev-hero-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .dev-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 999px;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.35);
          color: #a78bfa; font-size: 11px; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; margin-bottom: 14px;
        }
        .dev-hero-greeting { color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 500; margin-bottom: 6px; }
        .dev-hero-name { font-size: 38px; font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 10px; letter-spacing: -1px; }
        .dev-hero-name span {
          background: linear-gradient(135deg, #a78bfa, #f472b6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .dev-hero-sub { color: rgba(255,255,255,0.5); font-size: 15px; max-width: 400px; line-height: 1.6; }
        .dev-hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }
        .dev-hero-clock {
          text-align: right; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 600;
          letter-spacing: .05em; text-transform: uppercase;
        }
        .dev-hero-clock strong { display: block; font-size: 28px; font-weight: 800; color: rgba(255,255,255,0.85); letter-spacing: -0.5px; }
        .dev-hero-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-weight: 700; font-size: 14px;
          box-shadow: 0 8px 24px rgba(99,102,241,0.45);
          transition: transform .2s, box-shadow .2s;
          text-decoration: none;
        }
        .dev-hero-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,0.55); }
        .dev-hero-pill {
          position: absolute; top: 20px; right: 20px;
          display: flex; align-items: center; gap: 6px;
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
          border-radius: 999px; padding: 4px 12px; z-index: 3;
        }
        .dev-hero-pill-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        .dev-hero-pill-text { font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: .06em; }

        /* ─── Stat Cards ─── */
        .dev-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
        @media (max-width: 1200px) { .dev-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .dev-stats-grid { grid-template-columns: 1fr; } }
        .dev-stat-card {
          position: relative; border-radius: 20px; padding: 22px 22px 18px;
          background: var(--card); border: 1px solid var(--border);
          overflow: hidden; cursor: pointer; text-decoration: none;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          display: block;
        }
        .dev-stat-card:hover { transform: translateY(-4px); border-color: transparent; }
        .dev-stat-glow {
          position: absolute; inset: 0; z-index: 0; border-radius: 20px; opacity: 0;
          transition: opacity .3s;
        }
        .dev-stat-card:hover .dev-stat-glow { opacity: 1; }
        .dev-stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; position: relative; z-index: 1; }
        .dev-stat-icon-wrap {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          transition: transform .25s;
        }
        .dev-stat-card:hover .dev-stat-icon-wrap { transform: scale(1.1) rotate(5deg); }
        .dev-stat-trend { font-size: 11px; font-weight: 700; color: var(--text-muted); background: var(--bg-secondary); border: 1px solid var(--border); padding: 3px 9px; border-radius: 999px; }
        .dev-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); margin-bottom: 4px; position: relative; z-index: 1; }
        .dev-stat-value { font-size: 32px; font-weight: 900; color: var(--text); letter-spacing: -1px; line-height: 1; position: relative; z-index: 1; margin-bottom: 12px; }
        .dev-stat-spark { position: relative; z-index: 1; margin-bottom: 6px; }
        .dev-spark { width: 100%; height: 36px; display: block; }
        .dev-stat-footer { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
        .dev-stat-link-text { font-size: 12px; font-weight: 700; opacity: 0; transform: translateX(-6px); transition: opacity .25s, transform .25s; display: flex; align-items: center; gap: 4px; }
        .dev-stat-card:hover .dev-stat-link-text { opacity: 1; transform: translateX(0); }

        /* ─── Main Grid ─── */
        .dev-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 22px; }
        @media (max-width: 1100px) { .dev-main-grid { grid-template-columns: 1fr; } }

        /* ─── Section header ─── */
        .dev-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .dev-section-title { font-size: 18px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px; letter-spacing: -.3px; }
        .dev-section-link { font-size: 12px; font-weight: 700; color: #6366f1; display: flex; align-items: center; gap: 4px; text-decoration: none; padding: 5px 12px; border-radius: 8px; background: rgba(99,102,241,0.08); transition: background .2s; }
        .dev-section-link:hover { background: rgba(99,102,241,0.16); }

        /* ─── Project cards ─── */
        .dev-project-card {
          border-radius: 16px; padding: 18px 20px;
          background: var(--card); border: 1px solid var(--border);
          transition: transform .2s, border-color .2s, box-shadow .2s;
          margin-bottom: 12px;
        }
        .dev-project-card:hover { transform: translateX(4px); border-color: rgba(99,102,241,0.4); box-shadow: -4px 0 0 0 #6366f1, 0 8px 24px rgba(0,0,0,0.06); }
        .dev-project-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .dev-project-status { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; padding: 3px 9px; border-radius: 6px; background: rgba(99,102,241,0.1); color: #6366f1; border: 1px solid rgba(99,102,241,0.2); }
        .dev-project-budget { font-size: 12px; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 3px; }
        .dev-project-title { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 4px; letter-spacing: -.2px; }
        .dev-project-client { font-size: 12px; color: var(--text-muted); font-weight: 500; }
        .dev-project-progress { height: 4px; border-radius: 999px; background: var(--border); margin: 14px 0 12px; overflow: hidden; }
        .dev-project-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 1s cubic-bezier(.4,0,.2,1); }
        .dev-project-actions { display: flex; gap: 8px; }
        .dev-project-btn {
          flex: 1; padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
          text-align: center; text-decoration: none; transition: all .2s; border: 1px solid var(--border);
          background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .dev-project-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); color: #6366f1; }
        .dev-project-btn.chat:hover { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.4); color: #8b5cf6; }

        /* ─── Empty state ─── */
        .dev-empty {
          border-radius: 20px; padding: 48px 24px;
          border: 2px dashed var(--border);
          background: var(--card); text-align: center;
        }
        .dev-empty-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .dev-empty h4 { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .dev-empty p { font-size: 14px; color: var(--text-muted); max-width: 280px; margin: 0 auto 20px; line-height: 1.6; }

        /* ─── Right sidebar panels ─── */
        .dev-panel { border-radius: 20px; padding: 20px; background: var(--card); border: 1px solid var(--border); margin-bottom: 18px; }
        .dev-panel-title { font-size: 14px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px; margin-bottom: 16px; letter-spacing: -.2px; }

        /* ─── Quick actions ─── */
        .dev-qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .dev-qa-btn {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          gap: 8px; padding: 14px 10px; border-radius: 14px; text-decoration: none;
          border: 1px solid var(--border); background: var(--bg);
          transition: transform .2s, box-shadow .2s, border-color .2s;
          position: relative; overflow: hidden;
        }
        .dev-qa-btn:hover { transform: translateY(-3px); border-color: transparent; }
        .dev-qa-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .dev-qa-label { font-size: 12px; font-weight: 800; color: var(--text); }
        .dev-qa-sub { font-size: 10px; color: var(--text-muted); font-weight: 500; }

        /* ─── Earnings panel ─── */
        .dev-earn-panel {
          border-radius: 20px; padding: 22px;
          background: linear-gradient(145deg, #0a2a1a, #0d2d1e);
          border: 1px solid rgba(16,185,129,0.25);
          margin-bottom: 18px; position: relative; overflow: hidden;
        }
        .dev-earn-bg { position: absolute; bottom: -20px; right: -20px; opacity: 0.06; }
        .dev-earn-amount { font-size: 34px; font-weight: 900; color: #34d399; letter-spacing: -1.5px; margin: 8px 0 4px; }
        .dev-earn-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: rgba(52,211,153,0.6); }
        .dev-earn-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid rgba(16,185,129,0.12); }
        .dev-earn-row-key { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.45); }
        .dev-earn-row-val { font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.75); }
        .dev-earn-cta {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 12px; border-radius: 12px; margin-top: 14px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-size: 13px; font-weight: 800;
          text-decoration: none; transition: opacity .2s, transform .2s;
          box-shadow: 0 6px 20px rgba(16,185,129,0.35); position: relative; z-index: 1;
        }
        .dev-earn-cta:hover { opacity: .9; transform: translateY(-1px); }

        /* ─── Performance panel ─── */
        .dev-perf-rings { display: flex; align-items: center; justify-content: space-around; margin-bottom: 16px; }
        .dev-ring-wrapper { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .dev-ring-svg { transform: rotate(-90deg) scaleY(-1); }
        .dev-ring-track { opacity: 0.12; color: var(--text-muted); }
        .dev-ring-progress { transition: stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1); }
        .dev-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .dev-ring-value { font-size: 15px; font-weight: 900; color: var(--text); line-height: 1; }
        .dev-ring-sub { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

        /* ─── Skills ─── */
        .dev-skill-row { margin-bottom: 12px; }
        .dev-skill-head { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .dev-skill-name { font-size: 12px; font-weight: 700; color: var(--text); }
        .dev-skill-pct { font-size: 11px; font-weight: 800; color: var(--text-muted); }
        .dev-skill-bar { height: 6px; border-radius: 999px; background: var(--border); overflow: hidden; }
        .dev-skill-fill { height: 100%; border-radius: 999px; transition: width 1.4s cubic-bezier(.4,0,.2,1); }

        /* ─── Activity feed ─── */
        .dev-activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 2px 0 12px; }
        .dev-activity-item.last { padding-bottom: 0; }
        .dev-activity-dot-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .dev-activity-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dev-activity-line { width: 1px; flex: 1; background: var(--border); min-height: 16px; margin-top: 4px; }
        .dev-activity-content { flex: 1; min-width: 0; }
        .dev-activity-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
        .dev-activity-sub { font-size: 11px; color: var(--text-muted); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dev-activity-time { font-size: 10px; font-weight: 700; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; background: var(--bg-secondary); border: 1px solid var(--border); padding: 2px 7px; border-radius: 999px; }

        /* ─── Divider chip ─── */
        .dev-divider-chip { display: flex; align-items: center; gap: 10px; margin: 22px 0; }
        .dev-divider-chip::before, .dev-divider-chip::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .dev-chip-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em; white-space: nowrap; }

        @keyframes devFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .dev-fade-up { animation: devFadeUp .5s ease forwards; opacity: 0; }
        .dev-fade-up-1 { animation-delay: .05s; }
        .dev-fade-up-2 { animation-delay: .1s; }
        .dev-fade-up-3 { animation-delay: .15s; }
        .dev-fade-up-4 { animation-delay: .2s; }
        .dev-fade-up-5 { animation-delay: .25s; }
        .dev-fade-up-6 { animation-delay: .3s; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="dev-hero dev-fade-up dev-fade-up-1">
        <div className="dev-hero-mesh" />
        <div className="dev-hero-grid" />
        <div className="dev-hero-pill">
          <div className="dev-hero-pill-dot" />
          <span className="dev-hero-pill-text">Online</span>
        </div>
        <div className="dev-hero-content">
          <div>
            <div className="dev-hero-badge"><Code2 size={13} /> Developer Workspace</div>
            <p className="dev-hero-greeting">{greeting},</p>
            <h2 className="dev-hero-name">
              {user?.name?.split(' ')[0] || 'Developer'}<span>.</span>
            </h2>
            <p className="dev-hero-sub">
              You have <strong style={{ color: '#a78bfa' }}>{active.length} active project{active.length !== 1 ? 's' : ''}</strong> in progress.
              Your next big opportunity is just a bid away.
            </p>
          </div>
          <div className="dev-hero-right">
            <div className="dev-hero-clock">
              <strong>{timeStr}</strong>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <Link to="/developer/browse" className="dev-hero-cta">
              <Search size={16} /> Explore Projects <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dev-stats-grid">
        {statCards.map(({ label, value, prefix = '', suffix = '', icon: Icon, gradient, glow, spark, sparkColor, trend, link }, i) => (
          <Link key={label} to={link} className={`dev-stat-card dev-fade-up dev-fade-up-${i + 2}`}
            style={{ '--hover-shadow': `0 16px 40px ${glow}` }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 16px 40px ${glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <div className="dev-stat-glow" style={{ background: `radial-gradient(ellipse at top right, ${glow}, transparent 70%)` }} />
            <div className="dev-stat-top">
              <div className="dev-stat-icon-wrap" style={{ background: gradient }}>
                <Icon size={22} color="#fff" />
              </div>
              <span className="dev-stat-trend">{trend}</span>
            </div>
            <p className="dev-stat-label">{label}</p>
            <p className="dev-stat-value">{prefix}{value}{suffix}</p>
            <div className="dev-stat-spark">
              <SparkLine data={spark.map(v => v || 0.5)} color={sparkColor} />
            </div>
            <div className="dev-stat-footer">
              <span className="dev-stat-link-text" style={{ color: sparkColor }}>
                View details <ChevronRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="dev-main-grid">

        {/* ─ Left: Projects + Activity ─ */}
        <div>
          {/* Active Projects */}
          <div className="dev-fade-up dev-fade-up-3">
            <div className="dev-section-head">
              <h3 className="dev-section-title">
                <Clock size={20} color="#6366f1" /> Current Workspace
              </h3>
              <Link to="/developer/assigned" className="dev-section-link">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {active.length === 0 ? (
              <div className="dev-empty">
                <div className="dev-empty-icon"><Briefcase size={32} color="#6366f1" /></div>
                <h4>No active projects yet</h4>
                <p>Your workspace is clear. Start bidding on exciting projects to build your portfolio.</p>
                <Link to="/developer/browse" className="btn-primary" style={{ display: 'inline-flex' }}>
                  <Search size={15} /> Browse Open Projects
                </Link>
              </div>
            ) : (
              <div>
                {active.slice(0, 4).map((project, i) => {
                  const progress = Math.min(20 + i * 18, 80);
                  return (
                    <div key={project._id} className="dev-project-card">
                      <div className="dev-project-meta">
                        <span className="dev-project-status">{project.status.replace('-', ' ')}</span>
                        <span className="dev-project-budget">
                          <DollarSign size={12} /> {formatCurrency(project.budget)}
                        </span>
                      </div>
                      <h4 className="dev-project-title">{project.title}</h4>
                      <p className="dev-project-client">Client: {project.student?.name}</p>
                      <div className="dev-project-progress">
                        <div className="dev-project-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1' }}>{progress}% complete</span>
                      </div>
                      <div className="dev-project-actions">
                        <Link to={`/developer/submit/${project._id}`} className="dev-project-btn">
                          <Activity size={13} /> Update Status
                        </Link>
                        <Link to={`/developer/messages?user=${project.student?._id}`} className="dev-project-btn chat">
                          <MessageSquare size={13} /> Chat
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="dev-divider-chip">
            <span className="dev-chip-label">Recent Activity</span>
          </div>

          {/* Activity Feed */}
          <div className="dev-panel dev-fade-up dev-fade-up-4">
            <div className="dev-panel-title">
              <Activity size={17} color="#6366f1" /> Activity Timeline
            </div>
            {activities.map((a, i) => (
              <ActivityItem key={i} {...a} last={i === activities.length - 1} />
            ))}
          </div>
        </div>

        {/* ─ Right Column ─ */}
        <div>

          {/* Performance Panel */}
          <div className="dev-panel dev-fade-up dev-fade-up-3">
            <div className="dev-panel-title">
              <BarChart2 size={17} color="#ec4899" /> Performance
            </div>
            <div className="dev-perf-rings">
              <div style={{ textAlign: 'center' }}>
                <RingProgress value={successRate} max={100} size={84} color="#6366f1" label={`${successRate}%`} sublabel="Success" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <RingProgress value={rating ? rating * 20 : 0} max={100} size={84} color="#ec4899"
                  label={rating ? `${rating.toFixed(1)}★` : 'New'} sublabel="Rating" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <RingProgress value={myProjects.length} max={Math.max(myProjects.length, 10)} size={84} color="#10b981"
                  label={myProjects.length} sublabel="Total" />
              </div>
            </div>

            <div className="dev-divider-chip" style={{ margin: '12px 0' }}>
              <span className="dev-chip-label">Skills</span>
            </div>

            {skills.map(({ label, pct, color }) => (
              <div key={label} className="dev-skill-row">
                <div className="dev-skill-head">
                  <span className="dev-skill-name">{label}</span>
                  <span className="dev-skill-pct">{pct}%</span>
                </div>
                <div className="dev-skill-bar">
                  <div className="dev-skill-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="dev-panel dev-fade-up dev-fade-up-4">
            <div className="dev-panel-title">
              <Zap size={17} color="#f59e0b" /> Quick Actions
            </div>
            <div className="dev-qa-grid">
              {quickActions.map(({ icon: Icon, label, sub, to, grad }) => (
                <Link key={to} to={to} className="dev-qa-btn"
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  <div className="dev-qa-icon" style={{ background: grad }}>
                    <Icon size={18} color="#fff" />
                  </div>
                  <span className="dev-qa-label">{label}</span>
                  <span className="dev-qa-sub">{sub}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Earnings Panel */}
          <div className="dev-earn-panel dev-fade-up dev-fade-up-5">
            <div className="dev-earn-bg"><DollarSign size={140} color="#10b981" /></div>
            <div className="dev-panel-title" style={{ color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 1 }}>
              <TrendingUp size={17} color="#34d399" /> Financial Summary
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p className="dev-earn-label">Total Withdrawable</p>
              <p className="dev-earn-amount">{formatCurrency(totalEarnings)}</p>
              <div className="dev-earn-row">
                <span className="dev-earn-row-key">Completed Projects</span>
                <span className="dev-earn-row-val">{paymentCount}</span>
              </div>
              <div className="dev-earn-row">
                <span className="dev-earn-row-key">Avg per Project</span>
                <span className="dev-earn-row-val">{formatCurrency(avgPerProject)}</span>
              </div>
              <div className="dev-earn-row">
                <span className="dev-earn-row-key">Active Value</span>
                <span className="dev-earn-row-val">
                  {formatCurrency(active.reduce((s, p) => s + (p.budget || 0), 0))}
                </span>
              </div>
              <Link to="/developer/earnings" className="dev-earn-cta">
                <DollarSign size={15} /> Withdraw Funds <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Developer Badge */}
          <div className="dev-panel dev-fade-up dev-fade-up-6"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))', borderColor: 'rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={24} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                  {rating && rating >= 4.5 ? 'Top Rated Developer' : rating ? 'Rising Talent' : 'New Developer'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {completed.length} projects completed • {rating ? `${rating.toFixed(1)}★ avg` : 'No ratings yet'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
