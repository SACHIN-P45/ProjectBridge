import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProject } from '../../store/slices/projectSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import BidCard from '../../components/project/BidCard';
import StatusTimeline from '../../components/project/StatusTimeline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Github, Globe, Download, Star, MessageSquare, CreditCard,
  Calendar, DollarSign, Tag, FileText, CheckCircle, ExternalLink, Loader
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject: project, loading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);
  const [bids, setBids] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [id]);

  useEffect(() => {
    if (project && project.status === 'open') {
      api.get(`/bids/project/${id}`).then(r => setBids(r.data)).catch(() => {});
    }
  }, [project]);

  const handleAcceptBid = async (bidId) => {
    setAccepting(bidId);
    try {
      await api.put(`/bids/${bidId}/accept`);
      toast.success('Bid accepted! Redirecting to payment...');
      dispatch(fetchProject(id));
      navigate('/student/payments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept bid');
    } finally { setAccepting(null); }
  };

  const handlePayment = async () => {
    try {
      const { data } = await api.post('/payments/create-order', { projectId: id });
      
      // If mock payment detected
      if (data.orderId?.startsWith('order_mock_') || data.key === 'rzp_test_your_key_id') {
        const toastId = toast.loading('Processing sandbox payment...');
        setTimeout(async () => {
          try {
            const mockResponse = {
              razorpayOrderId: data.orderId,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
              razorpaySignature: 'mock_signature_approved',
            };
            await api.post('/payments/verify', { ...mockResponse, projectId: id });
            toast.success('Sandbox Payment Successful! 🎉', { id: toastId });
            dispatch(fetchProject(id));
          } catch (err) {
            toast.error('Sandbox verification failed', { id: toastId });
          }
        }, 1200);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ProjectBridge',
        description: `Payment for ${project.title}`,
        order_id: data.orderId,
        handler: async (response) => {
          await api.post('/payments/verify', { ...response, projectId: id });
          toast.success('Payment successful! 🎉');
          dispatch(fetchProject(id));
        },
        theme: { color: '#3b82f6' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch { toast.error('Payment initiation failed'); }
  };

  const handleApprove = async () => {
    try {
      await api.put(`/projects/${id}/approve`);
      toast.success('Project approved! Payment released to developer.');
      dispatch(fetchProject(id));
    } catch { toast.error('Failed to approve project'); }
  };

  const submitReview = async () => {
    try {
      await api.post('/reviews', { projectId: id, revieweeId: project.assignedDeveloper?._id, ...review });
      toast.success('Review submitted!');
      setShowReview(false);
    } catch { toast.error('Failed to submit review'); }
  };

  if (loading || !project) {
    return (
      <DashboardLayout title="Project Detail">
        <div className="flex items-center justify-center h-64">
          <Loader size={32} className="animate-spin text-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.title}>
      {/* Timeline */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-[var(--text)] mb-4">Project Progress</h3>
        <StatusTimeline status={project.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-display font-bold text-2xl text-[var(--text)]">{project.title}</h2>
              <span className={`status-${project.status}`}>{project.status}</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed mb-5">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {project.techStack?.map(t => (
                <span key={t} className="badge-gray flex items-center gap-1"><Tag size={10} />{t}</span>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Budget</p>
                <p className="font-bold text-emerald-500 text-lg">₹{project.budget?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Deadline</p>
                <p className="font-bold text-[var(--text)]">{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Category</p>
                <p className="font-bold text-[var(--text)] capitalize">{project.category}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {project.attachments?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg mb-4">Requirements Documents</h3>
              <div className="space-y-2">
                {project.attachments.map((att, i) => (
                  <a key={i} href={att.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--card-hover)] transition-colors border border-[var(--border)]">
                    <FileText size={18} className="text-brand-500 flex-shrink-0" />
                    <span className="text-sm text-[var(--text)] truncate">{att.originalName}</span>
                    <Download size={14} className="text-[var(--text-muted)] ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Delivery links */}
          {(project.githubRepo || project.liveUrl || project.sourceCodeUrl) && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg mb-4">Project Deliverables</h3>
              <div className="space-y-3">
                {project.githubRepo && (
                  <a href={project.githubRepo} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all">
                    <Github size={20} className="text-[var(--text)]" />
                    <span className="font-medium text-[var(--text)]">GitHub Repository</span>
                    <ExternalLink size={14} className="ml-auto text-[var(--text-muted)]" />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all">
                    <Globe size={20} className="text-emerald-500" />
                    <span className="font-medium text-[var(--text)]">Live Demo</span>
                    <ExternalLink size={14} className="ml-auto text-[var(--text-muted)]" />
                  </a>
                )}
                {project.sourceCodeUrl && (
                  <a href={project.sourceCodeUrl} download
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-violet-500 hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-all">
                    <Download size={20} className="text-violet-500" />
                    <span className="font-medium text-[var(--text)]">Download Source Code</span>
                    <Download size={14} className="ml-auto text-[var(--text-muted)]" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Bids */}
          {project.status === 'open' && (
            <div>
              <h3 className="font-display font-bold text-xl mb-4">
                Quotations Received
                <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({bids.length})</span>
              </h3>
              {bids.length === 0 ? (
                <div className="card p-8 text-center text-[var(--text-muted)]">
                  <p>No bids yet. Developers will submit their proposals here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map(bid => (
                    <BidCard key={bid._id} bid={bid} isStudent={true} onAccept={handleAcceptBid} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress updates */}
          {project.progressUpdates?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg mb-4">Progress Updates</h3>
              <div className="space-y-3">
                {project.progressUpdates.map((u, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</div>
                    <div>
                      <p className="text-sm text-[var(--text)]">{u.message}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{formatDistanceToNow(new Date(u.timestamp), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="card p-6 space-y-3">
            <h3 className="font-display font-bold text-lg text-[var(--text)]">Actions</h3>

            {project.status === 'in-progress' && !project.isPaid && (
              <button onClick={handlePayment} className="btn-primary w-full justify-center">
                <CreditCard size={16} /> Pay Initial 50% (₹{Math.round((project.selectedBid?.price || project.budget) * 0.5).toLocaleString()})
              </button>
            )}

            {project.status === 'delivered' && !project.isSecondPaid && (
              <button onClick={handlePayment} className="btn-success w-full justify-center">
                <CreditCard size={16} /> Pay Final 50% & Approve (₹{Math.round((project.selectedBid?.price || project.budget) * 0.5).toLocaleString()})
              </button>
            )}

            {project.assignedDeveloper && (
              <button onClick={() => navigate('/student/messages')} className="btn-secondary w-full justify-center">
                <MessageSquare size={16} /> Open Chat
              </button>
            )}

            {project.status === 'completed' && (
              <button onClick={() => setShowReview(true)} className="btn-secondary w-full justify-center">
                <Star size={16} /> Rate Developer
              </button>
            )}
          </div>

          {/* Assigned Developer */}
          {project.assignedDeveloper && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--text)] mb-4">Assigned Developer</h3>
              <div className="flex items-center gap-3">
                {project.assignedDeveloper.avatar ? (
                  <img src={project.assignedDeveloper.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                    {project.assignedDeveloper.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[var(--text)]">{project.assignedDeveloper.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm text-[var(--text-muted)]">{project.assignedDeveloper.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h3 className="font-display font-bold text-xl mb-5">Rate Developer</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReview({ ...review, rating: n })}>
                  <Star size={28} className={n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                </button>
              ))}
            </div>
            <textarea value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })}
              className="input resize-none" rows={4} placeholder="Share your experience with this developer..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowReview(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={submitReview} className="btn-primary flex-1 justify-center">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
