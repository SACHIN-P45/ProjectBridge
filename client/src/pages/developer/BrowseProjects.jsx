import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../store/slices/projectSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import ProjectCard from '../../components/project/ProjectCard';
import api from '../../api/axios';
import {
  Search, SlidersHorizontal, X, Zap, ChevronLeft, ChevronRight,
  Briefcase, TrendingUp, DollarSign, Clock, Send, Loader2,
  Globe, Smartphone, Brain, BarChart2, Link2, Radio, Lightbulb,
  Star, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'all',          label: 'All',          icon: Globe,        grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { value: 'web',          label: 'Web',          icon: Globe,        grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { value: 'mobile',       label: 'Mobile',       icon: Smartphone,   grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  { value: 'ml',           label: 'ML / AI',      icon: Brain,        grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
  { value: 'data-science', label: 'Data Science', icon: BarChart2,    grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { value: 'blockchain',   label: 'Blockchain',   icon: Link2,        grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { value: 'iot',          label: 'IoT',           icon: Radio,        grad: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  { value: 'other',        label: 'Other',        icon: Lightbulb,    grad: 'linear-gradient(135deg,#64748b,#475569)' },
];

const SORTS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'budget',  label: 'Highest Budget' },
  { value: 'bids',    label: 'Fewest Bids' },
];

export default function BrowseProjects() {
  const dispatch  = useDispatch();
  const { projects, loading, total, pages } = useSelector((s) => s.projects);

  const [filters, setFilters]       = useState({ search: '', category: 'all', sort: 'newest', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [bidModal, setBidModal]     = useState(null);
  const [bidForm,  setBidForm]      = useState({ price: '', deliveryDays: '', proposal: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* ── Fetch on filter change ── */
  useEffect(() => {
    const params = { page: filters.page };
    if (filters.search)            params.search   = filters.search;
    if (filters.category !== 'all') params.category = filters.category;
    dispatch(fetchProjects(params));
  }, [filters.page, filters.category, filters.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search: searchInput, page: 1 }));
  };

  const clearAll = () => {
    setSearchInput('');
    setFilters({ search: '', category: 'all', sort: 'newest', page: 1 });
  };

  const selectCategory = (val) => setFilters(f => ({ ...f, category: val, page: 1 }));

  /* ── Bid submit ── */
  const submitBid = async () => {
    if (!bidForm.price || !bidForm.deliveryDays || !bidForm.proposal)
      return toast.error('Please fill in all fields');
    setSubmitting(true);
    try {
      await api.post('/bids', { projectId: bidModal._id, ...bidForm });
      toast.success('Bid submitted successfully! 🎉');
      setBidModal(null);
      setBidForm({ price: '', deliveryDays: '', proposal: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bid');
    } finally { setSubmitting(false); }
  };

  const hasActiveFilters = filters.search || filters.category !== 'all';
  const activeCat = CATEGORIES.find(c => c.value === filters.category);

  return (
    <DashboardLayout title="Browse Projects">
      <style>{`
        /* ── Page header ── */
        .bp-hero {
          position: relative; border-radius: 20px; padding: 28px 32px;
          margin-bottom: 24px; overflow: hidden;
          background: linear-gradient(135deg,#0f0c29 0%,#1a1040 55%,#24243e 100%);
          border: 1px solid rgba(139,92,246,0.2);
        }
        .bp-hero-mesh {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 50% 100% at 90% 50%, rgba(99,102,241,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 40% 80% at 10% 50%, rgba(139,92,246,0.15) 0%, transparent 60%);
        }
        .bp-hero-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .bp-hero-title { font-size: 30px; font-weight: 900; color: #fff; letter-spacing: -1px; margin-bottom: 6px; }
        .bp-hero-title span { background: linear-gradient(135deg,#a78bfa,#60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .bp-hero-sub { font-size: 14px; color: rgba(255,255,255,0.45); font-weight: 500; }
        .bp-hero-stats { display: flex; gap: 24px; }
        .bp-hero-stat { text-align: center; }
        .bp-hero-stat-val { font-size: 26px; font-weight: 900; color: #fff; line-height: 1; }
        .bp-hero-stat-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: .06em; }

        /* ── Search bar ── */
        .bp-search-bar {
          display: flex; gap: 10px; padding: 16px; border-radius: 16px;
          background: var(--card); border: 1px solid var(--border); margin-bottom: 20px; align-items: center;
        }
        .bp-search-wrap { position: relative; flex: 1; }
        .bp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .bp-search-input {
          width: 100%; padding: 11px 14px 11px 42px; border-radius: 12px;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text);
          font-size: 14px; font-weight: 500; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .bp-search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .bp-search-input::placeholder { color: var(--text-muted); }
        .bp-search-btn {
          padding: 11px 22px; border-radius: 12px; font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; cursor: pointer;
          transition: opacity .2s, transform .2s; white-space: nowrap; display: flex; align-items: center; gap: 6px;
        }
        .bp-search-btn:hover { opacity: .9; transform: translateY(-1px); }
        .bp-filter-toggle {
          padding: 11px 16px; border-radius: 12px; font-size: 13px; font-weight: 700;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text);
          cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all .2s;
        }
        .bp-filter-toggle.active { border-color: #6366f1; color: #6366f1; background: rgba(99,102,241,0.08); }

        /* ── Category pills ── */
        .bp-cats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .bp-cat-pill {
          display: flex; align-items: center; gap: 6px; padding: 7px 14px;
          border-radius: 999px; font-size: 12px; font-weight: 700;
          border: 1.5px solid var(--border); background: var(--card);
          color: var(--text-muted); cursor: pointer; transition: all .2s;
        }
        .bp-cat-pill:hover { border-color: rgba(99,102,241,0.4); color: #6366f1; }
        .bp-cat-pill.active { color: #fff; border-color: transparent; }
        .bp-cat-pill-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* ── Result meta row ── */
        .bp-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .bp-meta-count { font-size: 14px; color: var(--text-muted); font-weight: 500; }
        .bp-meta-count strong { color: var(--text); font-weight: 800; }
        .bp-sort-select {
          padding: 7px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
          background: var(--card); border: 1.5px solid var(--border); color: var(--text);
          outline: none; cursor: pointer;
        }
        .bp-active-filter-chip {
          display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
          font-size: 11px; font-weight: 700; color: #6366f1;
        }
        .bp-clear-btn { display: flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--text-muted); border: 1.5px solid var(--border); background: var(--card); cursor: pointer; transition: all .2s; }
        .bp-clear-btn:hover { color: #ef4444; border-color: rgba(239,68,68,0.4); }

        /* ── Project card ── */
        .pb-card {
          position: relative; border-radius: 18px;
          background: var(--card); border: 1px solid var(--border);
          overflow: hidden; transition: transform .25s, box-shadow .25s, border-color .25s;
          display: flex; flex-direction: column;
        }
        .pb-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.12); border-color: rgba(99,102,241,0.3); }
        .pb-card-stripe { height: 4px; width: 100%; flex-shrink: 0; }
        .pb-card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 0; }
        .pb-card-cat-wrap { display: flex; align-items: center; gap: 8px; }
        .pb-card-cat-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pb-cat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em; }
        .pb-status-chip { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
        .pb-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pb-card-body { padding: 12px 16px; flex: 1; }
        .pb-card-title { font-size: 15px; font-weight: 800; color: var(--text); line-height: 1.35; margin-bottom: 6px; letter-spacing: -.2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pb-card-client { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .pb-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
        .pb-avatar-fallback { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 800; }
        .pb-card-client span { font-size: 12px; color: var(--text-muted); font-weight: 500; }
        .pb-card-desc { font-size: 13px; color: var(--text-muted); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pb-tech-row { display: flex; flex-wrap: wrap; gap: 5px; padding: 0 16px 10px; }
        .pb-tech-chip { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-muted); }
        .pb-tech-more { color: #6366f1; background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.2); }
        .pb-stats-bar { display: flex; align-items: stretch; border-top: 1px solid var(--border); background: var(--bg-secondary); }
        .pb-stat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 8px; gap: 2px; }
        .pb-stat-divider { width: 1px; background: var(--border); flex-shrink: 0; }
        .pb-stat-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
        .pb-stat-val { font-size: 13px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 3px; }
        .pb-stat-money { color: #10b981; }
        .pb-urgent { color: #f59e0b; animation: urgentPulse 1.5s ease-in-out infinite; }
        .pb-expired { color: #ef4444; }
        @keyframes urgentPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .pb-card-actions { display: flex; gap: 8px; padding: 12px 16px; }
        .pb-btn-ghost {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 9px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
          background: var(--bg); border: 1.5px solid var(--border); color: var(--text-muted);
          cursor: pointer; transition: all .2s;
        }
        .pb-btn-ghost:hover { border-color: rgba(99,102,241,0.5); color: #6366f1; background: rgba(99,102,241,0.05); }
        .pb-btn-bid {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 9px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; cursor: pointer;
          transition: opacity .2s, transform .2s; box-shadow: 0 4px 14px rgba(99,102,241,0.35);
        }
        .pb-btn-bid:hover { opacity: .9; transform: translateY(-1px); }

        /* ── Grid ── */
        .bp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 1100px) { .bp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 680px)  { .bp-grid { grid-template-columns: 1fr; } }

        /* ── Skeleton ── */
        .bp-skeleton {
          border-radius: 18px; overflow: hidden;
          background: var(--card); border: 1px solid var(--border);
        }
        .bp-skeleton-stripe { height: 4px; background: var(--border); }
        .bp-sk { border-radius: 8px; background: var(--bg-secondary); }
        @keyframes skShimmer { 0% { opacity: .5; } 50% { opacity: 1; } 100% { opacity: .5; } }
        .bp-skeleton .bp-sk { animation: skShimmer 1.5s ease-in-out infinite; }

        /* ── Empty state ── */
        .bp-empty { text-align: center; padding: 72px 24px; }
        .bp-empty-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .bp-empty h3 { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .bp-empty p { font-size: 14px; color: var(--text-muted); max-width: 300px; margin: 0 auto 20px; line-height: 1.6; }

        /* ── Pagination ── */
        .bp-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 32px; }
        .bp-page-btn {
          width: 38px; height: 38px; border-radius: 10px; font-size: 13px; font-weight: 700;
          border: 1.5px solid var(--border); background: var(--card); color: var(--text);
          cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center;
        }
        .bp-page-btn:hover { border-color: rgba(99,102,241,0.4); color: #6366f1; }
        .bp-page-btn.active { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
        .bp-page-btn:disabled { opacity: .35; cursor: not-allowed; }
        .bp-page-arrow { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--border); background: var(--card); color: var(--text); cursor: pointer; transition: all .2s; }
        .bp-page-arrow:hover:not(:disabled) { border-color: rgba(99,102,241,0.4); color: #6366f1; }
        .bp-page-arrow:disabled { opacity: .3; cursor: not-allowed; }

        /* ── Bid modal ── */
        .bp-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 16px; animation: bpFadeIn .2s ease;
        }
        @keyframes bpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .bp-modal {
          width: 100%; max-width: 520px; border-radius: 24px;
          background: var(--card); border: 1px solid var(--border);
          box-shadow: 0 40px 100px rgba(0,0,0,0.4);
          animation: bpSlideUp .3s cubic-bezier(.4,0,.2,1);
        }
        @keyframes bpSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .bp-modal-header {
          padding: 24px 28px 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.06), transparent);
          border-bottom: 1px solid var(--border); padding-bottom: 20px;
        }
        .bp-modal-title { font-size: 20px; font-weight: 900; color: var(--text); margin-bottom: 4px; letter-spacing: -.4px; }
        .bp-modal-sub { font-size: 13px; color: var(--text-muted); }
        .bp-modal-sub strong { color: #6366f1; font-weight: 700; }
        .bp-modal-body { padding: 20px 28px; display: flex; flex-direction: column; gap: 16px; }
        .bp-field label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
        .bp-input {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          background: var(--bg-secondary); border: 1.5px solid var(--border);
          color: var(--text); font-size: 14px; font-weight: 500; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .bp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .bp-input::placeholder { color: var(--text-muted); }
        .bp-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .bp-modal-footer { padding: 0 28px 24px; display: flex; gap: 10px; }
        .bp-modal-cancel {
          flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text);
          cursor: pointer; transition: all .2s;
        }
        .bp-modal-cancel:hover { border-color: rgba(99,102,241,0.4); }
        .bp-modal-submit {
          flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; cursor: pointer;
          transition: opacity .2s, transform .2s; display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .bp-modal-submit:hover { opacity: .9; transform: translateY(-1px); }
        .bp-modal-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .bp-tip {
          display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: 10px;
          background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.15); color: var(--text-muted); font-size: 12px; font-weight: 500;
        }

        /* ── Animations ── */
        @keyframes bpFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .bp-fade-up { animation: bpFadeUp .45s ease forwards; opacity: 0; }
        .bp-fade-up-1 { animation-delay: .05s; }
        .bp-fade-up-2 { animation-delay: .1s; }
        .bp-fade-up-3 { animation-delay: .15s; }
        .bp-fade-up-4 { animation-delay: .2s; }
      `}</style>

      {/* ── Hero Header ── */}
      <div className="bp-hero bp-fade-up bp-fade-up-1">
        <div className="bp-hero-mesh" />
        <div className="bp-hero-content">
          <div>
            <h2 className="bp-hero-title">
              Find Your Next <span>Project</span>
            </h2>
            <p className="bp-hero-sub">
              Browse open projects, place your best bid, and grow your developer portfolio.
            </p>
          </div>
          <div className="bp-hero-stats">
            <div className="bp-hero-stat">
              <p className="bp-hero-stat-val">{total || 0}</p>
              <p className="bp-hero-stat-label">Available</p>
            </div>
            <div className="bp-hero-stat">
              <p className="bp-hero-stat-val">{CATEGORIES.length - 1}</p>
              <p className="bp-hero-stat-label">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} className="bp-search-bar bp-fade-up bp-fade-up-2">
        <div className="bp-search-wrap">
          <Search size={16} className="bp-search-icon" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="bp-search-input"
            placeholder="Search by title, technology, or keyword..."
          />
        </div>
        <button type="submit" className="bp-search-btn">
          <Search size={14} /> Search
        </button>
        <button
          type="button"
          className={`bp-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(v => !v)}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </form>

      {/* ── Category Pills ── */}
      <div className="bp-cats bp-fade-up bp-fade-up-2">
        {CATEGORIES.map(({ value, label, icon: Icon, grad }) => {
          const isActive = filters.category === value;
          return (
            <button
              key={value}
              onClick={() => selectCategory(value)}
              className={`bp-cat-pill ${isActive ? 'active' : ''}`}
              style={isActive ? { background: grad, border: 'none' } : {}}
            >
              <div className="bp-cat-pill-icon" style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.1)' }}>
                <Icon size={11} color={isActive ? '#fff' : '#6366f1'} />
              </div>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Meta Row ── */}
      <div className="bp-meta-row bp-fade-up bp-fade-up-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p className="bp-meta-count">
            <strong>{total}</strong> project{total !== 1 ? 's' : ''} found
          </p>
          {filters.search && (
            <span className="bp-active-filter-chip">
              "{filters.search}"
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="bp-active-filter-chip">
              {activeCat?.label}
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearAll} className="bp-clear-btn">
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <select
          value={filters.sort}
          onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
          className="bp-sort-select"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* ── Project Grid ── */}
      {loading ? (
        <div className="bp-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bp-skeleton">
              <div className="bp-skeleton-stripe" />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="bp-sk" style={{ height: 32, width: '60%' }} />
                <div className="bp-sk" style={{ height: 14, width: '40%' }} />
                <div className="bp-sk" style={{ height: 40 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {[50, 60, 45].map((w, j) => <div key={j} className="bp-sk" style={{ height: 22, width: w }} />)}
                </div>
                <div className="bp-sk" style={{ height: 48 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="bp-sk" style={{ flex: 1, height: 38 }} />
                  <div className="bp-sk" style={{ flex: 1, height: 38 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bp-empty">
          <div className="bp-empty-icon">
            <Search size={36} color="#6366f1" />
          </div>
          <h3>No projects found</h3>
          <p>Try different keywords, or clear your filters to see all available projects.</p>
          <button onClick={clearAll} className="bp-search-btn" style={{ margin: '0 auto' }} type="button">
            <X size={14} /> Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="bp-grid">
            {projects.map((p, i) => (
              <div key={p._id} style={{ animation: `bpFadeUp .4s ease ${i * 0.05}s forwards`, opacity: 0 }}>
                <ProjectCard project={p} onBid={() => setBidModal(p)} showActions />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="bp-pagination">
              <button
                className="bp-page-arrow"
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={filters.page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                  className={`bp-page-btn ${filters.page === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="bp-page-arrow"
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={filters.page === pages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Bid Modal ── */}
      {bidModal && (
        <div className="bp-modal-overlay" onClick={e => e.target === e.currentTarget && setBidModal(null)}>
          <div className="bp-modal">
            {/* Header */}
            <div className="bp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} color="#fff" />
                </div>
                <div>
                  <p className="bp-modal-title">Submit Your Bid</p>
                  <p className="bp-modal-sub">Project: <strong>{bidModal.title}</strong></p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Budget', val: `₹${bidModal.budget?.toLocaleString('en-IN')}`, color: '#10b981' },
                  { label: 'Bids so far', val: bidModal.bidCount || 0, color: '#6366f1' },
                  { label: 'Category', val: bidModal.category, color: '#f59e0b' },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="bp-modal-body">
              <div className="bp-input-row">
                <div className="bp-field">
                  <label>Your Price (₹) *</label>
                  <input
                    type="number"
                    value={bidForm.price}
                    onChange={e => setBidForm({ ...bidForm, price: e.target.value })}
                    className="bp-input"
                    placeholder={bidModal.budget}
                  />
                </div>
                <div className="bp-field">
                  <label>Delivery (days) *</label>
                  <input
                    type="number"
                    value={bidForm.deliveryDays}
                    onChange={e => setBidForm({ ...bidForm, deliveryDays: e.target.value })}
                    className="bp-input"
                    placeholder="14"
                  />
                </div>
              </div>
              <div className="bp-field">
                <label>Proposal Message *</label>
                <textarea
                  value={bidForm.proposal}
                  onChange={e => setBidForm({ ...bidForm, proposal: e.target.value })}
                  className="bp-input"
                  rows={5}
                  style={{ resize: 'none' }}
                  placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
                />
              </div>
              <div className="bp-tip">
                <Star size={14} color="#6366f1" style={{ marginTop: 1, flexShrink: 0 }} />
                <span>A strong proposal includes your relevant experience, a clear delivery plan, and why you're uniquely suited for this project.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="bp-modal-footer">
              <button
                className="bp-modal-cancel"
                onClick={() => { setBidModal(null); setBidForm({ price: '', deliveryDays: '', proposal: '' }); }}
              >
                Cancel
              </button>
              <button
                className="bp-modal-submit"
                onClick={submitBid}
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                  : <><Send size={15} /> Submit Bid</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
