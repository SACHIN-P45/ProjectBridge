import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ArrowLeft, Mail, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import api from '../../api/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const calledVerify = useRef(false);

  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const verifyToken = useCallback(async () => {
    try {
      const res = await api.get(`/auth/verify-email/${token}`);
      toast.success(res.data?.message || 'Email verified successfully!');
      if (user) {
        dispatch(setUser({ ...user, isVerified: true }));
      }
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'The verification link is invalid or has expired.');
      setStatus('error');
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    if (!token) {
      setErrorMsg('No verification token provided.');
      setStatus('error');
      return;
    }

    if (calledVerify.current) return;
    calledVerify.current = true;

    verifyToken();
  }, [token, verifyToken]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('New verification link sent to your email!');
      setResendSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification link');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-violet-800 to-brand-600 relative overflow-hidden items-center justify-center p-16">
        <BackgroundAnimation />
        <div className="relative z-10 max-w-xl text-white">
          <div className="flex items-center mb-10">
            <img src="/logo.png" alt="ProjectBridge Logo" className="h-20 w-auto object-contain drop-shadow-2xl" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 className="text-5xl font-display font-black mb-6 leading-[1.1] tracking-tight">
            Email Verification
          </h1>
          <p className="text-lg text-white/80 mb-10 leading-relaxed font-light">
            Verifying your email is a quick one-time security step to protect your identity and secure project bidding operations.
          </p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <BackgroundAnimation />
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          {status === 'verifying' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="font-display text-2xl font-black text-[var(--text)] mb-3">Verifying Email...</h2>
              <p className="text-[var(--text-muted)] text-base">Please wait while we secure your account details.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-display text-3xl font-black text-[var(--text)] mb-4">Email Verified!</h2>
              <p className="text-[var(--text-muted)] text-base mb-8 leading-relaxed font-light">
                Your email address has been successfully verified. Your ProjectBridge account is now fully active.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full py-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 justify-center transition-all transform active:scale-[0.98]"
              >
                Sign In to Account
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="mb-8 text-center sm:text-left">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="font-display text-3xl font-black text-[var(--text)] mb-3">Verification Failed</h2>
                <p className="text-[var(--text-muted)] text-base">{errorMsg}</p>
              </div>

              {!resendSuccess ? (
                <form onSubmit={handleResend} className="space-y-5">
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    If your activation link has expired, you can request a new one by entering your registered email below:
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[var(--text)] ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full py-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                  >
                    {resendLoading ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending Link...</>
                    ) : (
                      <><Mail size={20} /> Send Verification Link</>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl p-5 text-sm text-emerald-800 dark:text-emerald-400 flex items-start gap-3 animate-fade-in shadow-sm">
                  <div className="mt-0.5"><Sparkles size={18} /></div>
                  <div>
                    <p className="font-semibold mb-1">Link Sent Successfully!</p>
                    <p className="leading-relaxed font-light">We have sent a new activation link to <strong>{email}</strong>. Please check your inbox.</p>
                  </div>
                </div>
              )}

              <div className="mt-10 pt-6 border-t border-[var(--border)] text-center sm:text-left">
                <Link to="/login" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors text-sm font-medium">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
