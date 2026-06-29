import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentHistory } from '../../store/slices/paymentSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { CreditCard, CheckCircle, Clock, AlertCircle, Activity, Eye, Printer, X, ShieldCheck, AlertTriangle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock },
  completed: { label: 'Completed', icon: CheckCircle },
  held: { label: 'Held in Escrow', icon: Clock },
  released: { label: 'Released', icon: CheckCircle },
  refunded: { label: 'Refunded', icon: CheckCircle },
  failed: { label: 'Failed', icon: AlertCircle },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  
  const dotColor = {
    pending: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
    completed: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
    held: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
    released: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
    refunded: 'bg-slate-400 shadow-[0_0_8px_#94a3b8]',
    failed: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
  }[status] || 'bg-slate-400';

  const badgeCls = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    held: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    released: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    refunded: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  }[status] || 'bg-slate-500/10 text-slate-600 border border-slate-500/20';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

export default function StudentPayments() {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((s) => s.payment);
  
  // Custom modals and refund states
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  const totalSpent = history
    .filter(p => ['released', 'completed'].includes(p.status))
    .reduce((a, p) => a + p.amount, 0);

  const pendingEscrow = history
    .filter(p => p.status === 'held')
    .reduce((a, p) => a + p.amount, 0);

  const displayHistory = history.filter(p => p.status !== 'pending' || p.refundStatus !== 'none');

  const handlePrintReceipt = (payment) => {
    const printWindow = window.open('', '_blank');
    const dateStr = payment.paidAt 
      ? format(new Date(payment.paidAt), 'MMM d, yyyy hh:mm a') 
      : format(new Date(payment.createdAt), 'MMM d, yyyy hh:mm a');
    
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
              <div class="amount">₹${payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <span class="badge">Verified by Razorpay</span>
            </div>
            <div class="grid">
              <div class="row"><span class="label">Transaction ID</span><span class="value">${payment.razorpayPaymentId || payment._id.slice(-10).toUpperCase()}</span></div>
              <div class="row"><span class="label">Order ID</span><span class="value">${payment.razorpayOrderId || 'N/A'}</span></div>
              <div class="row"><span class="label">Project Title</span><span class="value">${payment.project?.title || 'Unknown Project'}</span></div>
              <div class="row"><span class="label">Payer (Student)</span><span class="value">${payment.student?.name || 'N/A'}</span></div>
              <div class="row"><span class="label">Payee (Developer)</span><span class="value">${payment.developer?.name || 'N/A'}</span></div>
              <div class="row"><span class="label">Payment Date</span><span class="value">${dateStr}</span></div>
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

  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Please enter a reason for the refund');
      return;
    }
    setSubmittingRefund(true);
    try {
      await api.post('/payments/refund', { paymentId: selectedPayment._id, reason: refundReason });
      toast.success('Refund request submitted successfully! 💸');
      setShowRefundModal(false);
      setRefundReason('');
      dispatch(fetchPaymentHistory());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <DashboardLayout title="Payments">
      {/* Overview Statistics Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {[
          { 
            label: 'Total Invested', 
            value: `₹${totalSpent.toLocaleString()}`, 
            desc: 'Successfully spent & released',
            color: 'from-brand-500 to-violet-600', 
            shadow: 'hover:shadow-[0_20px_45px_rgba(99,102,241,0.25)]' 
          },
          { 
            label: 'Total Transactions', 
            value: history.length, 
            desc: 'Completed order intents',
            color: 'from-emerald-500 to-teal-600', 
            shadow: 'hover:shadow-[0_20px_45px_rgba(16,185,129,0.25)]' 
          },
          { 
            label: 'Active Escrow', 
            value: `₹${pendingEscrow.toLocaleString()}`, 
            desc: 'Funds protected in contract',
            color: 'from-amber-500 to-orange-500', 
            shadow: 'hover:shadow-[0_20px_45px_rgba(245,158,11,0.25)]' 
          },
        ].map(({ label, value, desc, color, shadow }) => (
          <div key={label} className={`card p-6 bg-gradient-to-br ${color} border-0 text-white relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${shadow} group`}>
            {/* Background elements */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-white/5" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs opacity-75 font-black uppercase tracking-wider mb-2.5">{label}</p>
                <p className="text-3xl font-display font-black tracking-tight mb-1">{value}</p>
                <p className="text-[10px] opacity-75 font-semibold mt-1.5">{desc}</p>
              </div>
              <div className="p-3 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                <CreditCard size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History Section */}
      <div className="card overflow-hidden border border-[var(--border)] bg-[var(--card)]/65 backdrop-blur-md shadow-sm">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]/30 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-base text-[var(--text)] tracking-tight">Transaction History</h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-semibold">Monitor secure escrows and payments completed for your projects.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-500 shrink-0">
            <Activity size={18} />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : displayHistory.length === 0 ? (
          <div className="py-20 text-center text-[var(--text-muted)] select-none">
            <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CreditCard size={32} className="opacity-30 text-brand-500 animate-pulse" />
            </div>
            <p className="font-bold text-sm text-[var(--text)]">No transaction history found</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-xs mx-auto leading-relaxed">Secure Razorpay payments that you release to developers will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper border-0 rounded-none overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] pl-6 py-4">Project Request</th>
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] py-4">Assigned Developer</th>
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] py-4">Transaction Amount</th>
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] py-4">Escrow Status</th>
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] py-4">Paid Date</th>
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] pr-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayHistory.map((payment) => (
                  <tr key={payment._id} className="hover:bg-[var(--card-hover)]/30 transition-colors duration-150">
                    <td className="pl-6 py-4.5">
                      <p className="font-bold text-xs text-[var(--text)] truncate max-w-xs">{payment.project?.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold font-mono mt-1 select-all">{payment.razorpayOrderId}</p>
                    </td>
                    <td className="py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-black shadow-xs border border-white/20 shrink-0">
                          {payment.developer?.name?.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-[var(--text)]">{payment.developer?.name}</span>
                      </div>
                    </td>
                    <td className="py-4.5">
                      <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                        ₹{payment.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4.5 flex-row">
                      <div className="space-y-1">
                        <StatusBadge status={payment.status} />
                        {payment.refundStatus !== 'none' && (
                          <div className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">
                            Refund: {payment.refundStatus}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4.5 text-xs font-semibold text-[var(--text-muted)]">
                      {payment.paidAt 
                        ? format(new Date(payment.paidAt), 'MMM d, yyyy') 
                        : format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="pr-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-1.5 rounded-lg border text-brand-500 border-brand-200 hover:bg-brand-500 hover:text-white dark:border-brand-900/30 dark:hover:bg-brand-900/20 transition-all flex items-center justify-center"
                          title="View Receipt"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {payment.status === 'held' && payment.refundStatus === 'none' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRefundModal(true);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            title="Request Escrow Refund"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW RECEIPT MODAL */}
      {selectedPayment && !showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
              <div>
                <h2 className="text-lg font-display font-black text-[var(--text)] flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" /> Transaction Receipt
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-semibold uppercase tracking-wider">Escrow Proof of Deposit</p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Receipt Visual Header */}
              <div className="text-center py-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl relative overflow-hidden">
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Amount Deposited</p>
                <p className="text-3xl font-black text-[var(--text)] mt-1">₹{selectedPayment.amount?.toLocaleString()}</p>
                <span className="inline-block mt-3 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                  Razorpay Verified
                </span>
              </div>

              {/* Transaction Specs */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[var(--text-muted)] font-medium">Project Name:</span>
                  <span className="font-bold text-[var(--text)] text-right truncate max-w-[220px]">{selectedPayment.project?.title || 'Unknown Project'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">Transaction ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{selectedPayment.razorpayPaymentId || selectedPayment._id.slice(-10).toUpperCase()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">Razorpay Order ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{selectedPayment.razorpayOrderId || 'N/A'}</span>
                </div>

                <div className="border-t border-[var(--border)] pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-1"><User size={13} /> Assigned Developer:</span>
                    <span className="font-bold text-[var(--text)]">{selectedPayment.developer?.name || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-1"><Calendar size={13} /> Paid Date:</span>
                    <span className="font-bold text-[var(--text)]">
                      {selectedPayment.paidAt ? format(new Date(selectedPayment.paidAt), 'MMM dd, yyyy hh:mm a') : format(new Date(selectedPayment.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>
                </div>

                {/* Refund Status details */}
                {selectedPayment.refundStatus !== 'none' && (
                  <div className="p-3.5 bg-brand-500/5 border border-brand-500/10 rounded-2xl text-[11px] space-y-1.5 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)] font-semibold">Refund Status:</span>
                      <span className="font-bold text-blue-500 capitalize">{selectedPayment.refundStatus}</span>
                    </div>
                    {selectedPayment.refundReason && (
                      <div className="text-left">
                        <span className="text-[var(--text-muted)] font-semibold">Reason Submitted:</span>
                        <p className="text-[var(--text)] italic mt-0.5">"{selectedPayment.refundReason}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => handlePrintReceipt(selectedPayment)}
                  className="btn-secondary w-full justify-center flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedPayment(null)}
                  className="btn-primary w-full justify-center"
                >
                  Close Receipt
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* REQUEST REFUND MODAL */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
              <div>
                <h2 className="text-lg font-display font-black text-[var(--text)] flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-500" /> Request Escrow Refund
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-semibold uppercase tracking-wider">Audit Request for Held Funds</p>
              </div>
              <button 
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedPayment(null);
                  setRefundReason('');
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-left text-xs text-red-600 dark:text-red-400 space-y-1.5 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[10px]">Important Security Policy</p>
                <p>
                  By submitting this request, you are requesting a refund of the 50% escrow deposit for <strong>{selectedPayment.project?.title}</strong>.
                </p>
                <p>
                  Platform administrators will audit the project progress and communication logs to make a fair decision. The developer will be notified.
                </p>
              </div>

              <div className="text-left space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">State your reason for cancellation & refund</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="input w-full min-h-[100px] resize-none text-xs"
                  placeholder="e.g. Developer went missing / did not provide updates for 7 days..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  disabled={submittingRefund}
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPayment(null);
                    setRefundReason('');
                  }}
                  className="btn-secondary flex-1 justify-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  disabled={submittingRefund || !refundReason.trim()}
                  onClick={handleRequestRefund}
                  className="btn-primary flex-1 justify-center bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 flex items-center gap-1.5 border-0"
                >
                  {submittingRefund ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : 'Submit Request'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
