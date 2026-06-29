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
  Calendar, DollarSign, Tag, FileText, CheckCircle, ExternalLink, Loader,
  ShieldCheck, AlertTriangle, Printer, ArrowRight, Lock, Building, QrCode, Wifi, Check, X
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

  // Rich Checkout and Payment Gateway Simulator states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('invoice'); // invoice, gateway, processing, success, failure
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, netbanking
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [paymentType, setPaymentType] = useState('initial'); // initial, final
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '', focused: '' });
  const [upiDetails, setUpiDetails] = useState({ vpa: '' });
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [simulatedReceipt, setSimulatedReceipt] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [upiTimer, setUpiTimer] = useState(300); // 5 minutes in seconds
  const [processingMessage, setProcessingMessage] = useState('Securing connection...');

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [id]);

  useEffect(() => {
    if (project && project.status === 'open') {
      api.get(`/bids/project/${id}`).then(r => setBids(r.data)).catch(() => {});
    }
  }, [project]);

  // UPI Countdown Timer
  useEffect(() => {
    let interval = null;
    if (showCheckoutModal && checkoutStep === 'gateway' && paymentMethod === 'upi' && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer((prev) => prev - 1);
      }, 1000);
    } else if (upiTimer === 0 && checkoutStep === 'gateway') {
      setCheckoutStep('failure');
    }
    return () => clearInterval(interval);
  }, [showCheckoutModal, checkoutStep, paymentMethod, upiTimer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length > 0 ? parts.join(' ') : v;
  };

  const getCardBrand = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^9/.test(cleanNumber)) return 'RuPay';
    return 'Card';
  };

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

  // Pre-checkout Invoice summary initialization
  const initiateCheckout = async (type) => {
    setCheckoutLoading(true);
    setPaymentType(type);
    try {
      const { data } = await api.post('/payments/create-order', { projectId: id });
      setCheckoutDetails(data);
      setCheckoutStep('invoice');
      setCardDetails({ number: '', name: '', expiry: '', cvc: '', focused: '' });
      setUpiDetails({ vpa: '' });
      setSelectedBank('SBI');
      setUpiTimer(300);
      setShowCheckoutModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Real payment gateway activation
  const handleProceedToRealPayment = () => {
    const options = {
      key: checkoutDetails.key,
      amount: checkoutDetails.amount,
      currency: checkoutDetails.currency,
      name: 'ProjectBridge',
      description: `Payment for ${project.title}`,
      order_id: checkoutDetails.orderId,
      handler: async (response) => {
        setCheckoutStep('processing');
        try {
          await api.post('/payments/verify', { ...response, projectId: id });
          toast.success('Payment successful! 🎉');
          
          const recNo = `PB-REC-${Math.floor(100000 + Math.random() * 900000)}`;
          setSimulatedReceipt({
            receiptNo: recNo,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || checkoutDetails.orderId,
            amount: checkoutDetails.amount / 100,
            projectTitle: project.title,
            milestone: paymentType === 'initial' ? 'Initial 50% Escrow Deposit' : 'Final 50% Release & Approval',
            studentName: user.name,
            developerName: project.assignedDeveloper?.name || 'Assigned Developer',
            date: new Date().toLocaleString(),
          });
          setCheckoutStep('success');
        } catch (err) {
          toast.error('Payment verification failed');
          setCheckoutStep('failure');
        }
      },
      theme: { color: '#3b82f6' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // High-fidelity payment simulation logic
  const handleSimulatePayment = async (success) => {
    setCheckoutStep('processing');
    
    // Animate stage messages
    const messages = [
      'Securing connection to payment gateway...',
      'Authorizing transaction with issuing bank...',
      'Verifying escrow digital signature...',
      'Updating ledger records...'
    ];
    
    let stage = 0;
    const interval = setInterval(() => {
      if (stage < messages.length - 1) {
        stage++;
        setProcessingMessage(messages[stage]);
      }
    }, 600);

    setTimeout(async () => {
      clearInterval(interval);
      if (success) {
        try {
          const mockResponse = {
            razorpayOrderId: checkoutDetails.orderId,
            razorpayPaymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
            razorpaySignature: 'mock_signature_approved',
          };
          await api.post('/payments/verify', { ...mockResponse, projectId: id });
          
          const recNo = `PB-REC-${Math.floor(100000 + Math.random() * 900000)}`;
          setSimulatedReceipt({
            receiptNo: recNo,
            paymentId: mockResponse.razorpayPaymentId,
            orderId: checkoutDetails.orderId,
            amount: checkoutDetails.amount / 100,
            projectTitle: project.title,
            milestone: paymentType === 'initial' ? 'Initial 50% Escrow Deposit' : 'Final 50% Release & Approval',
            studentName: user.name,
            developerName: project.assignedDeveloper?.name || 'Assigned Developer',
            date: new Date().toLocaleString(),
          });
          
          setCheckoutStep('success');
        } catch (err) {
          toast.error('Sandbox verification failed');
          setCheckoutStep('failure');
        }
      } else {
        setCheckoutStep('failure');
      }
    }, 2500);
  };

  // Open clean printable window for receipt
  const handlePrintReceipt = (receiptData) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ProjectBridge</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
            .receipt-card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px; max-width: 480px; margin: 20px auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05); background: #ffffff; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 15px; }
            .logo { font-size: 24px; font-weight: 900; color: #3b82f6; margin-bottom: 4px; letter-spacing: -0.025em; }
            .title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.05em; }
            .amount-section { text-align: center; background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
            .amount-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .amount { font-size: 30px; font-weight: 900; color: #0f172a; margin: 4px 0; }
            .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; border: 1px solid #bbf7d0; }
            .grid { display: flex; flex-direction: column; gap: 12px; font-size: 12px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #f1f5f9; padding-bottom: 8px; }
            .label { color: #64748b; font-weight: 600; }
            .value { color: #0f172a; font-weight: 700; text-align: right; word-break: break-all; max-width: 60%; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8; line-height: 1.5; }
            @media print {
              @page {
                size: portrait;
                margin: 5mm;
              }
              body {
                background: #ffffff;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .receipt-card {
                border: 1px solid #e2e8f0;
                box-shadow: none;
                padding: 24px;
                margin: 0 auto;
                max-width: 460px;
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="logo">ProjectBridge</div>
              <div class="title">Secure Escrow Payment Receipt</div>
            </div>
            <div class="amount-section">
              <div class="amount-label">Amount Deposited</div>
              <div class="amount">₹${receiptData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <span class="badge">Verified by Razorpay</span>
            </div>
            <div class="grid">
              <div class="row"><span class="label">Receipt Number</span><span class="value">${receiptData.receiptNo}</span></div>
              <div class="row"><span class="label">Transaction ID</span><span class="value">${receiptData.paymentId}</span></div>
              <div class="row"><span class="label">Order ID</span><span class="value">${receiptData.orderId}</span></div>
              <div class="row"><span class="label">Project Title</span><span class="value">${receiptData.projectTitle}</span></div>
              <div class="row"><span class="label">Milestone</span><span class="value">${receiptData.milestone}</span></div>
              <div class="row"><span class="label">Payer (Student)</span><span class="value">${receiptData.studentName}</span></div>
              <div class="row"><span class="label">Payee (Developer)</span><span class="value">${receiptData.developerName}</span></div>
              <div class="row"><span class="label">Payment Date</span><span class="value">${receiptData.date}</span></div>
            </div>
            <div class="footer">
              Thank you for choosing ProjectBridge.<br>This document acts as official proof of deposit. Funds are locked securely under smart contract terms and will only be released to the developer upon project approval.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      toast.success('Review submitted successfully! ⭐');
      setShowReview(false);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit review';
      toast.error(errMsg);
    }
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
              <button onClick={() => initiateCheckout('initial')} disabled={checkoutLoading} className="btn-primary w-full justify-center">
                {checkoutLoading && paymentType === 'initial' ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={16} /> Pay Initial 50% (₹{Math.round((project.selectedBid?.price || project.budget) * 0.5).toLocaleString()})
                  </>
                )}
              </button>
            )}

            {project.status === 'delivered' && !project.isSecondPaid && (
              <button onClick={() => initiateCheckout('final')} disabled={checkoutLoading} className="btn-success w-full justify-center">
                {checkoutLoading && paymentType === 'final' ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={16} /> Pay Final 50% & Approve (₹{Math.round((project.selectedBid?.price || project.budget) * 0.5).toLocaleString()})
                  </>
                )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card p-6 w-full max-w-md border border-[var(--border)] bg-[var(--card)] rounded-[2rem] shadow-2xl animate-slide-up text-center space-y-5">
            
            {/* Modal Header */}
            <div>
              <h3 className="font-display font-black text-xl text-[var(--text)] tracking-tight">Rate Developer</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 font-semibold">Share your feedback to help the community make informed decisions.</p>
            </div>

            {/* Developer Card Anchor */}
            <div className="flex items-center gap-3.5 p-3.5 bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-2xl text-left">
              {project.assignedDeveloper?.avatar ? (
                <img src={project.assignedDeveloper.avatar} className="w-11 h-11 rounded-2xl object-cover border border-[var(--border)] shrink-0" alt="" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-black text-base border border-white/15 shrink-0">
                  {project.assignedDeveloper?.name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-xs text-[var(--text)]">{project.assignedDeveloper?.name || 'Assigned Developer'}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Project Lead Developer</p>
              </div>
            </div>

            {/* Star Selector Container */}
            <div className="space-y-2.5 py-2 bg-[var(--bg-secondary)]/35 border border-[var(--border)] rounded-2xl">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button 
                    key={n} 
                    type="button"
                    onClick={() => setReview({ ...review, rating: n })}
                    className="p-1 transition-all duration-200 hover:scale-115 active:scale-95"
                    title={`${n} Star${n > 1 ? 's' : ''}`}
                  >
                    <Star 
                      size={32} 
                      className={`transition-all duration-300 ${
                        n <= review.rating 
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]' 
                          : 'text-[var(--border)] hover:text-amber-400/50'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-black text-brand-500 uppercase tracking-wider animate-pulse-slow">
                {review.rating === 1 && 'Unsatisfactory 😞'}
                {review.rating === 2 && 'Below Expectations 😐'}
                {review.rating === 3 && 'Satisfactory 🙂'}
                {review.rating === 4 && 'Very Good! 🌟'}
                {review.rating === 5 && 'Outstanding! 🏆'}
              </p>
            </div>

            {/* Comment Box */}
            <div className="text-left space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Share your experience (Optional)</label>
              <textarea 
                value={review.comment} 
                onChange={e => setReview({ ...review, comment: e.target.value })}
                className="input w-full min-h-[110px] resize-none text-xs focus:ring-brand-500 focus:border-brand-500 rounded-2xl" 
                rows={4} 
                placeholder="Write a brief review about code quality, communication, and speed..." 
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3.5 pt-1">
              <button 
                type="button"
                onClick={() => {
                  setShowReview(false);
                  setReview({ rating: 5, comment: '' });
                }} 
                className="btn-secondary flex-1 justify-center py-2.5 text-xs font-black uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={submitReview} 
                className="btn-primary flex-1 justify-center py-2.5 text-xs font-black uppercase tracking-wider"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout & Sandbox Simulator Modal */}
      {showCheckoutModal && checkoutDetails && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <style>{`
            .card-perspective { perspective: 1000px; }
            .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
            .card-inner.flipped { transform: rotateY(180deg); }
            .card-front, .card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 1rem; }
            .card-back { transform: rotateY(180deg); }
            @keyframes confetti-fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(450px) rotate(360deg); opacity: 0; }
            }
            .confetti-particle {
              position: absolute; width: 8px; height: 8px;
              animation: confetti-fall 3s linear infinite;
            }
          `}</style>
          <div className="bg-[var(--card)] w-full max-w-lg rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-500/10 text-brand-500 rounded-xl">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[var(--text)] tracking-tight">Secure Escrow Checkout</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Order ID: {checkoutDetails.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (checkoutStep !== 'processing') setShowCheckoutModal(false);
                }}
                disabled={checkoutStep === 'processing'}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps Container */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Step 1: Invoice */}
              {checkoutStep === 'invoice' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Milestone Escrow</p>
                      <p className="font-display font-black text-sm text-[var(--text)] mt-0.5 text-left">
                        {paymentType === 'initial' ? 'Milestone 1: 50% Initial Deposit' : 'Milestone 2: 50% Final Release & Project Approval'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)] font-semibold">Protected</p>
                      <p className="text-[10px] bg-emerald-500/10 text-emerald-500 font-black px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5">Escrowed</p>
                    </div>
                  </div>

                  {/* Pricing Details Table */}
                  <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-secondary)]/30">
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 text-left">
                      <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">Billing Invoice Breakdown</h4>
                    </div>
                    <div className="p-4 space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)] font-semibold">Milestone Amount:</span>
                        <span className="font-bold text-[var(--text)]">₹{(checkoutDetails.amount / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1">Platform Service Fee (2%):</span>
                        <span className="text-slate-400 font-semibold line-through">₹{((checkoutDetails.amount / 100) * 0.02).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1">Escrow Processing Fee:</span>
                        <span className="text-emerald-500 font-black uppercase text-[10px]">Free (Beta)</span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center">
                        <span className="text-sm font-black text-[var(--text)]">Total Payable:</span>
                        <span className="text-lg font-black text-emerald-500">₹{(checkoutDetails.amount / 100).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Gateway Check */}
                  <div className="p-3 bg-[var(--bg-secondary)]/60 border border-[var(--border)] rounded-xl flex items-center gap-3">
                    <Building size={16} className="text-brand-500" />
                    <div className="text-left text-xs">
                      <p className="font-bold text-[var(--text)]">Payment Provider</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {checkoutDetails.orderId?.startsWith('order_mock_') || checkoutDetails.key === 'rzp_test_your_key_id'
                          ? 'ProjectBridge Sandbox Simulator (Dev Mode)'
                          : 'Razorpay Secure Payment Gateway (Production)'}
                      </p>
                    </div>
                  </div>

                  {/* Method Selection (only for sandbox) */}
                  {(checkoutDetails.orderId?.startsWith('order_mock_') || checkoutDetails.key === 'rzp_test_your_key_id') && (
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-left">Select Payment Method</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'card', label: 'Card Payment', icon: CreditCard },
                          { id: 'upi', label: 'UPI / GPay', icon: QrCode },
                          { id: 'netbanking', label: 'Net Banking', icon: Building }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                              paymentMethod === m.id
                                ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                                : 'border-[var(--border)] bg-[var(--card)]/50 text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                            }`}
                          >
                            <m.icon size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checkout Buttons */}
                  <div className="pt-2">
                    {checkoutDetails.orderId?.startsWith('order_mock_') || checkoutDetails.key === 'rzp_test_your_key_id' ? (
                      <button
                        onClick={() => setCheckoutStep('gateway')}
                        className="btn-primary w-full justify-center py-3 text-sm font-black tracking-wide"
                      >
                        Proceed to Payment Simulator <ArrowRight size={16} className="ml-1" />
                      </button>
                    ) : (
                      <button
                        onClick={handleProceedToRealPayment}
                        className="btn-primary w-full justify-center py-3 text-sm font-black tracking-wide"
                      >
                        Launch Secure Checkout <Lock size={16} className="ml-1.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Gateway Simulator */}
              {checkoutStep === 'gateway' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between text-xs border-b border-[var(--border)] pb-3">
                    <button
                      onClick={() => setCheckoutStep('invoice')}
                      className="text-brand-500 font-bold hover:underline flex items-center gap-1"
                    >
                      ← Back to Invoice
                    </button>
                    <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1">
                      <Lock size={12} className="text-emerald-500" /> Secure Sandbox Session
                    </span>
                  </div>

                  {/* Card Simulator View */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-6">
                      {/* Virtual Card Visual */}
                      <div className="card-perspective w-full max-w-[320px] h-[190px] mx-auto">
                        <div className={`card-inner w-full h-full ${cardDetails.focused === 'cvc' ? 'flipped' : ''}`}>
                          {/* Front of Card */}
                          <div className="card-front bg-gradient-to-tr from-slate-800 via-slate-900 to-indigo-950 p-5 text-white flex flex-col justify-between shadow-lg border border-slate-700">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ProjectBridge Escrow</span>
                              <Wifi size={20} className="text-slate-400 rotate-90 animate-pulse-slow" />
                            </div>
                            <div className="my-2 text-left">
                              <span className="w-10 h-7 rounded-md bg-amber-500/20 border border-amber-500/30 block mb-2" />
                              <p className="font-mono text-lg tracking-widest text-slate-200">
                                {cardDetails.number || '•••• •••• •••• ••••'}
                              </p>
                            </div>
                            <div className="flex justify-between items-end text-left text-xs font-mono">
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase font-sans">Cardholder</p>
                                <p className="font-bold uppercase tracking-wide truncate max-w-[150px]">{cardDetails.name || 'Your Name'}</p>
                              </div>
                              <div>
                                <p className="text-[8px] text-slate-400 uppercase font-sans">Expires</p>
                                <p className="font-bold">{cardDetails.expiry || 'MM/YY'}</p>
                              </div>
                              <span className="font-black italic text-sm text-slate-300">
                                {getCardBrand(cardDetails.number)}
                              </span>
                            </div>
                          </div>

                          {/* Back of Card */}
                          <div className="card-back bg-gradient-to-tr from-indigo-950 via-slate-900 to-slate-800 text-white flex flex-col justify-between py-5 shadow-lg border border-slate-700">
                            <div className="w-full h-10 bg-slate-950" />
                            <div className="px-5 my-2">
                              <div className="flex items-center justify-end gap-2 bg-slate-200 text-slate-800 p-1.5 rounded text-right font-mono text-sm font-bold">
                                <span className="text-[8px] text-slate-400 uppercase font-sans italic tracking-wider">Signature Panel</span>
                                <span className="px-2 py-0.5 bg-white rounded border border-slate-300 text-xs">{cardDetails.cvc || '•••'}</span>
                              </div>
                            </div>
                            <div className="px-5 text-left">
                              <p className="text-[7px] text-slate-400 leading-normal">
                                SIMULATED SANDBOX CARD. FOR DEMONSTRATION PURPOSES ONLY. DO NOT ENTER A REAL CREDIT CARD NUMBER.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="4000 1234 5678 9010"
                            value={cardDetails.number}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: 'number' })}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                            className="input w-full text-sm font-mono"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={cardDetails.name}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: 'name' })}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="input w-full text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Expiry Date</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: 'expiry' })}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, '');
                              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                              setCardDetails({ ...cardDetails, expiry: v });
                            }}
                            className="input w-full text-sm font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="•••"
                            value={cardDetails.cvc}
                            onFocus={() => setCardDetails({ ...cardDetails, focused: 'cvc' })}
                            onBlur={() => setCardDetails({ ...cardDetails, focused: '' })}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '') })}
                            className="input w-full text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Simulator View */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-center gap-3 w-full text-left">
                        <Building size={16} className="text-amber-500 shrink-0" />
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                          Do not scan with real banking apps. Simulate success or failure using the dashboard actions below.
                        </span>
                      </div>

                      {/* Mock QR Code */}
                      <div className="p-5 bg-white border border-slate-200 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center shadow-sm w-44 h-44 group">
                        <QrCode size={130} className="text-slate-900 opacity-95 transition-all duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
                      </div>

                      {/* Timer */}
                      <div className="text-center space-y-1">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">Transaction Expiry Timer</p>
                        <p className="text-2xl font-mono font-black text-brand-500 animate-pulse">{formatTime(upiTimer)}</p>
                      </div>

                      {/* UPI ID entry */}
                      <div className="w-full text-left space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Or Enter Virtual Payment Address (VPA)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="username@okaxis"
                            value={upiDetails.vpa}
                            onChange={(e) => setUpiDetails({ vpa: e.target.value })}
                            className="input text-sm flex-1 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking Simulator View */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-5">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-left">Select Net Banking Bank Partner</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'SBI', name: 'State Bank of India' },
                          { id: 'HDFC', name: 'HDFC Bank' },
                          { id: 'ICICI', name: 'ICICI Bank' },
                          { id: 'AXIS', name: 'Axis Bank' }
                        ].map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBank(b.id)}
                            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                              selectedBank === b.id
                                ? 'border-brand-500 bg-brand-500/10 text-brand-500 font-bold'
                                : 'border-[var(--border)] bg-[var(--card)]/50 text-[var(--text)] hover:border-[var(--text-muted)]'
                            }`}
                          >
                            <Building size={16} />
                            <div className="truncate">
                              <p className="text-xs font-bold">{b.id}</p>
                              <p className="text-[9px] text-[var(--text-muted)] truncate">{b.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Controls to simulate Success/Failure */}
                  <div className="border-t border-[var(--border)] pt-5 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSimulatePayment(false)}
                      className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      <AlertTriangle size={15} /> Simulate Failure
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatePayment(true)}
                      className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      <ShieldCheck size={15} /> Simulate Success
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Processing Loader */}
              {checkoutStep === 'processing' && (
                <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin" />
                    <Lock size={24} className="absolute text-brand-500 animate-pulse" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="font-display font-black text-base text-[var(--text)] tracking-tight">Processing Escrow Transaction</p>
                    <p className="text-xs text-[var(--text-muted)] font-semibold transition-all duration-300">{processingMessage}</p>
                  </div>
                </div>
              )}

              {/* Step 4: Success Receipt Screen */}
              {checkoutStep === 'success' && simulatedReceipt && (
                <div className="space-y-6 py-4 animate-fade-in relative">
                  {/* CSS Confetti generation */}
                  {[...Array(20)].map((_, idx) => {
                    const l = Math.random() * 100;
                    const d = Math.random() * 2 + 1;
                    const clr = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][idx % 4];
                    return (
                      <span
                        key={idx}
                        className="confetti-particle"
                        style={{
                          left: `${l}%`,
                          animationDelay: `${idx * 0.15}s`,
                          animationDuration: `${d}s`,
                          backgroundColor: clr,
                        }}
                      />
                    );
                  })}

                  {/* Checkmark animation */}
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/35 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                    <CheckCircle size={36} className="text-emerald-500" />
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="font-display font-black text-xl text-[var(--text)] tracking-tight">Escrow Deposit Successful!</h3>
                    <p className="text-xs text-[var(--text-muted)] font-semibold">Funds are locked securely in the ProjectBridge contract.</p>
                  </div>

                  {/* Invoice card */}
                  <div id="printable-receipt" className="p-5 bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-2xl text-xs space-y-3.5 text-left">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                      <div>
                        <p className="font-display font-black text-sm text-[var(--text)] font-semibold">ProjectBridge Receipt</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">{simulatedReceipt.receiptNo}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full">
                        Razorpay Secured
                      </span>
                    </div>

                    <div className="space-y-3 font-medium">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Project Title:</span>
                        <span className="font-bold text-[var(--text)] text-right truncate max-w-[200px]">{simulatedReceipt.projectTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Milestone Description:</span>
                        <span className="font-bold text-[var(--text)]">{simulatedReceipt.milestone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Developer (Payee):</span>
                        <span className="font-bold text-[var(--text)]">{simulatedReceipt.developerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Payment ID:</span>
                        <span className="font-mono text-[var(--text)] font-bold">{simulatedReceipt.paymentId}</span>
                      </div>
                      <div className="flex justify-between border-t border-[var(--border)] pt-3 items-center">
                        <span className="font-black text-sm text-[var(--text)]">Amount Deposited:</span>
                        <span className="font-black text-sm text-emerald-500">₹{simulatedReceipt.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => handlePrintReceipt(simulatedReceipt)}
                      className="flex items-center justify-center gap-2 p-3 border border-[var(--border)] hover:bg-[var(--bg-secondary)] text-[var(--text)] rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      <Printer size={15} /> Print Receipt
                    </button>
                    <button
                      onClick={() => {
                        setShowCheckoutModal(false);
                        dispatch(fetchProject(id));
                      }}
                      className="flex items-center justify-center gap-2 p-3 bg-brand-500 text-white hover:bg-brand-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Return to Project
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Failure Screen */}
              {checkoutStep === 'failure' && (
                <div className="py-6 space-y-6 flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/25 text-red-500 rounded-full flex items-center justify-center shadow-sm">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h3 className="font-display font-black text-lg text-[var(--text)] tracking-tight">Payment Authorization Declined</h3>
                    <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed text-center">
                      The simulated transaction was rejected by the sandbox portal. Please verify your billing inputs and try again.
                    </p>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-3.5 pt-2">
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="p-3 border border-[var(--border)] hover:bg-[var(--bg-secondary)] text-[var(--text)] rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Cancel Checkout
                    </button>
                    <button
                      onClick={() => setCheckoutStep('gateway')}
                      className="p-3 bg-brand-500 text-white hover:bg-brand-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
