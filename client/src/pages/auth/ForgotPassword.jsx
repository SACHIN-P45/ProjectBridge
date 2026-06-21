import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-600 via-violet-800 to-indigo-900 relative overflow-hidden items-center justify-center p-16">
        <BackgroundAnimation />
        <div className="relative z-10 max-w-xl text-white">
          <div className="flex items-center mb-10">
            <img src="/logo.png" alt="ProjectBridge Logo" className="h-20 w-auto object-contain drop-shadow-2xl" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 className="text-5xl font-display font-black mb-6 leading-[1.1] tracking-tight">
            Security and account recovery.
          </h1>
          <p className="text-lg text-white/80 mb-10 leading-relaxed font-light">
            If you have forgotten your password, enter your email address to securely restore access to your account and continue your work.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">128-bit Encrypted Tokens</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">Automated Expiry Limits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <BackgroundAnimation />
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          <Link to="/login" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-10 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          {!submitted ? (
            <>
              <div className="mb-10">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound size={24} />
                </div>
                <h2 className="font-display text-4xl font-black text-[var(--text)] mb-3">Forgot Password?</h2>
                <p className="text-[var(--text-muted)] text-base">Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending link...</>
                  ) : (
                    <><Mail size={20} /> Send Reset Link</>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-display text-3xl font-black text-[var(--text)] mb-4">Check your email</h2>
              <p className="text-[var(--text-muted)] text-base mb-8 leading-relaxed">
                We've sent a password reset link to <strong className="text-[var(--text)]">{email}</strong>. Please check your inbox and click the link to reset your password.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full py-4 bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--bg-secondary-hover)] text-[var(--text)] rounded-xl font-bold text-base justify-center transition-all transform active:scale-[0.98]"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
