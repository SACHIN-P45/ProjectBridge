import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeColors = {
  bid: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  bid_accepted: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  payment: 'bg-emerald-100 text-emerald-600',
  message: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  project_update: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  review: 'bg-pink-100 text-pink-600',
  general: 'bg-slate-100 text-slate-600',
};

export default function NotificationDropdown({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unread } = useSelector((s) => s.notifications);
  const ref = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClick = (n) => {
    dispatch(markNotificationRead(n._id));
    if (n.link) { navigate(n.link); onClose(); }
  };

  return (
    <div ref={ref} className="absolute right-0 top-12 w-96 card shadow-2xl z-50 animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-brand-500" />
          <span className="font-semibold text-[var(--text)]">Notifications</span>
          {unread > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => dispatch(markAllNotificationsRead())}
            className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, index) => {
            let timeAgo = 'just now';
            if (n.createdAt) {
              try {
                timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
              } catch (e) {
                console.error("Invalid notification date:", n.createdAt);
              }
            }
            return (
              <div
                key={n._id || `notif-${index}-${n.createdAt || Date.now()}`}
                onClick={() => handleClick(n)}
                className={`px-5 py-4 cursor-pointer hover:bg-[var(--card-hover)] transition-colors ${!n.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5 ${typeColors[n.type] || typeColors.general}`}>
                    {n.type?.replace('_', ' ')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] leading-snug">{n.title || 'New Notification'}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{n.message}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {timeAgo}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
