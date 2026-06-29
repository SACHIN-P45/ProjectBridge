import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarnings } from '../../store/slices/paymentSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { DollarSign, TrendingUp, Award, Eye, Printer, X, ShieldCheck, User, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function Earnings() {
  const dispatch = useDispatch();
  const { earnings, loading } = useSelector((s) => s.payment);
  const { user } = useSelector((s) => s.auth);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => { dispatch(fetchEarnings()); }, []);

  const handlePrintStatement = (payment) => {
    const printWindow = window.open('', '_blank');
    const dateStr = payment.releasedAt 
      ? format(new Date(payment.releasedAt), 'MMM d, yyyy hh:mm a') 
      : format(new Date(payment.createdAt), 'MMM d, yyyy hh:mm a');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Escrow Release Statement - ProjectBridge</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
            .statement-card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px; max-width: 480px; margin: 20px auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05); background: #ffffff; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 15px; }
            .logo { font-size: 24px; font-weight: 900; color: #3b82f6; margin-bottom: 4px; letter-spacing: -0.025em; }
            .title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.05em; }
            .payout-section { text-align: center; background: #f0fdf4; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #dcfce7; }
            .payout-label { font-size: 10px; text-transform: uppercase; color: #166534; font-weight: 700; }
            .amount { font-size: 30px; font-weight: 900; color: #15803d; margin: 4px 0; }
            .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; border: 1px solid #bfdbfe; }
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
              .statement-card {
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
          <div class="statement-card">
            <div class="header">
              <div class="logo">ProjectBridge</div>
              <div class="title">Escrow Release & Payout Statement</div>
            </div>
            <div class="payout-section">
              <div class="payout-label font-sans">Net Payout Transferred</div>
              <div class="amount font-display">₹${payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <span class="badge">Escrow Released</span>
            </div>
            <div class="grid font-sans">
              <div class="row"><span class="label">Reference Payout ID</span><span class="value">PAY-REL-${payment._id.slice(-8).toUpperCase()}</span></div>
              <div class="row"><span class="label">Project Completed</span><span class="value">${payment.project?.title || 'Unknown Project'}</span></div>
              <div class="row"><span class="label">Payer (Student)</span><span class="value">${payment.student?.name || 'Platform Student'}</span></div>
              <div class="row"><span class="label">Payee (Developer)</span><span class="value">${payment.developer?.name || 'N/A'}</span></div>
              <div class="row"><span class="label">Release Date & Time</span><span class="value">${dateStr}</span></div>
              <div class="row"><span class="label">Platform Commission (5%)</span><span class="value text-slate-400 line-through">₹${((payment.amount || 0) * 0.05).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Waived)</span></div>
              <div class="row"><span class="label">Ledger Status</span><span class="value text-emerald-600 font-bold uppercase tracking-wider">Settled & Cleared</span></div>
            </div>
            <div class="footer font-sans">
              Thank you for providing your freelance services on ProjectBridge.<br>This statement acts as official proof of milestone escrow payout settlement. Platform commissions have been waived under our Early Adopter promotion.
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

  if (loading) return (
    <DashboardLayout title="Earnings">
      <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
    </DashboardLayout>
  );

  const monthlyData = earnings?.monthly || {};

  return (
    <DashboardLayout title="Earnings">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="card p-6 bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign size={120} />
          </div>
          <DollarSign size={24} className="mb-3 opacity-80" />
          <p className="text-2xl font-display font-black mb-1">₹{(earnings?.totalEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-85">Cleared Earnings</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={120} />
          </div>
          <TrendingUp size={24} className="mb-3 opacity-80" />
          <p className="text-2xl font-display font-black mb-1">₹{(earnings?.escrowBalance || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-85">Escrow Balance</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-brand-500 to-violet-600 border-0 text-white relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform">
            <Award size={120} />
          </div>
          <Award size={24} className="mb-3 opacity-80" />
          <p className="text-2xl font-display font-black mb-1">
            {earnings?.payments?.filter(p => p.status === 'released').length || 0}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-85">Milestones Cleared</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-pink-500 to-rose-500 border-0 text-white relative overflow-hidden group shadow-lg">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform">
            <Star size={120} />
          </div>
          <Star size={24} className="mb-3 opacity-80" />
          <p className="text-2xl font-display font-black mb-1">{user?.rating || 0}★</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-85">Average Rating</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Breakdown */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-lg text-[var(--text)] mb-5">Monthly Breakdown</h3>
          {Object.keys(monthlyData).length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No earnings data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(monthlyData).map(([month, amount]) => {
                const max = Math.max(...Object.values(monthlyData));
                const pct = Math.round((amount / max) * 100);
                return (
                  <div key={month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--text-muted)]">{month}</span>
                      <span className="font-semibold text-[var(--text)]">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div className="progress-bar h-2" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="font-display font-bold text-lg text-[var(--text)]">Earnings History</h3>
          </div>
          {!earnings?.payments?.length ? (
            <div className="py-16 text-center text-[var(--text-muted)]">
              <DollarSign size={40} className="mx-auto mb-3 opacity-25" />
              <p className="font-semibold">No earnings yet</p>
              <p className="text-sm">Complete projects to see your earnings here</p>
            </div>
          ) : (
            <div className="table-wrapper border-0 rounded-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right pr-6">Statement</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payments.map((p) => (
                    <tr key={p._id}>
                      <td className="font-semibold text-[var(--text)]">{p.project?.title || 'Project'}</td>
                      <td>
                        <span className="font-bold text-[var(--text)]">₹{p.amount?.toLocaleString('en-IN')}</span>
                      </td>
                      <td>
                        {p.status === 'released' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                            Released
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
                            Escrowed
                          </span>
                        )}
                      </td>
                      <td className="text-[var(--text-muted)] text-sm">
                        {p.status === 'released'
                          ? (p.releasedAt ? format(new Date(p.releasedAt), 'MMM d, yyyy') : '—')
                          : (p.paidAt ? format(new Date(p.paidAt), 'MMM d, yyyy') : format(new Date(p.createdAt), 'MMM d, yyyy'))
                        }
                      </td>
                      <td className="text-right pr-6">
                        {p.status === 'released' ? (
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-1.5 rounded-lg border text-brand-500 border-brand-200 hover:bg-brand-500 hover:text-white dark:border-brand-900/30 dark:hover:bg-brand-900/20 transition-all inline-flex items-center justify-center"
                            title="View Escrow Release Statement"
                          >
                            <Eye size={14} />
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] italic">Awaiting clearance</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PAYOUT STATEMENT MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
              <div>
                <h2 className="text-lg font-display font-black text-[var(--text)] flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" /> Payout Statement
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-semibold uppercase tracking-wider">Escrow Release Voucher</p>
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
              
              {/* Statement Visual Header */}
              <div className="text-center py-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl relative overflow-hidden">
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Net Funds Released</p>
                <p className="text-3xl font-black text-emerald-500 mt-1">₹{selectedPayment.amount?.toLocaleString()}</p>
                <span className="inline-block mt-3 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                  Cleared to Balance
                </span>
              </div>

              {/* Transaction Specs */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[var(--text-muted)] font-medium">Project Name:</span>
                  <span className="font-bold text-[var(--text)] text-right truncate max-w-[220px]">{selectedPayment.project?.title || 'Unknown Project'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">Payout ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">PAY-REL-{selectedPayment._id.slice(-8).toUpperCase()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">Transaction ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{selectedPayment.razorpayPaymentId || 'N/A'}</span>
                </div>

                <div className="border-t border-[var(--border)] pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-1"><User size={13} /> Client (Student):</span>
                    <span className="font-bold text-[var(--text)]">{selectedPayment.student?.name || 'Platform Student'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-1"><Calendar size={13} /> Settlement Date:</span>
                    <span className="font-bold text-[var(--text)]">
                      {selectedPayment.releasedAt ? format(new Date(selectedPayment.releasedAt), 'MMM dd, yyyy hh:mm a') : format(new Date(selectedPayment.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium">Platform Commission (5%):</span>
                    <span className="text-slate-400 font-semibold line-through">₹{((selectedPayment.amount || 0) * 0.05).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Waived)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => handlePrintStatement(selectedPayment)}
                  className="btn-secondary w-full justify-center flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print Statement
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedPayment(null)}
                  className="btn-primary w-full justify-center"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
