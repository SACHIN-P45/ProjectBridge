import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import AuthVisualShowcase from '../../components/common/AuthVisualShowcase';
import api from '../../api/axios';

// Password strength helper
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-500' },
    { score: 3, label: 'Good', color: 'bg-blue-500' },
    { score: 4, label: 'Strong', color: 'bg-emerald-500' },
  ];
  return levels[score] || levels[0];
};

export default function DeveloperSetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // email can be passed via navigate state (from VerifyEmail page)
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirm && password === confirm;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  useEffect(() => {
    document.title = 'Set Your Password — ProjectBridge';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email address is required.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (password !== confirm) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/admin/developers/set-password', { email, password });
      setSuccess(true);
      toast.success('Password set! You can now log in.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] transition-colors duration-300">
      {/* Left Panel */}
      <AuthVisualShowcase />

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        <BackgroundAnimation />

        {/* Mobile ambient glows */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full filter blur-3xl" />
        </div>

        <div className="w-full max-w-[480px] relative z-10 animate-slide-up glassmorphic-card p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5">

          {/* ---- SUCCESS STATE ---- */}
          {success ? (
            <div className="text-center py-4 animate-slide-up">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-float">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path className="animate-stroke-check" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-black text-[var(--text)] tracking-tight mb-3">
                You're All Set! 🎉
              </h2>
              <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
                Your password has been created. Your developer account on <strong className="text-[var(--text)]">ProjectBridge</strong> is now fully active and ready to go.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full py-4 bg-gradient-to-r from-violet-500 via-indigo-600 to-brand-500 hover:from-violet-600 hover:to-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 justify-center items-center gap-2 transition-all transform active:scale-[0.98] animate-gradient-bg"
              >
                <ArrowRight size={18} /> Go to Login
              </Link>
            </div>
          ) : (
            /* ---- FORM STATE ---- */
            <>
              {/* Header */}
              <div className="mb-8">
                {/* Step Badge */}
                <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-full px-3 py-1 text-xs font-bold mb-5">
                  <KeyRound size={13} />
                  Developer Account Setup
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-2 mb-6">
                  {/* Step 1 - done */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:block">Email Verified</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full" />
                  {/* Step 2 - active */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
                      <span className="text-xs font-black">2</span>
                    </div>
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 hidden sm:block">Set Password</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-[var(--border)] rounded-full" />
                  {/* Step 3 - upcoming */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] hidden sm:block">Login</span>
                  </div>
                </div>

                <h2 className="font-display text-4xl font-black text-[var(--text)] tracking-tight mb-2">
                  Set Your Password
                </h2>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Create a strong personal password for your developer account. You'll use this every time you log in.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field (pre-filled, editable if not passed) */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                      <Lock size={17} />
                    </div>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors z-10"
                    >
                      {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1 animate-fade-in">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : 'bg-[var(--border)]'
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-xs font-semibold ${
                          strength.score === 4 ? 'text-emerald-500' :
                          strength.score === 3 ? 'text-blue-500' :
                          strength.score === 2 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                      {passwordsMatch
                        ? <CheckCircle2 size={17} className="text-emerald-500" />
                        : <Lock size={17} />
                      }
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className={`w-full pl-11 pr-12 py-3 bg-[var(--bg-secondary)] border rounded-xl outline-none text-[var(--text)] text-sm transition-all focus:ring-2 ${
                        passwordMismatch
                          ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                          : passwordsMatch
                          ? 'border-emerald-400 focus:ring-emerald-400 focus:border-emerald-400'
                          : 'border-[var(--border)] focus:ring-violet-500 focus:border-violet-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors z-10"
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="text-xs text-red-500 mt-1.5 animate-fade-in">Passwords do not match.</p>
                  )}
                  {passwordsMatch && (
                    <p className="text-xs text-emerald-500 mt-1.5 animate-fade-in flex items-center gap-1">
                      <CheckCircle2 size={12} /> Passwords match
                    </p>
                  )}
                </div>

                {/* Security tips */}
                <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={15} className="text-violet-500" />
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400">Password Tips</p>
                  </div>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc list-inside">
                    <li>Use at least 8 characters</li>
                    <li>Mix uppercase, numbers & symbols</li>
                    <li>Don't reuse passwords from other sites</li>
                  </ul>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || passwordMismatch}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-violet-500 via-indigo-600 to-brand-500 hover:from-violet-600 hover:to-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] animate-gradient-bg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Activate My Account
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-[var(--text-muted)] mt-6">
                Already set your password?{' '}
                <Link to="/login" className="text-violet-500 hover:text-violet-600 font-bold transition-colors">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
