import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  FileText, CheckCircle, Clock, XCircle, ExternalLink,
  Search, DollarSign, Calendar, ArrowRight, TrendingUp,
  Zap, Filter, ChevronDown, Target, Award, BarChart2,
  Briefcase, MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/* ── Status config ── */
const STATUS = {
  pending:  { label: 'Pending',  icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  grad: 'linear-gradient(135deg,#f59e0b,#f97316)' },
  accepted: { label: 'Accepted', icon: CheckCircle,  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  grad: 'linear-gradient(135deg,#10b981,#059669)' },
  rejected: { label: 'Rejected', icon: XCircle,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   grad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
};

const TABS = ['all', 'pending', 'accepted', 'rejected'];

/* ── Animated number ── */
function Num({ n }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!n) return;
    let frame; let s = null;
    const run = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 800, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * n));
      if (p < 1) frame = requestAnimationFrame(run); else setV(n);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [n]);
  return <>{v}</>;
}

/* ── Single bid row card ── */
function BidRow({ bid, idx }) {
  const s = STATUS[bid.status] || STATUS.pending;
  const Icon = s.icon;
  const timeAgo = formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true });

  return (
    <div className="mb-bid-card" style={{ animationDelay: `${idx * 0.06}s` }}>
      {/* left accent bar */}
      <div className="mb-bid-accent" style={{ background: s.grad }} />

      <div className="mb-bid-inner">
        {/* Status icon bubble */}
        <div className="mb-bid-icon-wrap" style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
          <Icon size={20} style={{ color: s.color }} />
        </div>

        {/* Main content */}
        <div className="mb-bid-content">
          <div className="mb-bid-top">
            <div className="mb-bid-top-left">
              <h4 className="mb-bid-title">{bid.project?.title || 'Project'}</h4>
              <div className="mb-bid-meta-row">
                <span className="mb-bid-time"><Clock size={11} /> {timeAgo}</span>
                {bid.project?.category && (
                  <span className="mb-bid-cat">{bid.project.category}</span>
                )}
              </div>
            </div>
            <div className="mb-bid-status-chip" style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
              <span className="mb-bid-status-dot" style={{ background: s.color }} />
              {s.label}
            </div>
          </div>

          {/* Proposal preview */}
          <p className="mb-bid-proposal">{bid.proposal}</p>

          {/* Stats row */}
          <div className="mb-bid-stats">
            <div className="mb-bid-stat">
              <DollarSign size={13} color="#10b981" />
              <span className="mb-bid-stat-val" style={{ color: '#10b981' }}>₹{bid.price?.toLocaleString('en-IN')}</span>
              <span className="mb-bid-stat-label">Your bid</span>
            </div>
            <div className="mb-bid-stat-sep" />
            <div className="mb-bid-stat">
              <Calendar size={13} color="#6366f1" />
              <span className="mb-bid-stat-val">{bid.deliveryDays} days</span>
              <span className="mb-bid-stat-label">Delivery</span>
            </div>
            {bid.project?.budget && (
              <>
                <div className="mb-bid-stat-sep" />
                <div className="mb-bid-stat">
                  <Target size={13} color="#f59e0b" />
                  <span className="mb-bid-stat-val">₹{bid.project.budget?.toLocaleString('en-IN')}</span>
                  <span className="mb-bid-stat-label">Budget</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right CTA */}
        <div className="mb-bid-cta-col">
          {bid.status === 'accepted' && (
            <Link to="/developer/assigned" className="mb-cta-btn mb-cta-accepted">
              <Briefcase size={13} /> View Work <ArrowRight size={12} />
            </Link>
          )}
          {bid.status === 'pending' && (
            <div className="mb-cta-pending">
              <div className="mb-pending-spinner" />
              Awaiting reply
            </div>
          )}
          {bid.status === 'rejected' && (
            <Link to="/developer/browse" className="mb-cta-btn mb-cta-rejected">
              <Search size={13} /> Find More
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   MAIN PAGE
══════════════════════════ */
export default function MyBids() {
  const [bids, setBids]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('all');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/bids/my').then(r => setBids(r.data)).finally(() => setLoading(false));
  }, []);

  const total    = bids.length;
  const accepted = bids.filter(b => b.status === 'accepted').length;
  const pending  = bids.filter(b => b.status === 'pending').length;
  const rejected = bids.filter(b => b.status === 'rejected').length;
  const winRate  = total ? Math.round((accepted / total) * 100) : 0;

  const filtered = bids
    .filter(b => tab === 'all' || b.status === tab)
    .filter(b => !search || b.project?.title?.toLowerCase().includes(search.toLowerCase()) || b.proposal?.toLowerCase().includes(search.toLowerCase()));

  const statCards = [
    { label: 'Total Bids',   value: total,    icon: FileText,     grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.3)' },
    { label: 'Accepted',     value: accepted, icon: CheckCircle,  grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.3)' },
    { label: 'Pending',      value: pending,  icon: Clock,        grad: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.3)' },
    { label: 'Win Rate',     value: `${winRate}%`, icon: TrendingUp, grad: 'linear-gradient(135deg,#ec4899,#f43f5e)', glow: 'rgba(236,72,153,0.3)', raw: winRate },
  ];

  return (
    <DashboardLayout title="My Bids">
      <style>{`
        /* ── Hero ── */
        .mb-hero {
          position: relative; border-radius: 22px; padding: 28px 32px;
          margin-bottom: 24px; overflow: hidden;
          background: linear-gradient(135deg,#0f0c29 0%,#1b1040 55%,#24243e 100%);
          border: 1px solid rgba(139,92,246,0.2);
        }
        .mb-hero-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 80% at 85% 40%, rgba(99,102,241,0.28) 0%, transparent 65%),
            radial-gradient(ellipse 35% 60% at 15% 60%, rgba(245,158,11,0.12) 0%, transparent 60%);
        }
        .mb-hero-grid {
          position: absolute; inset: 0; opacity: 0.035;
          background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
          background-size: 36px 36px;
        }
        .mb-hero-body { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .mb-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 999px; margin-bottom: 12px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          font-size: 11px; font-weight: 700; color: #a78bfa; letter-spacing: .07em; text-transform: uppercase;
        }
        .mb-hero-title { font-size: 32px; font-weight: 900; color: #fff; letter-spacing: -1px; margin-bottom: 8px; line-height: 1.1; }
        .mb-hero-title span { background: linear-gradient(135deg,#a78bfa,#f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .mb-hero-sub { font-size: 14px; color: rgba(255,255,255,0.45); max-width: 380px; line-height: 1.6; }
        .mb-hero-ring {
          position: relative; width: 110px; height: 110px; flex-shrink: 0;
        }
        .mb-hero-ring svg { transform: rotate(-90deg); }
        .mb-hero-ring-label {
          position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .mb-hero-ring-val { font-size: 24px; font-weight: 900; color: #fff; line-height: 1; }
        .mb-hero-ring-sub { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

        /* ── Stat cards ── */
        .mb-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 1024px) { .mb-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px)  { .mb-stats { grid-template-columns: repeat(2,1fr); } }
        .mb-stat-card {
          border-radius: 18px; padding: 20px; border: 1px solid var(--border);
          background: var(--card); transition: transform .25s, box-shadow .25s, border-color .25s;
          position: relative; overflow: hidden;
        }
        .mb-stat-card:hover { transform: translateY(-4px); border-color: transparent; }
        .mb-stat-glow { position: absolute; inset: 0; opacity: 0; border-radius: 18px; transition: opacity .3s; }
        .mb-stat-card:hover .mb-stat-glow { opacity: 1; }
        .mb-stat-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; transition: transform .25s; }
        .mb-stat-card:hover .mb-stat-icon { transform: scale(1.12) rotate(6deg); }
        .mb-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text-muted); margin-bottom: 4px; }
        .mb-stat-value { font-size: 30px; font-weight: 900; color: var(--text); letter-spacing: -1px; line-height: 1; }

        /* ── Toolbar ── */
        .mb-toolbar {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 14px 16px; border-radius: 16px; background: var(--card); border: 1px solid var(--border); margin-bottom: 20px;
        }
        .mb-tabs { display: flex; gap: 4px; background: var(--bg-secondary); border-radius: 10px; padding: 3px; }
        .mb-tab {
          padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
          color: var(--text-muted); cursor: pointer; transition: all .2s; border: none; background: none;
          display: flex; align-items: center; gap: 5px; white-space: nowrap;
        }
        .mb-tab.active { background: var(--card); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .mb-tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
          font-size: 10px; font-weight: 800; background: var(--bg-secondary); color: var(--text-muted);
        }
        .mb-tab.active .mb-tab-count { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; }
        .mb-search-wrap { position: relative; }
        .mb-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .mb-search-input {
          padding: 9px 12px 9px 36px; border-radius: 10px; font-size: 13px; font-weight: 500;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text);
          outline: none; transition: border-color .2s, box-shadow .2s; width: 220px;
        }
        .mb-search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .mb-search-input::placeholder { color: var(--text-muted); }

        /* ── Bid card ── */
        .mb-bid-card {
          border-radius: 16px; background: var(--card); border: 1px solid var(--border);
          overflow: hidden; margin-bottom: 12px;
          transition: transform .22s, box-shadow .22s, border-color .22s;
          animation: mbFadeUp .4s ease forwards; opacity: 0;
          display: flex;
        }
        .mb-bid-card:hover { transform: translateX(4px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); border-color: rgba(99,102,241,0.25); }
        .mb-bid-accent { width: 4px; flex-shrink: 0; }
        .mb-bid-inner { flex: 1; display: flex; align-items: flex-start; gap: 16px; padding: 18px 20px; }
        .mb-bid-icon-wrap { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mb-bid-content { flex: 1; min-width: 0; }
        .mb-bid-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .mb-bid-top-left { min-width: 0; }
        .mb-bid-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .mb-bid-meta-row { display: flex; align-items: center; gap: 8px; }
        .mb-bid-time { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); font-weight: 500; }
        .mb-bid-cat { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(99,102,241,0.08); color: #6366f1; border: 1px solid rgba(99,102,241,0.15); text-transform: capitalize; }
        .mb-bid-status-chip { display: flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .mb-bid-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .mb-bid-proposal { font-size: 13px; color: var(--text-muted); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; }
        .mb-bid-stats { display: flex; align-items: center; gap: 0; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; width: fit-content; }
        .mb-bid-stat { display: flex; align-items: center; gap: 5px; padding: 7px 14px; }
        .mb-bid-stat-sep { width: 1px; height: 26px; background: var(--border); flex-shrink: 0; }
        .mb-bid-stat-val { font-size: 13px; font-weight: 800; color: var(--text); }
        .mb-bid-stat-label { font-size: 10px; font-weight: 600; color: var(--text-muted); }
        .mb-bid-cta-col { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex-shrink: 0; gap: 8px; }
        .mb-cta-btn {
          display: flex; align-items: center; gap: 5px; padding: 9px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap;
          transition: opacity .2s, transform .2s;
        }
        .mb-cta-btn:hover { opacity: .85; transform: translateY(-1px); }
        .mb-cta-accepted { background: linear-gradient(135deg,#10b981,#059669); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
        .mb-cta-rejected { background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text-muted); }
        .mb-cta-rejected:hover { border-color: rgba(99,102,241,0.4); color: #6366f1; }
        .mb-cta-pending { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; color: #f59e0b; }
        .mb-pending-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(245,158,11,0.25); border-top-color: #f59e0b;
          animation: spin 1s linear infinite; flex-shrink: 0;
        }

        /* ── Empty ── */
        .mb-empty { text-align: center; padding: 64px 24px; }
        .mb-empty-icon { width: 76px; height: 76px; border-radius: 50%; background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .mb-empty h3 { font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .mb-empty p { font-size: 14px; color: var(--text-muted); max-width: 280px; margin: 0 auto 20px; line-height: 1.6; }
        .mb-empty-cta {
          display: inline-flex; align-items: center; gap: 7px; padding: 12px 24px; border-radius: 12px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 14px; font-weight: 700;
          text-decoration: none; box-shadow: 0 6px 20px rgba(99,102,241,0.4); transition: opacity .2s, transform .2s;
        }
        .mb-empty-cta:hover { opacity: .9; transform: translateY(-2px); }

        /* ── Skeleton ── */
        .mb-skeleton {
          border-radius: 16px; border: 1px solid var(--border); background: var(--card); margin-bottom: 12px;
          display: flex; overflow: hidden;
        }
        .mb-sk-accent { width: 4px; background: var(--bg-secondary); }
        .mb-sk-body { flex: 1; padding: 18px 20px; display: flex; gap: 14px; align-items: flex-start; }
        .mbsk { border-radius: 8px; background: var(--bg-secondary); animation: skShimmer 1.5s ease-in-out infinite; }
        @keyframes skShimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }

        /* ── Animations ── */
        @keyframes mbFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .mb-fade-up-1 { animation: mbFadeUp .4s ease .05s forwards; opacity: 0; }
        .mb-fade-up-2 { animation: mbFadeUp .4s ease .1s  forwards; opacity: 0; }
        .mb-fade-up-3 { animation: mbFadeUp .4s ease .15s forwards; opacity: 0; }
        .mb-fade-up-4 { animation: mbFadeUp .4s ease .2s  forwards; opacity: 0; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="mb-hero mb-fade-up-1">
        <div className="mb-hero-mesh" />
        <div className="mb-hero-grid" />
        <div className="mb-hero-body">
          <div>
            <div className="mb-hero-badge"><FileText size={12} /> Bid Tracker</div>
            <h2 className="mb-hero-title">
              Your <span>Proposals</span>
            </h2>
            <p className="mb-hero-sub">
              Track every bid you've placed — from awaiting response to winning the project.
            </p>
          </div>

          {/* Win-rate ring */}
          <div className="mb-hero-ring">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <circle cx="55" cy="55" r="46" fill="none" stroke="#a78bfa" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${winRate / 100 * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
            </svg>
            <div className="mb-hero-ring-label">
              <span className="mb-hero-ring-val">{winRate}%</span>
              <span className="mb-hero-ring-sub">Win Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="mb-stats mb-fade-up-2">
        {statCards.map(({ label, value, icon: Icon, grad, glow }, i) => (
          <div key={label} className="mb-stat-card"
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 14px 36px ${glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <div className="mb-stat-glow" style={{ background: `radial-gradient(ellipse at top right, ${glow}, transparent 70%)` }} />
            <div className="mb-stat-icon" style={{ background: grad }}>
              <Icon size={20} color="#fff" />
            </div>
            <p className="mb-stat-label">{label}</p>
            <p className="mb-stat-value">{typeof value === 'number' ? <Num n={value} /> : value}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-toolbar mb-fade-up-3">
        {/* Tabs */}
        <div className="mb-tabs">
          {TABS.map(t => {
            const count = t === 'all' ? total : bids.filter(b => b.status === t).length;
            return (
              <button key={t} onClick={() => setTab(t)} className={`mb-tab ${tab === t ? 'active' : ''}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span className="mb-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-search-wrap">
          <Search size={14} className="mb-search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-search-input"
            placeholder="Search bids…"
          />
        </div>
      </div>

      {/* ── Bid list ── */}
      <div className="mb-fade-up-4">
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mb-skeleton">
                <div className="mb-sk-accent" />
                <div className="mb-sk-body">
                  <div className="mbsk" style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="mbsk" style={{ height: 16, width: '55%' }} />
                    <div className="mbsk" style={{ height: 12, width: '30%' }} />
                    <div className="mbsk" style={{ height: 36, width: '100%' }} />
                    <div className="mbsk" style={{ height: 34, width: '45%', borderRadius: 10 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mb-empty">
            <div className="mb-empty-icon">
              {tab === 'all' && !search
                ? <FileText size={34} color="#6366f1" />
                : <Search size={34} color="#6366f1" />}
            </div>
            <h3>
              {tab === 'all' && !search
                ? 'No bids placed yet'
                : `No ${tab !== 'all' ? tab : ''} bids found`}
            </h3>
            <p>
              {tab === 'all' && !search
                ? 'Start bidding on open projects to see your proposals here.'
                : 'Try a different filter or clear your search.'}
            </p>
            {tab === 'all' && !search ? (
              <Link to="/developer/browse" className="mb-empty-cta">
                <Zap size={15} /> Browse Projects
              </Link>
            ) : (
              <button onClick={() => { setTab('all'); setSearch(''); }} className="mb-empty-cta" style={{ border: 'none', cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((bid, i) => <BidRow key={bid._id} bid={bid} idx={i} />)
        )}
      </div>

      {/* ── Summary footer (only when bids exist) ── */}
      {!loading && total > 0 && (
        <div style={{
          marginTop: 24, padding: '14px 20px', borderRadius: 14,
          background: 'var(--card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={16} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--text)' }}>{total}</strong> bids
            </span>
          </div>
          <Link to="/developer/browse" style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
            color: '#6366f1', textDecoration: 'none', padding: '6px 12px', borderRadius: 8,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <Zap size={13} /> Place New Bid <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
