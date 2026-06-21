import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentHistory } from '../../store/slices/paymentSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { CreditCard, CheckCircle, Clock, AlertCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';

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

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  const totalSpent = history
    .filter(p => ['held', 'released', 'completed'].includes(p.status))
    .reduce((a, p) => a + p.amount, 0);

  const pendingEscrow = history
    .filter(p => p.status === 'pending' || p.status === 'held')
    .reduce((a, p) => a + p.amount, 0);

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
        ) : history.length === 0 ? (
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
                  <th className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] pr-6 py-4">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {history.map((payment) => (
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
                    <td className="py-4.5">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="pr-6 py-4.5 text-xs font-semibold text-[var(--text-muted)]">
                      {payment.paidAt 
                        ? format(new Date(payment.paidAt), 'MMM d, yyyy') 
                        : format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
