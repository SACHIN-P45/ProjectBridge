import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendGlobalNotification } from '../../store/slices/adminSlice';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/slices/notificationSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Bell, Send, ShieldAlert, CheckCircle, Info, Sparkles, 
  X, Check, Clock, Eye, AlertTriangle, ShieldCheck, Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const dispatch = useDispatch();
  const { notifications, unread, loading: notificationsLoading } = useSelector((s) => s.notifications);

  const [form, setForm] = useState({ title: '', message: '' });
  const [importance, setImportance] = useState('info'); // info, warning, alert, success
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error('Please fill in all fields');
    }

    let prefix = '📢 [INFO] ';
    if (importance === 'warning') prefix = '⚠️ [WARNING] ';
    else if (importance === 'alert') prefix = '🚨 [CRITICAL ALERT] ';
    else if (importance === 'success') prefix = '✅ [ANNOUNCEMENT] ';
    
    setSending(true);
    const res = await dispatch(sendGlobalNotification({
      title: `${prefix}${form.title}`,
      message: form.message
    }));
    
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Global announcement dispatched to all platform users!');
      setForm({ title: '', message: '' });
      dispatch(fetchNotifications()); // refresh log
    } else {
      toast.error(res.payload || 'Failed to dispatch notification');
    }
    setSending(false);
  };

  const handleMarkAllRead = () => {
    if (unread > 0) {
      dispatch(markAllNotificationsRead());
      toast.success('All notifications marked as read');
    }
  };

  const handleMarkSingleRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  // Get active style configuration for preview
  const getPreviewConfig = () => {
    switch (importance) {
      case 'warning':
        return {
          icon: AlertTriangle,
          bgClass: 'bg-amber-500/10 border-amber-500/25',
          iconClass: 'text-amber-500 bg-amber-500/10',
          badgeText: 'Warning Announcement',
          prefixText: '⚠️ [WARNING] '
        };
      case 'alert':
        return {
          icon: ShieldAlert,
          bgClass: 'bg-red-500/10 border-red-500/25',
          iconClass: 'text-red-500 bg-red-500/10',
          badgeText: 'Critical System Alert',
          prefixText: '🚨 [CRITICAL ALERT] '
        };
      case 'success':
        return {
          icon: ShieldCheck,
          bgClass: 'bg-emerald-500/10 border-emerald-500/25',
          iconClass: 'text-emerald-500 bg-emerald-500/10',
          badgeText: 'Platform Success Alert',
          prefixText: '✅ [ANNOUNCEMENT] '
        };
      default:
        return {
          icon: Info,
          bgClass: 'bg-blue-500/10 border-blue-500/25',
          iconClass: 'text-blue-500 bg-blue-500/10',
          badgeText: 'General Information',
          prefixText: '📢 [INFO] '
        };
    }
  };

  const preview = getPreviewConfig();
  const PreviewIcon = preview.icon;

  return (
    <DashboardLayout title="Announcements">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text)]">Communications Center</h1>
          <p className="text-[var(--text-muted)] mt-1">Broadcast system announcements and inspect system alerts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Form & Real-time device Preview (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Creator card */}
          <div className="card p-6 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-[var(--border)]">
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Broadcast New Announcement</h2>
                <p className="text-xs text-[var(--text-muted)]">Sends a real-time push alert to students and developers.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Alert level selection */}
              <div>
                <label className="input-label">Alert Severity Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'info', label: 'Info', color: 'border-blue-500/20 hover:bg-blue-500/5 text-blue-500', activeColor: 'bg-blue-500 text-white border-blue-500' },
                    { id: 'success', label: 'Announcement', color: 'border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-500', activeColor: 'bg-emerald-500 text-white border-emerald-500' },
                    { id: 'warning', label: 'Warning', color: 'border-amber-500/20 hover:bg-amber-500/5 text-amber-500', activeColor: 'bg-amber-500 text-white border-amber-500' },
                    { id: 'alert', label: 'Critical', color: 'border-red-500/20 hover:bg-red-500/5 text-red-500', activeColor: 'bg-red-50 text-white bg-red-500 border-red-500' }
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setImportance(level.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        importance === level.id ? level.activeColor : `bg-[var(--bg-secondary)] ${level.color}`
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="input-label">Announcement Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Server Maintenance Scheduled"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  maxLength={60}
                />
              </div>

              {/* Message */}
              <div>
                <label className="input-label">Message Details</label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="Write the broadcast body content..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-xs flex gap-2.5 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Security Note:</strong> Dispatched global announcements cannot be retracted. They will trigger instant notification sounds for all online participants.
                </p>
              </div>

              {/* Send */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={sending}
                  className="btn-primary w-full justify-center py-3 flex items-center gap-2 shadow-lg"
                >
                  {sending ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Dispatching...</>
                  ) : (
                    <><Send size={18} /> Dispatch Global Broadcast</>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Real-time Push Preview */}
          <div className="card p-6 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-500" /> Real-time Device Preview
            </h3>
            
            {/* Simulated smartphone push notification */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-slate-800 border border-slate-700`}>
                  <Bell size={18} className="text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
                    <span>ProjectBridge • Announcement</span>
                    <span>Just Now</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-100 truncate">
                    {form.title ? `${preview.prefixText}${form.title}` : `${preview.prefixText}Announcement Title`}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                    {form.message || 'Announcement description details will be previewed here in real-time as you type them...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Personal Admin System log (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-[var(--card)] border border-[var(--border)] rounded-3xl flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-1.5">
                    System Alerts Log
                  </h2>
                  <p className="text-[var(--text-muted)] text-[10px]">Recent activity alerts received by your account.</p>
                </div>
                {unread > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-0.5"
                  >
                    Mark read ({unread})
                  </button>
                )}
              </div>

              {/* Logs Feed */}
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {notificationsLoading ? (
                  <div className="py-12 text-center text-[var(--text-muted)] text-sm flex flex-col items-center gap-2">
                    <span className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                    <span>Syncing alerts log...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-16 text-center text-[var(--text-muted)] text-xs italic">
                    No system alerts recorded for your account.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
                      className={`p-3.5 rounded-2xl border transition-all text-xs flex gap-3 ${
                        n.isRead 
                          ? 'bg-[var(--bg-secondary)]/50 border-[var(--border)] opacity-75' 
                          : 'bg-brand-500/5 border-brand-500/25 hover:bg-brand-500/10 cursor-pointer'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        n.isRead ? 'bg-[var(--border)] text-[var(--text-muted)]' : 'bg-brand-500/10 text-brand-500'
                      }`}>
                        <Bell size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center gap-2">
                          <p className={`font-bold truncate text-xs ${n.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
                          <Clock size={11} />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </DashboardLayout>
  );
}
