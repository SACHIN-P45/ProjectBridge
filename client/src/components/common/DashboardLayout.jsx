import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Mail, ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import { logout, setUser } from '../../store/slices/authSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children, title }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      toast.success('Verification link resent successfully! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification link.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/auth/me');
      if (res.data.isVerified) {
        dispatch(setUser(res.data));
        toast.success('Account successfully verified! Welcome.');
      } else {
        toast.error('Account is still pending email verification.');
      }
    } catch (err) {
      toast.error('Failed to sync account status.');
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-sync verification status on mount and tab focus
  useEffect(() => {
    if (!user || user.isVerified) return;

    const checkStatus = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.isVerified) {
          dispatch(setUser(res.data));
          toast.success('Account successfully verified! Welcome.');
        }
      } catch (err) {
        // Silent error handling for automatic background syncs
      }
    };

    // Run check immediately on mount
    checkStatus();

    // Listen for tab focus
    const onFocus = () => {
      checkStatus();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [user, dispatch]);

  const showVerificationLock = user && user.role !== 'admin' && !user.isVerified;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container animate-fade-in">
            {showVerificationLock ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 select-none">
                <div className="w-full max-w-md relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl animate-slide-up text-center">
                  
                  {/* Subtle Background Glows */}
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-brand-500/10 rounded-full filter blur-2xl"></div>
                  <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-violet-500/10 rounded-full filter blur-2xl"></div>
                  
                  <div className="relative z-10">
                    {/* Animated Pulsing Icon */}
                    <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-violet-500/10 text-violet-500 rounded-3xl animate-pulse">
                      <Mail size={40} className="stroke-[1.5]" />
                      <div className="absolute -right-1 -top-1 w-5 h-5 bg-amber-500 text-white rounded-full border-2 border-[var(--card)] flex items-center justify-center">
                        <ShieldAlert size={12} className="stroke-[2.5]" />
                      </div>
                    </div>

                    <h2 className="font-display text-2xl font-black text-[var(--text)] tracking-tight">
                      Verification Required
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed font-light">
                      Please verify your email address to unlock your account. We sent a secure activation link to:
                    </p>
                    
                    <div className="my-5 p-3.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
                      <p className="font-semibold text-sm text-[var(--text)] select-text break-all">{user.email}</p>
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-500 mt-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                        Pending Verification
                      </span>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleCheckStatus}
                        disabled={refreshing || resending}
                        className="w-full btn-primary justify-center font-bold text-sm shadow-md disabled:opacity-50"
                      >
                        {refreshing ? (
                          <><RefreshCw size={16} className="animate-spin" /> Syncing Status...</>
                        ) : (
                          <><RefreshCw size={16} /> I Have Verified My Email</>
                        )}
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleResend}
                          disabled={resending || refreshing}
                          className="btn-secondary justify-center text-xs font-semibold disabled:opacity-50"
                        >
                          {resending ? (
                            <><RefreshCw size={12} className="animate-spin" /> Sending...</>
                          ) : (
                            'Resend Link'
                          )}
                        </button>
                        <button
                          onClick={handleLogout}
                          disabled={refreshing || resending}
                          className="btn-secondary justify-center text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <LogOut size={12} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
