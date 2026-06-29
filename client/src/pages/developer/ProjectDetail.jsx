import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProject } from '../../store/slices/projectSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, DollarSign, Tag, Users, Calendar,
  Zap, Send, Loader2, Star, AlertCircle, CheckCircle2,
  Globe, Smartphone, Brain, BarChart2, Link2, Radio, Lightbulb,
  FileText, Download, Github, ExternalLink, MessageSquare,
  TrendingUp, Shield, Award, Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const categoryMeta = {
  web:           { emoji: '🌐', label: 'Web Dev',      grad: 'linear-gradient(135deg,#3b82f6,#6366f1)', light: 'rgba(59,130,246,0.1)' },
  mobile:        { emoji: '📱', label: 'Mobile',       grad: 'linear-gradient(135deg,#ec4899,#f43f5e)', light: 'rgba(236,72,153,0.1)' },
  ml:            { emoji: '🤖', label: 'ML / AI',      grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)', light: 'rgba(139,92,246,0.1)' },
  'data-science':{ emoji: '📊', label: 'Data Science', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)', light: 'rgba(6,182,212,0.1)'  },
  blockchain:    { emoji: '⛓️', label: 'Blockchain',   grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', light: 'rgba(245,158,11,0.1)' },
  iot:           { emoji: '📡', label: 'IoT',           grad: 'linear-gradient(135deg,#10b981,#06b6d4)', light: 'rgba(16,185,129,0.1)' },
  other:         { emoji: '💡', label: 'Other',         grad: 'linear-gradient(135deg,#64748b,#475569)', light: 'rgba(100,116,139,0.1)' },
};

const statusConfig = {
  open:          { label: 'Open for Bids', dot: '#10b981', bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  'in-progress': { label: 'In Progress',   dot: '#6366f1', bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
  testing:       { label: 'Testing',       dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  delivered:     { label: 'Delivered',     dot: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   color: '#06b6d4' },
  completed:     { label: 'Completed',     dot: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },
  cancelled:     { label: 'Cancelled',     dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
};

export default function DevProjectDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { currentProject: project, loading } = useSelector((s) => s.projects);

  const [myBid,      setMyBid]      = useState(null);
  const [bidLoading, setBidLoading] = useState(true);
  const [showBid,    setShowBid]    = useState(false);
  const [bidForm,    setBidForm]    = useState({ price: '', deliveryDays: '', proposal: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProject(id));
    // Check if I already placed a bid on this project
    api.get('/bids/my')
      .then(r => {
        const existing = r.data.find(b => b.project?._id === id || b.project === id);
        setMyBid(existing || null);
      })
      .catch(() => {})
      .finally(() => setBidLoading(false));
  }, [id]);

  const submitBid = async () => {
    if (!bidForm.price || !bidForm.deliveryDays || !bidForm.proposal)
      return toast.error('Please fill in all fields');
    setSubmitting(true);
    try {
      await api.post('/bids', { projectId: id, ...bidForm });
      toast.success('Bid submitted successfully! 🎉');
      setShowBid(false);
      setBidForm({ price: '', deliveryDays: '', proposal: '' });
      // Refetch to update bid count
      dispatch(fetchProject(id));
      api.get('/bids/my').then(r => {
        const existing = r.data.find(b => b.project?._id === id || b.project === id);
        setMyBid(existing || null);
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bid');
    } finally { setSubmitting(false); }
  };

  if (loading || !project) {
    return (
      <DashboardLayout title="Project Details">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'spin 1s linear infinite'
          }}>
            <Loader2 size={28} color="#fff" />
          </div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Loading project details…</p>
        </div>
      </DashboardLayout>
    );
  }

  const cat    = categoryMeta[project.category] || categoryMeta.other;
  const status = statusConfig[project.status]   || statusConfig.open;
  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / 86400000);
  const urgency  = daysLeft <= 3 && daysLeft > 0;
  const expired  = daysLeft <= 0;

  return (
    <DashboardLayout title="Project Details">
      <style>{`
        /* ── Layout ── */
        .dpd-wrap { max-width: 1100px; margin: 0 auto; }

        /* ── Back button ── */
        .dpd-back {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
          color: var(--text-muted); border: 1.5px solid var(--border);
          background: var(--card); cursor: pointer; transition: all .2s; margin-bottom: 20px;
        }
        .dpd-back:hover { color: #6366f1; border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.04); }

        /* ── Hero banner ── */
        .dpd-hero {
          position: relative; border-radius: 20px; overflow: hidden;
          margin-bottom: 24px; border: 1px solid rgba(139,92,246,0.2);
        }
        .dpd-hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg,#0f0c29 0%,#1a1040 55%,#24243e 100%);
        }
        .dpd-hero-mesh {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 120% at 95% 50%, rgba(99,102,241,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 40% 80% at 5% 50%, rgba(139,92,246,0.15) 0%, transparent 55%);
        }
        .dpd-hero-body { position: relative; z-index: 2; padding: 28px 32px; }
        .dpd-hero-top  { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }

        .dpd-cat-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800;
          letter-spacing: .06em; text-transform: uppercase;
          background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.15); margin-bottom: 12px;
        }
        .dpd-hero-title {
          font-size: 28px; font-weight: 900; color: #fff;
          letter-spacing: -.5px; line-height: 1.25; margin-bottom: 10px;
        }
        .dpd-hero-meta { display: flex; flex-wrap: wrap; gap: 16px; }
        .dpd-hero-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.55); }
        .dpd-hero-meta-item strong { color: rgba(255,255,255,0.9); }

        .dpd-status-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800;
          letter-spacing: .04em; text-transform: uppercase; flex-shrink: 0;
        }
        .dpd-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        /* ── Stats strip ── */
        .dpd-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 0;
        }
        @media (max-width: 700px) { .dpd-stats { grid-template-columns: repeat(2,1fr); } }
        .dpd-stat-item {
          padding: 18px 20px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .dpd-stat-item:last-child { border-right: none; }
        .dpd-stat-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
        .dpd-stat-val   { font-size: 20px; font-weight: 900; color: #fff; }
        .dpd-stat-sub   { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); margin-top: 2px; }

        /* ── Two-column layout ── */
        .dpd-cols { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        @media (max-width: 900px) { .dpd-cols { grid-template-columns: 1fr; } }

        @media (max-width: 500px) {
          .dpd-hero-body { padding: 18px 16px; }
          .dpd-hero-title { font-size: 20px; }
          .dpd-stat-item { padding: 12px 10px; }
        }

        /* ── Section card ── */
        .dpd-section {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 18px; overflow: hidden; margin-bottom: 18px;
        }
        .dpd-section-head {
          padding: 18px 22px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
          background: var(--bg-secondary);
        }
        .dpd-section-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
        }
        .dpd-section-title { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -.2px; }
        .dpd-section-body { padding: 22px; }

        /* ── Description ── */
        .dpd-description {
          font-size: 14px; line-height: 1.75; color: var(--text-muted);
          white-space: pre-wrap;
        }

        /* ── Tech chips ── */
        .dpd-tech-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .dpd-tech-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
          background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-muted);
          transition: all .2s;
        }
        .dpd-tech-chip:hover { border-color: rgba(99,102,241,0.4); color: #6366f1; background: rgba(99,102,241,0.05); }

        /* ── Attachments ── */
        .dpd-attachment {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border);
          margin-bottom: 8px; transition: all .2s; text-decoration: none; color: var(--text);
        }
        .dpd-attachment:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.04); }
        .dpd-attachment-icon { width: 36px; height: 36px; border-radius: 9px; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* ── Client card ── */
        .dpd-client-avatar {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900; color: #fff; flex-shrink: 0;
        }
        .dpd-client-name { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 3px; }
        .dpd-client-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

        /* ── My Bid card ── */
        .dpd-mybid-card {
          border-radius: 14px; padding: 16px;
          background: rgba(99,102,241,0.06); border: 1.5px solid rgba(99,102,241,0.2);
        }
        .dpd-mybid-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .dpd-mybid-row  { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(99,102,241,0.1); }
        .dpd-mybid-row:last-child { border-bottom: none; padding-bottom: 0; }
        .dpd-mybid-key  { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; }
        .dpd-mybid-val  { font-size: 13px; font-weight: 800; color: var(--text); }

        /* ── Bid CTA button ── */
        .dpd-cta {
          width: 100%; padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 800;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity .2s, transform .2s;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
          letter-spacing: -.2px;
        }
        .dpd-cta:hover { opacity: .9; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(99,102,241,0.5); }
        .dpd-cta:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .dpd-cta-secondary {
          width: 100%; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700;
          background: var(--bg-secondary); color: var(--text-muted);
          border: 1.5px solid var(--border); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: all .2s; margin-top: 10px;
        }
        .dpd-cta-secondary:hover { border-color: rgba(99,102,241,0.4); color: #6366f1; background: rgba(99,102,241,0.05); }

        /* ── Already bid banner ── */
        .dpd-already-bid {
          padding: 14px 16px; border-radius: 14px;
          background: rgba(16,185,129,0.08); border: 1.5px solid rgba(16,185,129,0.25);
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;
        }

        /* ── Not open banner ── */
        .dpd-not-open {
          padding: 14px 16px; border-radius: 14px;
          background: rgba(245,158,11,0.08); border: 1.5px solid rgba(245,158,11,0.25);
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;
        }

        /* ── Bid Modal ── */
        .dpd-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px); z-index: 200;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: dpdFadeIn .2s ease;
        }
        @keyframes dpdFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .dpd-modal {
          width: 100%; max-width: 540px; border-radius: 24px;
          background: var(--card); border: 1px solid var(--border);
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          animation: dpdSlideUp .3s cubic-bezier(.34,1.56,.64,1);
          overflow: hidden;
        }
        @keyframes dpdSlideUp { from { opacity: 0; transform: translateY(30px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .dpd-modal-header {
          padding: 28px 28px 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), transparent);
          border-bottom: 1px solid var(--border);
        }
        .dpd-modal-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .dpd-modal-title { font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: -.4px; margin-bottom: 4px; }
        .dpd-modal-sub   { font-size: 13px; color: var(--text-muted); }
        .dpd-modal-sub strong { color: #6366f1; }

        .dpd-modal-meta { display: flex; gap: 20px; margin-top: 16px; }
        .dpd-modal-meta-item p:first-child { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
        .dpd-modal-meta-item p:last-child  { font-size: 15px; font-weight: 800; }

        .dpd-modal-body { padding: 22px 28px; display: flex; flex-direction: column; gap: 16px; }
        .dpd-field label { display: block; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 7px; }
        .dpd-input {
          width: 100%; padding: 13px 15px; border-radius: 12px;
          background: var(--bg-secondary); border: 1.5px solid var(--border);
          color: var(--text); font-size: 14px; font-weight: 500; outline: none;
          transition: border-color .2s, box-shadow .2s; font-family: inherit;
        }
        .dpd-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .dpd-input::placeholder { color: var(--text-muted); }
        .dpd-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .dpd-tip {
          display: flex; align-items: flex-start; gap: 9px; padding: 12px 14px;
          background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px; font-size: 12px; color: var(--text-muted); line-height: 1.55; font-weight: 500;
        }

        .dpd-modal-footer { padding: 0 28px 26px; display: flex; gap: 10px; }
        .dpd-modal-cancel {
          flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700;
          background: var(--bg-secondary); border: 1.5px solid var(--border); color: var(--text);
          cursor: pointer; transition: all .2s;
        }
        .dpd-modal-cancel:hover { border-color: rgba(99,102,241,0.4); }
        .dpd-modal-submit {
          flex: 2; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 800;
          background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 6px 20px rgba(99,102,241,0.4); transition: opacity .2s, transform .2s;
        }
        .dpd-modal-submit:hover { opacity: .9; transform: translateY(-1px); }
        .dpd-modal-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }

        /* ── Animations ── */
        @keyframes dpdFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .dpd-fade-1 { animation: dpdFadeUp .4s ease .05s forwards; opacity: 0; }
        .dpd-fade-2 { animation: dpdFadeUp .4s ease .12s forwards; opacity: 0; }
        .dpd-fade-3 { animation: dpdFadeUp .4s ease .18s forwards; opacity: 0; }
        .dpd-fade-4 { animation: dpdFadeUp .4s ease .24s forwards; opacity: 0; }
      `}</style>

      <div className="dpd-wrap">
        {/* Back */}
        <button onClick={() => navigate('/developer/browse')} className="dpd-back dpd-fade-1">
          <ArrowLeft size={15} /> Back to Browse
        </button>

        {/* ── Hero ── */}
        <div className="dpd-hero dpd-fade-1">
          <div className="dpd-hero-bg" />
          <div className="dpd-hero-mesh" />
          <div className="dpd-hero-body">
            <div className="dpd-hero-top">
              <div style={{ flex: 1 }}>
                <div className="dpd-cat-badge">
                  <span>{cat.emoji}</span> {cat.label}
                </div>
                <h1 className="dpd-hero-title">{project.title}</h1>
                <div className="dpd-hero-meta">
                  {project.student && (
                    <span className="dpd-hero-meta-item">
                      <Users size={13} />
                      Posted by <strong>{project.student.name}</strong>
                    </span>
                  )}
                  <span className="dpd-hero-meta-item">
                    <Calendar size={13} />
                    <strong>{format(new Date(project.createdAt || Date.now()), 'MMM d, yyyy')}</strong>
                  </span>
                  <span className="dpd-hero-meta-item">
                    <Eye size={13} />
                    <strong>{project.bidCount || 0}</strong> bids received
                  </span>
                </div>
              </div>
              <div
                className="dpd-status-pill"
                style={{ background: status.bg, color: status.color }}
              >
                <span className="dpd-status-dot" style={{ background: status.dot }} />
                {status.label}
              </div>
            </div>

            {/* Stats strip */}
            <div className="dpd-stats">
              <div className="dpd-stat-item">
                <p className="dpd-stat-label">Budget</p>
                <p className="dpd-stat-val" style={{ color: '#10b981' }}>
                  ₹{project.budget?.toLocaleString('en-IN')}
                </p>
                <p className="dpd-stat-sub">Max budget</p>
              </div>
              <div className="dpd-stat-item">
                <p className="dpd-stat-label">Deadline</p>
                <p
                  className="dpd-stat-val"
                  style={{ color: expired ? '#ef4444' : urgency ? '#f59e0b' : '#fff' }}
                >
                  {expired ? 'Expired' : `${daysLeft}d`}
                </p>
                <p className="dpd-stat-sub">
                  {expired ? 'Past deadline' : urgency ? 'Urgent!' : 'remaining'}
                </p>
              </div>
              <div className="dpd-stat-item">
                <p className="dpd-stat-label">Bids</p>
                <p className="dpd-stat-val" style={{ color: '#a78bfa' }}>{project.bidCount || 0}</p>
                <p className="dpd-stat-sub">proposals</p>
              </div>
              <div className="dpd-stat-item">
                <p className="dpd-stat-label">Category</p>
                <p className="dpd-stat-val" style={{ fontSize: 14, paddingTop: 4 }}>{cat.emoji} {cat.label}</p>
                <p className="dpd-stat-sub">Project type</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column ── */}
        <div className="dpd-cols">
          {/* Left: main content */}
          <div>
            {/* Description */}
            <div className="dpd-section dpd-fade-2">
              <div className="dpd-section-head">
                <div className="dpd-section-icon">
                  <FileText size={16} color="#fff" />
                </div>
                <span className="dpd-section-title">Project Description</span>
              </div>
              <div className="dpd-section-body">
                <p className="dpd-description">{project.description}</p>
              </div>
            </div>

            {/* Tech Stack */}
            {project.techStack?.length > 0 && (
              <div className="dpd-section dpd-fade-2">
                <div className="dpd-section-head">
                  <div className="dpd-section-icon" style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>
                    <Tag size={16} color="#fff" />
                  </div>
                  <span className="dpd-section-title">Required Tech Stack</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                    color: '#6366f1', background: 'rgba(99,102,241,0.1)',
                    padding: '3px 9px', borderRadius: 999
                  }}>{project.techStack.length} technologies</span>
                </div>
                <div className="dpd-section-body">
                  <div className="dpd-tech-grid">
                    {project.techStack.map(tech => (
                      <span key={tech} className="dpd-tech-chip">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block', flexShrink: 0 }} />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <div className="dpd-section dpd-fade-3">
                <div className="dpd-section-head">
                  <div className="dpd-section-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                    <Download size={16} color="#fff" />
                  </div>
                  <span className="dpd-section-title">Requirement Documents</span>
                </div>
                <div className="dpd-section-body">
                  {project.attachments.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noreferrer" className="dpd-attachment">
                      <div className="dpd-attachment-icon">
                        <FileText size={18} color="#6366f1" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.originalName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Click to view document</p>
                      </div>
                      <Download size={15} color="#6366f1" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables (only if project is delivered/completed) */}
            {(project.githubRepo || project.liveUrl || project.sourceCodeUrl) && (
              <div className="dpd-section dpd-fade-3">
                <div className="dpd-section-head">
                  <div className="dpd-section-icon" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                    <ExternalLink size={16} color="#fff" />
                  </div>
                  <span className="dpd-section-title">Project Deliverables</span>
                </div>
                <div className="dpd-section-body">
                  {project.githubRepo && (
                    <a href={project.githubRepo} target="_blank" rel="noreferrer" className="dpd-attachment">
                      <div className="dpd-attachment-icon" style={{ background: 'rgba(30,30,30,0.8)' }}>
                        <Github size={18} color="#fff" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>GitHub Repository</span>
                      <ExternalLink size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="dpd-attachment">
                      <div className="dpd-attachment-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <Globe size={18} color="#10b981" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Live Demo</span>
                      <ExternalLink size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="dpd-fade-3">

            {/* Bid Action Panel */}
            <div className="dpd-section" style={{ marginBottom: 18 }}>
              <div className="dpd-section-head">
                <div className="dpd-section-icon">
                  <Zap size={16} color="#fff" />
                </div>
                <span className="dpd-section-title">Place Your Bid</span>
              </div>
              <div className="dpd-section-body">
                {/* Already bid */}
                {!bidLoading && myBid && (
                  <div className="dpd-already-bid">
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#10b981', marginBottom: 4 }}>
                        Bid Submitted!
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        Your bid of <strong style={{ color: 'var(--text)' }}>₹{Number(myBid.price).toLocaleString('en-IN')}</strong> is under review.
                      </p>
                    </div>
                  </div>
                )}

                {/* My bid details */}
                {!bidLoading && myBid && (
                  <div className="dpd-mybid-card" style={{ marginBottom: 14 }}>
                    <div className="dpd-mybid-head">
                      <Award size={15} color="#6366f1" />
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#6366f1' }}>Your Proposal</span>
                    </div>
                    <div className="dpd-mybid-row">
                      <span className="dpd-mybid-key">Price</span>
                      <span className="dpd-mybid-val" style={{ color: '#10b981' }}>₹{Number(myBid.price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="dpd-mybid-row">
                      <span className="dpd-mybid-key">Delivery</span>
                      <span className="dpd-mybid-val">{myBid.deliveryDays} days</span>
                    </div>
                    <div className="dpd-mybid-row">
                      <span className="dpd-mybid-key">Status</span>
                      <span className="dpd-mybid-val" style={{
                        color: myBid.status === 'accepted' ? '#10b981' : myBid.status === 'rejected' ? '#ef4444' : '#f59e0b',
                        textTransform: 'capitalize'
                      }}>{myBid.status}</span>
                    </div>
                    <div className="dpd-mybid-row">
                      <span className="dpd-mybid-key">Submitted</span>
                      <span className="dpd-mybid-val" style={{ fontSize: 12 }}>
                        {formatDistanceToNow(new Date(myBid.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Not open */}
                {project.status !== 'open' && !myBid && (
                  <div className="dpd-not-open">
                    <AlertCircle size={17} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginBottom: 3 }}>Bidding Closed</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        This project is no longer accepting bids (status: <strong>{project.status}</strong>).
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                {project.status === 'open' && !myBid && !bidLoading && (
                  <button className="dpd-cta" onClick={() => setShowBid(true)}>
                    <Zap size={18} /> Place Your Bid
                  </button>
                )}

                {/* Go to My Bids */}
                <button className="dpd-cta-secondary" onClick={() => navigate('/developer/bids')}>
                  <TrendingUp size={15} /> View My Bids
                </button>
              </div>
            </div>

            {/* Client Info */}
            {project.student && (
              <div className="dpd-section" style={{ marginBottom: 18 }}>
                <div className="dpd-section-head">
                  <div className="dpd-section-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
                    <Users size={16} color="#fff" />
                  </div>
                  <span className="dpd-section-title">Posted By</span>
                </div>
                <div className="dpd-section-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {project.student.avatar ? (
                      <img
                        src={project.student.avatar}
                        alt=""
                        style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="dpd-client-avatar">
                        {project.student.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="dpd-client-name">{project.student.name}</p>
                      <p className="dpd-client-label">Student · ProjectBridge</p>
                      {project.student.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                            {project.student.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Highlights */}
            <div className="dpd-section dpd-fade-4">
              <div className="dpd-section-head">
                <div className="dpd-section-icon" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                  <Shield size={16} color="#fff" />
                </div>
                <span className="dpd-section-title">Project Highlights</span>
              </div>
              <div className="dpd-section-body">
                {[
                  { icon: DollarSign, label: 'Budget', value: `₹${project.budget?.toLocaleString('en-IN')}`, color: '#10b981' },
                  { icon: Calendar,   label: 'Deadline', value: format(new Date(project.deadline), 'MMM d, yyyy'), color: '#6366f1' },
                  { icon: Clock,      label: 'Time Left', value: expired ? 'Expired' : urgency ? `${daysLeft} days (Urgent!)` : `${daysLeft} days`, color: expired ? '#ef4444' : urgency ? '#f59e0b' : 'var(--text)' },
                  { icon: Users,      label: 'Bids So Far', value: `${project.bidCount || 0} proposals`, color: '#a78bfa' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: `${color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={14} color={color} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bid Modal ── */}
      {showBid && (
        <div className="dpd-overlay" onClick={e => e.target === e.currentTarget && setShowBid(false)}>
          <div className="dpd-modal">
            {/* Header */}
            <div className="dpd-modal-header">
              <div className="dpd-modal-icon">
                <Zap size={22} color="#fff" />
              </div>
              <p className="dpd-modal-title">Submit Your Bid</p>
              <p className="dpd-modal-sub">For: <strong>{project.title}</strong></p>
              <div className="dpd-modal-meta">
                {[
                  { label: 'Max Budget', val: `₹${project.budget?.toLocaleString('en-IN')}`, color: '#10b981' },
                  { label: 'Bids So Far', val: project.bidCount || 0, color: '#6366f1' },
                  { label: 'Deadline', val: `${daysLeft}d left`, color: expired ? '#ef4444' : urgency ? '#f59e0b' : 'var(--text)' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="dpd-modal-meta-item">
                    <p>{label}</p>
                    <p style={{ color }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="dpd-modal-body">
              <div className="dpd-input-row">
                <div className="dpd-field">
                  <label>Your Price (₹) *</label>
                  <input
                    type="number"
                    value={bidForm.price}
                    onChange={e => setBidForm({ ...bidForm, price: e.target.value })}
                    className="dpd-input"
                    placeholder={`e.g. ${project.budget}`}
                  />
                </div>
                <div className="dpd-field">
                  <label>Delivery (days) *</label>
                  <input
                    type="number"
                    value={bidForm.deliveryDays}
                    onChange={e => setBidForm({ ...bidForm, deliveryDays: e.target.value })}
                    className="dpd-input"
                    placeholder="e.g. 14"
                  />
                </div>
              </div>
              <div className="dpd-field">
                <label>Proposal Message *</label>
                <textarea
                  value={bidForm.proposal}
                  onChange={e => setBidForm({ ...bidForm, proposal: e.target.value })}
                  className="dpd-input"
                  rows={5}
                  style={{ resize: 'none' }}
                  placeholder="Describe your approach, relevant experience, and why you're the best fit for this project…"
                />
              </div>
              <div className="dpd-tip">
                <Star size={14} color="#6366f1" style={{ marginTop: 1, flexShrink: 0 }} />
                <span>
                  A winning proposal explains your approach clearly, references similar past work,
                  and gives the client confidence in your ability to deliver on time.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="dpd-modal-footer">
              <button
                className="dpd-modal-cancel"
                onClick={() => { setShowBid(false); setBidForm({ price: '', deliveryDays: '', proposal: '' }); }}
              >
                Cancel
              </button>
              <button
                className="dpd-modal-submit"
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
