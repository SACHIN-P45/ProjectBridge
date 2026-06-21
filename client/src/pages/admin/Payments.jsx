import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPayments } from '../../store/slices/adminSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  CreditCard, ArrowUpRight, ArrowDownRight, Clock, Search, X, 
  Eye, Calendar, FileText, CheckCircle2, DollarSign, User, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

export default function AdminPayments() {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((s) => s.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    dispatch(fetchAllPayments());
  }, [dispatch]);

  // Compute metrics dynamically
  const totalCount = payments ? payments.length : 0;
  
  const totalVolume = payments 
    ? payments.filter(p => ['completed', 'released'].includes(p.status)).reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  const escrowHeld = payments 
    ? payments.filter(p => ['held', 'pending'].includes(p.status)).reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  const refundedTotal = payments 
    ? payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  // Filter payments
  const filteredPayments = payments ? payments.filter(p => {
    const matchesSearch = 
      (p.razorpayPaymentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.project?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.student?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.developer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'released' && ['released', 'completed'].includes(p.status)) ||
      (statusFilter === 'held' && ['held', 'pending'].includes(p.status)) ||
      p.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'released':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400">
            <ArrowUpRight size={12} /> Released
          </span>
        );
      case 'held':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400">
            <Clock size={12} /> Held in Escrow
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400">
            <ArrowDownRight size={12} /> Refunded
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400">
            <AlertTriangle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full dark:bg-gray-800 dark:border-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Payments">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text)]">Escrow & Financials</h1>
          <p className="text-[var(--text-muted)] mt-1">Audit platform transactions, verify Razorpay receipts, and track escrow release logs.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Volume Released</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{formatCurrency(totalVolume)}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Held in Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{formatCurrency(escrowHeld)}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Refunded Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><ArrowDownRight size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{formatCurrency(refundedTotal)}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Transactions Count</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center"><CreditCard size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{totalCount}</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="card overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col lg:flex-row gap-4 justify-between bg-[var(--bg-secondary)] items-center">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] w-full lg:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'released', label: 'Released' },
              { id: 'held', label: 'Held in Escrow' },
              { id: 'refunded', label: 'Refunded' },
              { id: 'failed', label: 'Failed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id 
                    ? 'bg-brand-500 text-white shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search ID, Project, Student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/55 text-[var(--text-muted)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold pl-6">Transaction ID</th>
                <th className="p-4 font-semibold">Project</th>
                <th className="p-4 font-semibold">Student / Developer</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Created Date</th>
                <th className="p-4 font-semibold text-right pr-6">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--text-muted)]">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                    
                    {/* Transaction ID */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                          <CreditCard size={15} />
                        </div>
                        <span className="font-mono text-xs font-semibold text-[var(--text)]">
                          {payment.razorpayPaymentId || payment._id.slice(-10).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="p-4">
                      <p className="font-bold text-[var(--text)] truncate max-w-[180px]" title={payment.project?.title}>
                        {payment.project?.title || 'Unknown Project'}
                      </p>
                    </td>

                    {/* Parties */}
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <p className="text-[var(--text)]"><span className="font-semibold text-[var(--text-muted)]">From:</span> {payment.student?.name || 'N/A'}</p>
                        <p className="text-[var(--text)]"><span className="font-semibold text-[var(--text-muted)]">To:</span> {payment.developer?.name || 'N/A'}</p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-bold text-[var(--text)]">
                      {formatCurrency(payment.amount)}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {getStatusBadge(payment.status)}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-[var(--text-muted)] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5 opacity-100">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 rounded-xl border text-brand-500 border-brand-200 hover:bg-brand-500 hover:text-white dark:border-brand-900/30 dark:hover:bg-brand-900/20 transition-all"
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION RECEIPT MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]">
              <div>
                <h2 className="text-lg font-display font-black text-[var(--text)] flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" /> Transaction Receipt
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Secure payment voucher audited by razorpay</p>
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
                <div className="absolute right-0 bottom-0 translate-x-[25%] translate-y-[25%] w-24 h-24 bg-brand-500/5 rounded-full"></div>
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Amount Processed</p>
                <p className="text-3xl font-black text-[var(--text)] mt-1">{formatCurrency(selectedPayment.amount)}</p>
                <span className="inline-block mt-3 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                  Razorpay Verified
                </span>
              </div>

              {/* Transaction Specs */}
              <div className="space-y-3.5 text-xs">
                
                <div className="flex justify-between items-start">
                  <span className="text-[var(--text-muted)] font-medium">Project Name:</span>
                  <span className="font-bold text-[var(--text)] text-right truncate max-w-[220px]">{selectedPayment.project?.title || 'Unknown Project'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">Razorpay Payment ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{selectedPayment.razorpayPaymentId || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">Razorpay Order ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{selectedPayment.razorpayOrderId || 'N/A'}</span>
                </div>

                <div className="border-t border-[var(--border)] pt-3.5 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-1"><User size={13} /> Payer (Student):</span>
                    <span className="font-bold text-[var(--text)]">{selectedPayment.student?.name || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-1"><User size={13} /> Payee (Developer):</span>
                    <span className="font-bold text-[var(--text)]">{selectedPayment.developer?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-3.5 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium">Deposit Date:</span>
                    <span className="font-bold text-[var(--text)]">
                      {selectedPayment.paidAt ? format(new Date(selectedPayment.paidAt), 'MMM dd, yyyy hh:mm a') : format(new Date(selectedPayment.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)] font-medium">Release Date:</span>
                    <span className="font-bold text-[var(--text)]">
                      {selectedPayment.releasedAt ? format(new Date(selectedPayment.releasedAt), 'MMM dd, yyyy hh:mm a') : 
                       (selectedPayment.status === 'released' || selectedPayment.status === 'completed' ? 'Auto Released' : <span className="text-amber-500 italic">Funds Held</span>)}
                    </span>
                  </div>
                </div>

                {/* Refund Status */}
                {selectedPayment.refundStatus !== 'none' && (
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] space-y-1.5 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)] font-semibold">Refund Status:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{selectedPayment.refundStatus}</span>
                    </div>
                    {selectedPayment.refundReason && (
                      <div>
                        <span className="text-[var(--text-muted)] font-semibold">Reason:</span>
                        <p className="text-[var(--text)] italic mt-0.5">"{selectedPayment.refundReason}"</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Close Button */}
              <div className="pt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedPayment(null)}
                  className="btn-secondary w-full justify-center"
                >
                  Close Receipt
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
