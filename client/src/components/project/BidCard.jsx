import { Star, Clock, DollarSign, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', cls: 'badge-yellow' },
  accepted: { label: 'Accepted', cls: 'badge-green' },
  rejected: { label: 'Rejected', cls: 'badge-red' },
};

export default function BidCard({ bid, isStudent = false, onAccept, onChat }) {
  const dev = bid.developer;
  const status = statusConfig[bid.status] || statusConfig.pending;

  return (
    <div className={`card p-6 animate-fade-in ${bid.status === 'accepted' ? 'border-2 border-emerald-400 shadow-glow' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Developer info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            {dev?.avatar ? (
              <img src={dev.avatar} alt={dev.name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
                {dev?.name?.charAt(0)}
              </div>
            )}
            {bid.status === 'accepted' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-[var(--text)]">{dev?.name}</h3>
              <span className={status.cls}>{status.label}</span>
            </div>
            {dev?.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < Math.round(dev.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                ))}
                <span className="text-xs text-[var(--text-muted)] ml-1">{dev.rating} ({dev.totalReviews})</span>
              </div>
            )}
            {dev?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {dev.skills.slice(0, 4).map((s) => (
                  <span key={s} className="badge-blue">{s}</span>
                ))}
              </div>
            )}
            <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">{bid.proposal}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex sm:flex-col gap-4 sm:gap-3 sm:items-end flex-shrink-0">
          <div className="text-center sm:text-right">
            <p className="text-xs text-[var(--text-muted)]">Price</p>
            <p className="text-2xl font-display font-bold text-emerald-500">₹{bid.price?.toLocaleString()}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-[var(--text-muted)]">Delivery</p>
            <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1">
              <Clock size={13} /> {bid.deliveryDays} days
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">
              {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
            </p>
          </div>

          {/* Actions for student */}
          {isStudent && bid.status === 'pending' && (
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button onClick={() => onAccept(bid._id)} className="btn-success text-sm py-2">
                <CheckCircle size={14} /> Accept
              </button>
            </div>
          )}
          {bid.status === 'accepted' && onChat && (
            <button onClick={onChat} className="btn-primary text-sm py-2">
              <MessageSquare size={14} /> Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
