import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import api from '../../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
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
            Reset password securely.
          </h1>
          <p className="text-lg text-white/80 mb-10 leading-relaxed font-light">
            Create a strong password containing at least 6 characters. Make sure it isn't something you use for other websites or services.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">Minimum 6 characters requirement</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">Immediate token invalidation upon save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <BackgroundAnimation />
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          <div className="mb-10">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h2 className="font-display text-4xl font-black text-[var(--text)] mb-3">Reset Password</h2>
            <p className="text-[var(--text-muted)] text-base">Enter and confirm your new secure account password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--text)] ml-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--text)] ml-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving password...</>
              ) : (
                <><CheckCircle2 size={20} /> Save New Password</>
              )}
            </button>
          </form>

          <p className="text-center text-base text-[var(--text-muted)] mt-10">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold ml-1">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
