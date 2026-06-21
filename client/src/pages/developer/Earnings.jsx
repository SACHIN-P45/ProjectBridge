import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarnings } from '../../store/slices/paymentSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function Earnings() {
  const dispatch = useDispatch();
  const { earnings, loading } = useSelector((s) => s.payment);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchEarnings()); }, []);

  if (loading) return (
    <DashboardLayout title="Earnings">
      <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
    </DashboardLayout>
  );

  const monthlyData = earnings?.monthly || {};

  return (
    <DashboardLayout title="Earnings">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="card p-6 bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white">
          <DollarSign size={28} className="mb-3 opacity-80" />
          <p className="text-3xl font-display font-black mb-1">₹{(earnings?.totalEarnings || 0).toLocaleString()}</p>
          <p className="text-sm opacity-80">Total Earnings</p>
        </div>
        <div className="card p-6 bg-gradient-to-br from-brand-500 to-violet-600 border-0 text-white">
          <TrendingUp size={28} className="mb-3 opacity-80" />
          <p className="text-3xl font-display font-black mb-1">{earnings?.payments?.length || 0}</p>
          <p className="text-sm opacity-80">Projects Delivered</p>
        </div>
        <div className="card p-6 bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white">
          <Award size={28} className="mb-3 opacity-80" />
          <p className="text-3xl font-display font-black mb-1">{user?.rating || 0}★</p>
          <p className="text-sm opacity-80">Average Rating</p>
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
                      <span className="font-semibold text-[var(--text)]">₹{amount.toLocaleString()}</span>
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
                  <tr><th>Project</th><th>Amount</th><th>Released</th></tr>
                </thead>
                <tbody>
                  {earnings.payments.map((p) => (
                    <tr key={p._id}>
                      <td className="font-semibold">{p.project?.title}</td>
                      <td><span className="font-bold text-emerald-500">₹{p.amount?.toLocaleString()}</span></td>
                      <td className="text-[var(--text-muted)]">
                        {p.releasedAt ? format(new Date(p.releasedAt), 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
