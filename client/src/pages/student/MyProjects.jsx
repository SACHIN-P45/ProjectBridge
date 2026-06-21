import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProjects } from '../../store/slices/projectSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle, FolderOpen, Search, Filter, Clock, CheckCircle,
  Zap, MoreVertical, ArrowRight, DollarSign, Users, Calendar,
  TrendingUp, Layers, Globe, Smartphone, Brain, BarChart2,
  Link2, Radio, Lightbulb, X, ChevronDown, Eye, MessageSquare,
  Activity, Trophy, Target, Flame
} from 'lucide-react';

/* ── Category meta ── */
const CAT = {
  web:          { emoji: '🌐', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  mobile:       { emoji: '📱', grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  ml:           { emoji: '🤖', grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
  'data-science':{ emoji: '📊', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  blockchain:   { emoji: '⛓️', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  iot:          { emoji: '📡', grad: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  other:        { emoji: '💡', grad: 'linear-gradient(135deg,#64748b,#475569)' },
};

/* ── Status config ── */
const STATUS = {
  open:         { label: 'Open',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  dot: '#60a5fa', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  'in-progress':{ label: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  dot: '#818cf8', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  testing:      { label: 'Testing',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  dot: '#fbbf24', grad: 'linear-gradient(135deg,#f59e0b,#f97316)' },
  delivered:    { label: 'Delivered',   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   dot: '#22d3ee', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  completed:    { label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  dot: '#34d399', grad: 'linear-gradient(135deg,#10b981,#059669)' },
  cancelled:    { label: 'Cancelled',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   dot: '#f87171', grad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
};

const PROGRESS = { open: 5, 'in-progress': 40, testing: 70, delivered: 90, completed: 100, cancelled: 0 };

const GROUPS = [
  { key: 'active',    label: 'Active',    icon: Activity,     color: '#6366f1', statuses: ['in-progress','testing'] },
  { key: 'open',      label: 'Open',      icon: Target,       color: '#3b82f6', statuses: ['open'] },
  { key: 'delivered', label: 'Delivered', icon: Zap,          color: '#06b6d4', statuses: ['delivered'] },
  { key: 'completed', label: 'Completed', icon: Trophy,       color: '#10b981', statuses: ['completed'] },
  { key: 'cancelled', label: 'Cancelled', icon: X,            color: '#ef4444', statuses: ['cancelled'] },
];

/* ── Premium project card ── */
function ProjectCard({ project, idx }) {
  const navigate = useNavigate();
  const sm  = STATUS[project.status] || STATUS.open;
  const cat = CAT[project.category]  || CAT.other;
  const pct = PROGRESS[project.status] || 0;
  const days = Math.ceil((new Date(project.deadline) - new Date()) / 86400000);
  const overdue = days <= 0;
  const urgent  = days > 0 && days <= 3;

  return (
    <div
      className="mp-card"
      style={{ animationDelay: `${idx * 0.06}s` }}
      onClick={() => navigate(`/student/projects/${project._id}`)}
    >
      {/* Top gradient accent */}
      <div className="mp-card-accent" style={{ background: sm.grad }} />

      {/* Card body */}
      <div className="mp-card-body">
        {/* Header */}
        <div className="mp-card-header">
          <div className="mp-cat-icon" style={{ background: cat.grad }}>
            <span style={{ fontSize: 20 }}>{cat.emoji}</span>
          </div>
          <div className="mp-status-chip" style={{ background: sm.bg, color: sm.color, border: `1.5px solid ${sm.border}` }}>
            <span className="mp-status-dot" style={{ background: sm.dot }} />
            {sm.label}
          </div>
        </div>

        {/* Title */}
        <h3 className="mp-title">{project.title}</h3>
        {project.description && (
          <p className="mp-desc">{project.description}</p>
        )}

        {/* Tech chips */}
        {project.techStack?.length > 0 && (
          <div className="mp-tech-row">
            {project.techStack.slice(0, 3).map(t => (
              <span key={t} className="mp-tech">{t}</span>
            ))}
            {project.techStack.length > 3 && (
              <span className="mp-tech mp-tech-more">+{project.techStack.length - 3}</span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="mp-progress-wrap">
          <div className="mp-progress-head">
            <span className="mp-progress-label">Progress</span>
            <span className="mp-progress-pct" style={{ color: sm.color }}>{pct}%</span>
          </div>
          <div className="mp-progress-track">
            <div className="mp-progress-fill" style={{ width: `${pct}%`, background: sm.grad }} />
          </div>
        </div>

        {/* Stats bar */}
        <div className="mp-stats-bar">
          <div className="mp-stat">
            <DollarSign size={12} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: 800 }}>₹{project.budget?.toLocaleString('en-IN')}</span>
          </div>
          <div className="mp-stat-sep" />
          <div className="mp-stat">
            <Users size={12} color="#6366f1" />
            <span>{project.bidCount || 0} bids</span>
          </div>
          <div className="mp-stat-sep" />
          <div className="mp-stat">
            <Calendar size={12} color={overdue ? '#ef4444' : urgent ? '#f59e0b' : '#64748b'} />
            <span style={{ color: overdue ? '#ef4444' : urgent ? '#f59e0b' : '' }}>
              {overdue ? 'Overdue' : urgent ? `${days}d ⚡` : `${days}d`}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mp-actions">
          <Link
            to={`/student/projects/${project._id}`}
            className="mp-btn-view"
            onClick={e => e.stopPropagation()}
          >
            <Eye size={13} /> View
          </Link>
          <Link
            to={`/student/messages`}
            className="mp-btn-chat"
            onClick={e => e.stopPropagation()}
          >
            <MessageSquare size={13} /> Chat
          </Link>
          {project.status === 'open' && (
            <Link
              to={`/student/projects/${project._id}`}
              className="mp-btn-bids"
              onClick={e => e.stopPropagation()}
            >
              <Users size={13} /> {project.bidCount || 0} Bids
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════
   MAIN PAGE
════════════════════════════ */
export default function MyProjects() {
  const dispatch = useDispatch();
  const { myProjects, loading } = useSelector(s => s.projects);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => { dispatch(fetchMyProjects()); }, [dispatch]);

  /* ── Derived counts ── */
  const total     = myProjects.length;
  const active    = myProjects.filter(p => ['in-progress','testing'].includes(p.status)).length;
  const openCount = myProjects.filter(p => p.status === 'open').length;
  const completed = myProjects.filter(p => p.status === 'completed').length;
  const totalBudget = myProjects.reduce((a, p) => a + (p.budget || 0), 0);

  /* ── Filter + search ── */
  const filtered = myProjects.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (
      filter === 'active'    ? ['in-progress','testing'].includes(p.status) :
      filter === 'open'      ? p.status === 'open' :
      filter === 'completed' ? p.status === 'completed' :
      filter === 'delivered' ? p.status === 'delivered' :
      filter === 'cancelled' ? p.status === 'cancelled' : true
    );
    return matchSearch && matchFilter;
  });

  /* ── Group for display ── */
  const displayGroups = GROUPS
    .map(g => ({ ...g, items: filtered.filter(p => g.statuses.includes(p.status)) }))
    .filter(g => g.items.length > 0);

  const hasActiveFilters = search || filter !== 'all';

  return (
    <DashboardLayout title="My Projects">
      <style>{`
        /* ── Hero ── */
        .mp-hero {
          position: relative; border-radius: 22px; padding: 28px 32px; margin-bottom: 22px;
          overflow: hidden;
          background: linear-gradient(135deg,#0f0c29 0%,#1a1040 55%,#24243e 100%);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .mp-hero-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 90% at 85% 40%, rgba(99,102,241,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 35% 60% at 10% 65%, rgba(16,185,129,0.12) 0%, transparent 60%);
        }
        .mp-hero-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .mp-hero-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 13px; border-radius: 999px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          font-size: 11px; font-weight: 700; color: #a78bfa; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 10px;
        }
        .mp-hero-title { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -1px; margin-bottom: 6px; }
        .mp-hero-title span { background: linear-gradient(135deg,#a78bfa,#34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .mp-hero-sub { font-size: 13px; color: rgba(255,255,255,0.45); }
        .mp-hero-right { display: flex; gap: 20px; flex-shrink: 0; }
        .mp-hero-stat { text-align: center; }
        .mp-hero-stat-val { font-size: 26px; font-weight: 900; color: #fff; line-height: 1; }
        .mp-hero-stat-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: .06em; margin-top: 3px; }
        .mp-hero-cta {
          display: inline-flex; align-items: center; gap: 6px; padding: 11px 20px; border-radius: 12px; margin-top: 16px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 13px; font-weight: 800;
          text-decoration: none; box-shadow: 0 5px 18px rgba(99,102,241,0.4); transition: transform .2s, opacity .2s;
        }
        .mp-hero-cta:hover { transform: translateY(-2px); opacity: .9; }

        /* ── Stats row ── */
        .mp-stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
        @media (max-width: 900px) { .mp-stat-row { grid-template-columns: repeat(2,1fr); } }
        .mp-stat-mini {
          border-radius: 16px; padding: 16px; background: var(--card); border: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px; transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .mp-stat-mini:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }
        .mp-stat-mini-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mp-stat-mini-val { font-size: 24px; font-weight: 900; color: var(--text); letter-spacing: -.5px; line-height: 1; }
        .mp-stat-mini-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

        /* ── Toolbar ── */
        .mp-toolbar {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          padding: 12px 16px; border-radius: 14px; background: var(--card); border: 1px solid var(--border); margin-bottom: 20px;
        }
        .mp-search-wrap { position: relative; flex: 1; min-width: 180px; }
        .mp-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .mp-search-input {
          width: 100%; padding: 9px 12px 9px 36px; border-radius: 10px; font-size: 13px; font-weight: 500;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text); outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .mp-search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .mp-search-input::placeholder { color: var(--text-muted); }
        .mp-filter-tabs { display: flex; gap: 4px; background: var(--bg-secondary); border-radius: 10px; padding: 3px; }
        .mp-filter-tab {
          padding: 6px 13px; border-radius: 8px; font-size: 12px; font-weight: 700;
          color: var(--text-muted); cursor: pointer; transition: all .2s; border: none; background: none; white-space: nowrap;
        }
        .mp-filter-tab.active { background: var(--card); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .mp-clear-btn {
          display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--bg-secondary);
          border: 1.5px solid var(--border); cursor: pointer; transition: all .2s;
        }
        .mp-clear-btn:hover { color: #ef4444; border-color: rgba(239,68,68,0.4); }

        /* ── Section header ── */
        .mp-sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .mp-sec-title { font-size: 16px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px; letter-spacing: -.2px; }
        .mp-sec-count {
          font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 999px;
          background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-muted);
        }
        .mp-sec-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .mp-sec-divider-line { flex: 1; height: 1px; background: var(--border); }

        /* ── Project card ── */
        .mp-card {
          border-radius: 18px; background: var(--card); border: 1px solid var(--border);
          overflow: hidden; cursor: pointer;
          transition: transform .22s, box-shadow .22s, border-color .22s;
          animation: mpFadeUp .4s ease forwards; opacity: 0;
          display: flex; flex-direction: column;
        }
        .mp-card:hover { transform: translateY(-5px); box-shadow: 0 18px 46px rgba(0,0,0,0.1); border-color: rgba(99,102,241,0.3); }
        .mp-card-accent { height: 4px; width: 100%; flex-shrink: 0; }
        .mp-card-body { padding: 16px 18px 14px; display: flex; flex-direction: column; flex: 1; }
        .mp-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .mp-cat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mp-status-chip { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
        .mp-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .mp-title { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -.2px; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35; }
        .mp-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px; flex: 1; }
        .mp-tech-row { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
        .mp-tech { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-muted); }
        .mp-tech-more { color: #6366f1; background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.2); }
        .mp-progress-wrap { margin-bottom: 12px; }
        .mp-progress-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .mp-progress-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }
        .mp-progress-pct { font-size: 11px; font-weight: 800; }
        .mp-progress-track { height: 5px; border-radius: 999px; background: var(--bg-secondary); border: 1px solid var(--border); overflow: hidden; }
        .mp-progress-fill { height: 100%; border-radius: 999px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }
        .mp-stats-bar { display: flex; align-items: center; gap: 0; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .mp-stat { display: flex; align-items: center; gap: 4px; padding: 8px 10px; font-size: 11px; font-weight: 700; color: var(--text); flex: 1; justify-content: center; }
        .mp-stat-sep { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }
        .mp-actions { display: flex; gap: 6px; }
        .mp-btn-view {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;
          padding: 8px 0; border-radius: 9px; font-size: 11px; font-weight: 700;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text-muted);
          text-decoration: none; transition: all .15s;
        }
        .mp-btn-view:hover { border-color: rgba(99,102,241,0.5); color: #6366f1; }
        .mp-btn-chat {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;
          padding: 8px 0; border-radius: 9px; font-size: 11px; font-weight: 700;
          background: rgba(139,92,246,0.08); border: 1.5px solid rgba(139,92,246,0.2); color: #8b5cf6;
          text-decoration: none; transition: all .15s;
        }
        .mp-btn-chat:hover { background: rgba(139,92,246,0.16); }
        .mp-btn-bids {
          display: flex; align-items: center; justify-content: center; gap: 4px;
          padding: 8px 12px; border-radius: 9px; font-size: 11px; font-weight: 700;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none;
          text-decoration: none; transition: opacity .15s;
        }
        .mp-btn-bids:hover { opacity: .85; }

        /* ── Grid ── */
        .mp-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
        @media (max-width: 1100px) { .mp-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 680px)  { .mp-grid { grid-template-columns: 1fr; } }

        /* ── Skeleton ── */
        .mp-skeleton { border-radius: 18px; border: 1px solid var(--border); background: var(--card); overflow: hidden; }
        .mp-sk-accent { height: 4px; background: var(--bg-secondary); }
        .mp-sk-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
        .mpsk { border-radius: 7px; background: var(--bg-secondary); animation: mpSk 1.5s ease-in-out infinite; }
        @keyframes mpSk { 0%,100%{opacity:.5;} 50%{opacity:1;} }

        /* ── Empty ── */
        .mp-empty { text-align: center; padding: 72px 24px; }
        .mp-empty-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .mp-empty h3 { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .mp-empty p { font-size: 14px; color: var(--text-muted); max-width: 300px; margin: 0 auto 22px; line-height: 1.6; }
        .mp-empty-cta {
          display: inline-flex; align-items: center; gap: 7px; padding: 12px 26px; border-radius: 13px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 14px; font-weight: 700;
          text-decoration: none; box-shadow: 0 6px 20px rgba(99,102,241,0.4); transition: opacity .2s, transform .2s;
        }
        .mp-empty-cta:hover { opacity: .9; transform: translateY(-2px); }

        /* ── Animations ── */
        @keyframes mpFadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .mp-fu1{animation:mpFadeUp .4s ease .04s forwards;opacity:0;}
        .mp-fu2{animation:mpFadeUp .4s ease .09s forwards;opacity:0;}
        .mp-fu3{animation:mpFadeUp .4s ease .13s forwards;opacity:0;}
        .mp-fu4{animation:mpFadeUp .4s ease .17s forwards;opacity:0;}
      `}</style>

      {/* ── Hero ── */}
      <div className="mp-hero mp-fu1">
        <div className="mp-hero-mesh" />
        <div className="mp-hero-content">
          <div>
            <div className="mp-hero-badge"><FolderOpen size={12} /> Project Hub</div>
            <h2 className="mp-hero-title">
              My <span>Projects</span>
            </h2>
            <p className="mp-hero-sub">
              Manage all your projects — track bids, monitor progress, and communicate with developers.
            </p>
            <Link to="/student/create-project" className="mp-hero-cta">
              <PlusCircle size={15} /> Post New Project <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mp-hero-right">
            {[
              { val: total,     label: 'Total' },
              { val: active,    label: 'Active' },
              { val: completed, label: 'Done' },
            ].map(({ val, label }) => (
              <div key={label} className="mp-hero-stat">
                <p className="mp-hero-stat-val">{val}</p>
                <p className="mp-hero-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mini stats ── */}
      <div className="mp-stat-row mp-fu2">
        {[
          { label: 'Total Projects',  val: total,         icon: Layers,       grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.25)' },
          { label: 'Active Work',     val: active,         icon: Activity,     grad: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.25)' },
          { label: 'Open Bids',       val: openCount,      icon: Target,       grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)', glow: 'rgba(59,130,246,0.25)' },
          { label: 'Total Budget',    val: `₹${(totalBudget/1000).toFixed(0)}K`, icon: DollarSign, grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.25)' },
        ].map(({ label, val, icon: Icon, grad, glow }) => (
          <div key={label} className="mp-stat-mini"
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 10px 28px ${glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <div className="mp-stat-mini-icon" style={{ background: grad }}>
              <Icon size={20} color="#fff" />
            </div>
            <div>
              <p className="mp-stat-mini-val">{val}</p>
              <p className="mp-stat-mini-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="mp-toolbar mp-fu3">
        <div className="mp-search-wrap">
          <Search size={15} className="mp-search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mp-search-input"
            placeholder="Search projects…"
          />
        </div>
        <div className="mp-filter-tabs">
          {['all','active','open','completed','delivered','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`mp-filter-tab ${filter === f ? 'active' : ''}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button className="mp-clear-btn" onClick={() => { setSearch(''); setFilter('all'); }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="mp-fu4">
        {loading ? (
          <div className="mp-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="mp-skeleton">
                <div className="mp-sk-accent" />
                <div className="mp-sk-body">
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div className="mpsk" style={{ width:36, height:36, borderRadius:10 }} />
                    <div className="mpsk" style={{ width:80, height:22, borderRadius:999 }} />
                  </div>
                  <div className="mpsk" style={{ height:16, width:'80%' }} />
                  <div className="mpsk" style={{ height:12, width:'60%' }} />
                  <div style={{ display:'flex', gap:4 }}>
                    {[50,60,45].map((w,j) => <div key={j} className="mpsk" style={{ height:20, width:w }} />)}
                  </div>
                  <div className="mpsk" style={{ height:6, borderRadius:999 }} />
                  <div className="mpsk" style={{ height:36, borderRadius:10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mp-empty">
            <div className="mp-empty-icon">
              {myProjects.length === 0
                ? <FolderOpen size={36} color="#6366f1" />
                : <Search size={36} color="#6366f1" />}
            </div>
            <h3>{myProjects.length === 0 ? 'No projects yet' : 'No projects found'}</h3>
            <p>
              {myProjects.length === 0
                ? 'Post your first project to start receiving bids from talented developers.'
                : 'Try a different search or filter to find what you\'re looking for.'}
            </p>
            {myProjects.length === 0 ? (
              <Link to="/student/create-project" className="mp-empty-cta">
                <PlusCircle size={15} /> Post Your First Project
              </Link>
            ) : (
              <button onClick={() => { setSearch(''); setFilter('all'); }} className="mp-empty-cta" style={{ border:'none', cursor:'pointer' }}>
                <X size={15} /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          displayGroups.map(group => {
            const GIcon = group.icon;
            return (
              <div key={group.key} style={{ marginBottom: 32 }}>
                {/* Section divider */}
                <div className="mp-sec-divider">
                  <div className="mp-sec-divider-line" />
                  <div className="mp-sec-title">
                    <GIcon size={16} color={group.color} />
                    <span>{group.label}</span>
                    <span className="mp-sec-count">{group.items.length}</span>
                  </div>
                  <div className="mp-sec-divider-line" />
                </div>

                <div className="mp-grid">
                  {group.items.map((p, i) => (
                    <ProjectCard key={p._id} project={p} idx={i} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer summary ── */}
      {!loading && filtered.length > 0 && (
        <div style={{
          marginTop: 8, padding: '12px 18px', borderRadius: 12,
          background: 'var(--card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--text)' }}>{total}</strong> projects
          </span>
          <Link to="/student/create-project" style={{
            display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700,
            color:'#6366f1', textDecoration:'none', padding:'5px 12px', borderRadius:8,
            background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)'
          }}>
            <PlusCircle size={13} /> New Project
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
