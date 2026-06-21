import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProjects } from '../../store/slices/projectSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatusTimeline from '../../components/project/StatusTimeline';
import { Link } from 'react-router-dom';
import {
  Briefcase, Calendar, DollarSign, MessageSquare, Upload,
  CheckCircle, Clock, Layers, ArrowRight, Search, Zap,
  TrendingUp, Shield, Award, AlertTriangle, Star, Activity
} from 'lucide-react';

/* ── status display config ── */
const STATUS_META = {
  'in-progress': { label: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  testing:       { label: 'Testing',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', grad: 'linear-gradient(135deg,#f59e0b,#f97316)' },
  delivered:     { label: 'Delivered',   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)',  grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  completed:     { label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', grad: 'linear-gradient(135deg,#10b981,#059669)' },
};

const CAT_META = {
  web:           { emoji: '🌐', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  mobile:        { emoji: '📱', grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  ml:            { emoji: '🤖', grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
  'data-science':{ emoji: '📊', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  blockchain:    { emoji: '⛓️', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  iot:           { emoji: '📡', grad: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  other:         { emoji: '💡', grad: 'linear-gradient(135deg,#64748b,#475569)' },
};

/* ── Progress ring ── */
function ProgressRing({ pct = 0, size = 56, stroke = 5, color = '#6366f1' }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} style={{ opacity: .12, color: 'var(--text-muted)' }} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)' }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ── Project progress % based on status ── */
const PROGRESS = { 'in-progress': 30, testing: 60, delivered: 85, completed: 100 };

/* ── Single project card ── */
function ProjectCard({ project, delay }) {
  const [expanded, setExpanded] = useState(false);
  const sm    = STATUS_META[project.status] || STATUS_META['in-progress'];
  const cat   = CAT_META[project.category] || CAT_META.other;
  const pct   = PROGRESS[project.status] || 0;
  const days  = Math.ceil((new Date(project.deadline) - new Date()) / 86400000);
  const overdue = days <= 0;
  const urgent  = days > 0 && days <= 3;

  return (
    <div className="ap-card" style={{ animationDelay: delay }}>
      {/* top gradient bar */}
      <div className="ap-card-topbar" style={{ background: sm.grad }} />

      <div className="ap-card-body">
        {/* Header row */}
        <div className="ap-card-header">
          <div className="ap-card-header-left">
            {/* Category icon */}
            <div className="ap-cat-icon" style={{ background: cat.grad }}>
              <span style={{ fontSize: 20 }}>{cat.emoji}</span>
            </div>
            <div className="ap-card-titles">
              <h3 className="ap-project-title">{project.title}</h3>
              {project.student && (
                <div className="ap-client-row">
                  {project.student.avatar
                    ? <img src={project.student.avatar} alt="" className="ap-avatar" />
                    : <div className="ap-avatar-fallback">{project.student.name?.charAt(0)}</div>
                  }
                  <span className="ap-client-name">{project.student.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="ap-header-right">
            {/* Status chip */}
            <div className="ap-status-chip" style={{ background: sm.bg, color: sm.color, border: `1.5px solid ${sm.border}` }}>
              <span className="ap-status-dot" style={{ background: sm.color }} />
              {sm.label}
            </div>
            {/* Progress ring */}
            <ProgressRing pct={pct} color={sm.color} />
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="ap-desc">{project.description}</p>
        )}

        {/* Status timeline */}
        <div className="ap-timeline-wrap">
          <StatusTimeline status={project.status} />
        </div>

        {/* Stats row */}
        <div className="ap-stats-row">
          <div className="ap-stat">
            <div className="ap-stat-icon-wrap" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <DollarSign size={14} color="#10b981" />
            </div>
            <div>
              <p className="ap-stat-label">Budget</p>
              <p className="ap-stat-val" style={{ color: '#10b981' }}>₹{project.budget?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="ap-stat">
            <div className="ap-stat-icon-wrap" style={{ background: overdue ? 'rgba(239,68,68,0.1)' : urgent ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)' }}>
              <Calendar size={14} color={overdue ? '#ef4444' : urgent ? '#f59e0b' : '#6366f1'} />
            </div>
            <div>
              <p className="ap-stat-label">Deadline</p>
              <p className="ap-stat-val" style={{ color: overdue ? '#ef4444' : urgent ? '#f59e0b' : 'var(--text)' }}>
                {overdue ? 'Overdue!' : urgent ? `${days}d left ⚡` : `${days} days`}
              </p>
            </div>
          </div>

          <div className="ap-stat">
            <div className="ap-stat-icon-wrap" style={{ background: project.isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)' }}>
              <Shield size={14} color={project.isPaid ? '#10b981' : 'var(--text-muted)'} />
            </div>
            <div>
              <p className="ap-stat-label">Payment</p>
              <p className="ap-stat-val" style={{ color: project.isPaid ? '#10b981' : 'var(--text-muted)' }}>
                {project.isPaid ? '✓ Paid' : 'Pending'}
              </p>
            </div>
          </div>

          {project.techStack?.length > 0 && (
            <div className="ap-stat ap-tech-stat">
              <div className="ap-tech-chips">
                {project.techStack.slice(0, 3).map(t => (
                  <span key={t} className="ap-tech-chip">{t}</span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="ap-tech-chip ap-tech-more">+{project.techStack.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="ap-progress-section">
          <div className="ap-progress-head">
            <span className="ap-progress-label">Overall progress</span>
            <span className="ap-progress-pct" style={{ color: sm.color }}>{pct}%</span>
          </div>
          <div className="ap-progress-track">
            <div className="ap-progress-fill" style={{ width: `${pct}%`, background: sm.grad }} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="ap-actions">
          {project.status !== 'completed' && (
            <Link to={`/developer/submit/${project._id}`} className="ap-btn-primary">
              <Upload size={15} /> Submit Update <ArrowRight size={14} />
            </Link>
          )}
          <Link
            to={`/developer/messages?user=${project.student?._id}`}
            className="ap-btn-ghost"
          >
            <MessageSquare size={14} /> Chat with Client
          </Link>
          {project.status === 'completed' && (
            <div className="ap-completed-badge">
              <CheckCircle size={14} /> Project Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   MAIN PAGE
══════════════════════════ */
export default function AssignedProjects() {
  const dispatch = useDispatch();
  const { myProjects, loading } = useSelector((s) => s.projects);

  useEffect(() => { dispatch(fetchMyProjects()); }, [dispatch]);

  const assigned   = myProjects.filter(p => ['in-progress','testing','delivered','completed'].includes(p.status));
  const inProgress = assigned.filter(p => p.status === 'in-progress').length;
  const testing    = assigned.filter(p => p.status === 'testing').length;
  const delivered  = assigned.filter(p => p.status === 'delivered').length;
  const completed  = assigned.filter(p => p.status === 'completed').length;

  const statCards = [
    { label: 'Total Assigned',  value: assigned.length,  icon: Layers,       grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.3)' },
    { label: 'In Progress',     value: inProgress,        icon: Activity,     grad: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.3)' },
    { label: 'Under Review',    value: testing + delivered, icon: Search,     grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)', glow: 'rgba(6,182,212,0.3)' },
    { label: 'Completed',       value: completed,          icon: CheckCircle, grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.3)' },
  ];

  return (
    <DashboardLayout title="Assigned Projects">
      <style>{`
        /* ── Hero ── */
        .ap-hero {
          position: relative; border-radius: 22px; padding: 28px 32px; margin-bottom: 24px;
          overflow: hidden;
          background: linear-gradient(135deg,#0f0c29 0%,#1a1040 55%,#24243e 100%);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .ap-hero-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 65% 90% at 85% 50%, rgba(99,102,241,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 35% 60% at 15% 60%, rgba(16,185,129,0.12) 0%, transparent 60%);
        }
        .ap-hero-grid {
          position: absolute; inset: 0; opacity: 0.032;
          background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
          background-size: 36px 36px;
        }
        .ap-hero-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .ap-hero-badge {
          display: inline-flex; align-items: center; gap: 6px; margin-bottom: 12px;
          padding: 4px 13px; border-radius: 999px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          font-size: 11px; font-weight: 700; color: #a78bfa; letter-spacing: .07em; text-transform: uppercase;
        }
        .ap-hero-title { font-size: 30px; font-weight: 900; color: #fff; letter-spacing: -1px; margin-bottom: 8px; line-height: 1.15; }
        .ap-hero-title span { background: linear-gradient(135deg,#a78bfa,#34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ap-hero-sub { font-size: 14px; color: rgba(255,255,255,0.45); max-width: 380px; line-height: 1.6; }
        .ap-hero-pills { display: flex; gap: 10px; flex-wrap: wrap; }
        .ap-hero-pill {
          display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px;
          font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); white-space: nowrap;
        }
        .ap-hero-pill-dot { width: 7px; height: 7px; border-radius: 50%; }

        /* ── Stat cards ── */
        .ap-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
        @media (max-width: 1024px) { .ap-stats { grid-template-columns: repeat(2,1fr); } }
        .ap-stat-card {
          border-radius: 16px; padding: 18px; border: 1px solid var(--border); background: var(--card);
          position: relative; overflow: hidden; transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .ap-stat-card:hover { transform: translateY(-4px); border-color: transparent; }
        .ap-stat-card-glow { position: absolute; inset: 0; opacity: 0; border-radius: 16px; transition: opacity .3s; }
        .ap-stat-card:hover .ap-stat-card-glow { opacity: 1; }
        .ap-stat-card-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; transition: transform .25s; }
        .ap-stat-card:hover .ap-stat-card-icon { transform: scale(1.12) rotate(6deg); }
        .ap-stat-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); margin-bottom: 4px; }
        .ap-stat-card-val { font-size: 28px; font-weight: 900; color: var(--text); letter-spacing: -1px; }

        /* ── Section header ── */
        .ap-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .ap-section-title { font-size: 17px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px; letter-spacing: -.3px; }
        .ap-count-chip {
          font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;
          background: rgba(99,102,241,0.1); color: #6366f1; border: 1px solid rgba(99,102,241,0.2);
        }

        /* ── Project card ── */
        .ap-card {
          border-radius: 20px; background: var(--card); border: 1px solid var(--border);
          overflow: hidden; margin-bottom: 16px;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          animation: apFadeUp .45s ease forwards; opacity: 0;
        }
        .ap-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); border-color: rgba(99,102,241,0.25); }
        .ap-card-topbar { height: 4px; width: 100%; }
        .ap-card-body { padding: 20px 22px; }
        .ap-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
        .ap-card-header-left { display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 0; }
        .ap-cat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ap-card-titles { min-width: 0; }
        .ap-project-title { font-size: 18px; font-weight: 900; color: var(--text); letter-spacing: -.4px; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ap-client-row { display: flex; align-items: center; gap: 6px; }
        .ap-avatar { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
        .ap-avatar-fallback { width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 9px; font-weight: 800; }
        .ap-client-name { font-size: 12px; color: var(--text-muted); font-weight: 600; }
        .ap-header-right { display: flex; align-items: flex-start; gap: 12px; flex-shrink: 0; }
        .ap-status-chip { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; }
        .ap-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .ap-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ap-timeline-wrap { padding: 14px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 16px; }

        /* ── Stats row ── */
        .ap-stats-row { display: flex; align-items: center; gap: 0; margin-bottom: 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; flex-wrap: wrap; }
        .ap-stat { display: flex; align-items: center; gap: 10px; padding: 12px 16px; flex: 1; min-width: 120px; }
        .ap-stat-icon-wrap { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ap-stat-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
        .ap-stat-val { font-size: 14px; font-weight: 800; color: var(--text); }
        .ap-tech-stat { flex-direction: column; align-items: flex-start; justify-content: center; }
        .ap-tech-chips { display: flex; flex-wrap: wrap; gap: 4px; }
        .ap-tech-chip { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: var(--card); border: 1px solid var(--border); color: var(--text-muted); }
        .ap-tech-more { color: #6366f1; background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.2); }

        /* ── Progress bar ── */
        .ap-progress-section { margin-bottom: 16px; }
        .ap-progress-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .ap-progress-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; }
        .ap-progress-pct { font-size: 12px; font-weight: 900; }
        .ap-progress-track { height: 7px; border-radius: 999px; background: var(--bg-secondary); overflow: hidden; border: 1px solid var(--border); }
        .ap-progress-fill { height: 100%; border-radius: 999px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }

        /* ── Actions ── */
        .ap-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .ap-btn-primary {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 800;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; text-decoration: none;
          transition: opacity .2s, transform .2s; box-shadow: 0 5px 18px rgba(99,102,241,0.4);
          min-width: 160px;
        }
        .ap-btn-primary:hover { opacity: .9; transform: translateY(-2px); }
        .ap-btn-ghost {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 700;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text-muted);
          text-decoration: none; transition: all .2s;
        }
        .ap-btn-ghost:hover { border-color: rgba(99,102,241,0.4); color: #6366f1; background: rgba(99,102,241,0.05); }
        .ap-completed-badge {
          display: flex; align-items: center; gap: 5px; padding: 10px 16px; border-radius: 12px;
          background: rgba(16,185,129,0.1); border: 1.5px solid rgba(16,185,129,0.25);
          font-size: 13px; font-weight: 700; color: #10b981;
        }

        /* ── Empty state ── */
        .ap-empty { text-align: center; padding: 72px 24px; }
        .ap-empty-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .ap-empty h3 { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .ap-empty p { font-size: 14px; color: var(--text-muted); max-width: 300px; margin: 0 auto 22px; line-height: 1.6; }
        .ap-empty-cta {
          display: inline-flex; align-items: center; gap: 7px; padding: 12px 26px; border-radius: 13px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 14px; font-weight: 700;
          text-decoration: none; box-shadow: 0 6px 20px rgba(99,102,241,0.4);
          transition: opacity .2s, transform .2s;
        }
        .ap-empty-cta:hover { opacity: .9; transform: translateY(-2px); }

        /* ── Skeleton ── */
        .ap-skeleton { border-radius: 20px; border: 1px solid var(--border); background: var(--card); margin-bottom: 16px; overflow: hidden; }
        .ap-sk-topbar { height: 4px; background: var(--bg-secondary); }
        .ap-sk-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; }
        .apsk { border-radius: 8px; background: var(--bg-secondary); animation: skShimmer 1.5s ease-in-out infinite; }
        @keyframes skShimmer { 0%,100%{opacity:.5;} 50%{opacity:1;} }

        /* ── Animations ── */
        @keyframes apFadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
        .ap-fade-1 { animation: apFadeUp .4s ease .04s forwards; opacity: 0; }
        .ap-fade-2 { animation: apFadeUp .4s ease .08s forwards; opacity: 0; }
        .ap-fade-3 { animation: apFadeUp .4s ease .12s forwards; opacity: 0; }
        .ap-fade-4 { animation: apFadeUp .4s ease .16s forwards; opacity: 0; }
      `}</style>

      {/* ── Hero ── */}
      <div className="ap-hero ap-fade-1">
        <div className="ap-hero-mesh" />
        <div className="ap-hero-grid" />
        <div className="ap-hero-content">
          <div>
            <div className="ap-hero-badge"><Briefcase size={12} /> Active Workspace</div>
            <h2 className="ap-hero-title">
              Your <span>Assignments</span>
            </h2>
            <p className="ap-hero-sub">
              Manage all your active projects — track progress, submit updates, and stay in sync with clients.
            </p>
          </div>
          <div className="ap-hero-pills">
            {[
              { label: `${inProgress} In Progress`,  color: '#6366f1', dot: '#a78bfa' },
              { label: `${testing} Testing`,          color: '#f59e0b', dot: '#fbbf24' },
              { label: `${completed} Completed`,      color: '#10b981', dot: '#34d399' },
            ].map(({ label, color, dot }) => (
              <div key={label} className="ap-hero-pill">
                <span className="ap-hero-pill-dot" style={{ background: dot }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="ap-stats ap-fade-2">
        {statCards.map(({ label, value, icon: Icon, grad, glow }) => (
          <div key={label} className="ap-stat-card"
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 14px 36px ${glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <div className="ap-stat-card-glow" style={{ background: `radial-gradient(ellipse at top right, ${glow}, transparent 70%)` }} />
            <div className="ap-stat-card-icon" style={{ background: grad }}>
              <Icon size={20} color="#fff" />
            </div>
            <p className="ap-stat-card-label">{label}</p>
            <p className="ap-stat-card-val">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Project list ── */}
      {loading ? (
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ap-skeleton">
              <div className="ap-sk-topbar" />
              <div className="ap-sk-body">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div className="apsk" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="apsk" style={{ height: 20, width: '50%' }} />
                    <div className="apsk" style={{ height: 13, width: '25%' }} />
                  </div>
                </div>
                <div className="apsk" style={{ height: 60 }} />
                <div className="apsk" style={{ height: 48, borderRadius: 14 }} />
                <div className="apsk" style={{ height: 8 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="apsk" style={{ flex: 1, height: 44, borderRadius: 12 }} />
                  <div className="apsk" style={{ flex: 1, height: 44, borderRadius: 12 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : assigned.length === 0 ? (
        <div className="ap-empty ap-fade-3">
          <div className="ap-empty-icon">
            <Briefcase size={36} color="#6366f1" />
          </div>
          <h3>No assigned projects yet</h3>
          <p>Win bids on open projects to start building your active portfolio here.</p>
          <Link to="/developer/browse" className="ap-empty-cta">
            <Search size={15} /> Browse Open Projects
          </Link>
        </div>
      ) : (
        <div className="ap-fade-3">
          <div className="ap-section-head">
            <h3 className="ap-section-title">
              <Layers size={19} color="#6366f1" /> Active Projects
              <span className="ap-count-chip">{assigned.length}</span>
            </h3>
          </div>
          {assigned.map((project, i) => (
            <ProjectCard key={project._id} project={project} delay={`${i * 0.08}s`} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
