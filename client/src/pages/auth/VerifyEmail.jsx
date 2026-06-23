import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ArrowLeft, Mail, Sparkles, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import AuthVisualShowcase from '../../components/common/AuthVisualShowcase';
import api from '../../api/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'developer-set-password', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
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
      // Developer first-login flow: redirect to set-password page
      if (res.data?.role === 'developer' && res.data?.mustChangePassword) {
        setVerifiedEmail(res.data.email || '');
        setStatus('developer-set-password');
      } else {
        setStatus('success');
      }
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
    <div className="min-h-screen flex bg-[var(--bg)] transition-colors duration-300">
      {/* Left Panel - Dynamic Visual Showcase */}
      <AuthVisualShowcase />

      {/* Right Panel - Form / Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        <BackgroundAnimation />
        
        {/* Mobile-only ambient background glows */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-500/20 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full filter blur-3xl" />
        </div>

        {/* Card (Glassmorphic) */}
        <div className="w-full max-w-[480px] relative z-10 animate-slide-up glassmorphic-card p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5">
          
          {status === 'verifying' && (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_15px_rgba(59,130,246,0.25)]"></div>
              <h2 className="font-display text-2xl font-black text-[var(--text)] mb-3">Verifying Email...</h2>
              <p className="text-[var(--text-muted)] text-sm">Please wait while we secure your account details.</p>
            </div>
          )}

          {/* Developer first-login: email verified, now set password */}
          {status === 'developer-set-password' && (
            <div className="text-center py-4 animate-slide-up">
              <div className="w-20 h-20 bg-violet-500/10 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(139,92,246,0.25)] animate-float">
                <KeyRound size={36} />
              </div>
              <h2 className="font-display text-3xl font-black text-[var(--text)] tracking-tight mb-3">
                Email Verified! ✅
              </h2>
              <p className="text-[var(--text-muted)] text-sm mb-2 leading-relaxed">
                Great — your email is confirmed. One last step:
              </p>
              <p className="text-[var(--text)] text-sm font-semibold mb-8">
                Set your own personal password to activate your developer account.
              </p>
              {/* Step progress pill */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={13} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>
                <div className="flex-1 max-w-[60px] h-0.5 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-xs font-black">2</span>
                  </div>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Set Password</span>
                </div>
                <div className="flex-1 max-w-[60px] h-0.5 bg-[var(--border)] rounded-full" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">Login</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/developer/set-password', { state: { email: verifiedEmail } })}
                className="inline-flex w-full py-4 bg-gradient-to-r from-violet-500 via-indigo-600 to-brand-500 hover:from-violet-600 hover:to-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 justify-center items-center gap-2 transition-all transform active:scale-[0.98] animate-gradient-bg"
              >
                <KeyRound size={18} /> Set My Password
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4 animate-slide-up">
              {/* Drawing Circle Checkmark with Float Animation */}
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-float">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path className="animate-stroke-check" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="font-display text-3xl font-black text-[var(--text)] tracking-tight mb-3">Email Verified!</h2>
              
              <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed font-light">
                Your email address has been successfully verified. Your ProjectBridge account is now fully active.
              </p>
              
              <Link
                to="/login"
                className="inline-flex w-full py-4 bg-gradient-to-r from-brand-500 via-indigo-600 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 justify-center transition-all transform active:scale-[0.98] animate-gradient-bg"
              >
                Sign In to Account
              </Link>
            </div>
          )}


          {status === 'error' && (
            <div className="animate-fade-in">
              <div className="mb-6 text-center sm:text-left">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-float">
                  <ShieldAlert size={22} />
                </div>
                <h2 className="font-display text-3xl font-black text-[var(--text)] tracking-tight mb-2">Verification Failed</h2>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">{errorMsg}</p>
              </div>

              {!resendSuccess ? (
                <form onSubmit={handleResend} className="space-y-5">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-light">
                    If your activation link has expired, you can request a new one by entering your registered email address below:
                  </p>
                  
                  {/* Email Input with Floating Label */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      id="verify-resend-email"
                      className="peer w-full pl-11 pr-4 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm"
                      required
                    />
                    <label 
                      htmlFor="verify-resend-email"
                      className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
                    >
                      Email Address
                    </label>
                  </div>

                  {/* Resend button */}
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full py-4 bg-gradient-to-r from-brand-500 via-indigo-600 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] animate-gradient-bg"
                  >
                    {resendLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                        Sending Link...
                      </>
                    ) : (
                      <>
                        <Mail size={18} /> 
                        Send Verification Link
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success send notification banner */
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-400 flex items-start gap-3 animate-fade-in shadow-sm">
                  <div className="mt-0.5 text-emerald-500 shrink-0"><Sparkles size={16} /></div>
                  <div>
                    <p className="font-bold mb-1">Link Sent Successfully!</p>
                    <p className="leading-relaxed font-light">
                      We have sent a new activation link to <strong className="font-semibold text-emerald-950 dark:text-emerald-100">{email}</strong>. Please check your inbox.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-[var(--border)] text-center sm:text-left">
                <Link to="/login" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors text-sm font-semibold group">
                  <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
