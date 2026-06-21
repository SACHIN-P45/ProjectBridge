import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, LogIn, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import api from '../../api/axios';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (error) { 
      toast.error(error); 
      if (error.toLowerCase().includes('verify')) {
        setShowResend(true);
      }
      dispatch(clearError()); 
    }
  }, [error, dispatch]);

  const handleResendVerification = async () => {
    if (!form.email) return toast.error('Please enter your email address first');
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('Verification email sent! Please check your inbox.');
      setShowResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowResend(false);
    const result = await dispatch(loginUser(form));
    if (result.meta.requestStatus === 'fulfilled') {
      const role = result.payload.role;
      toast.success(`Welcome back, ${result.payload.name}!`);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
      else navigate('/developer/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-600 via-violet-800 to-indigo-900 relative overflow-hidden items-center justify-center p-16">
        {/* Abstract Background Elements */}
        <BackgroundAnimation />
        
        {/* Content */}
        <div className="relative z-10 max-w-xl text-white">
          <div className="flex items-center mb-10">
            <img src="/logo.png" alt="ProjectBridge Logo" className="h-20 w-auto object-contain drop-shadow-2xl" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 className="text-5xl font-display font-black mb-6 leading-[1.1] tracking-tight">
            Connecting ambition with expertise.
          </h1>
          <p className="text-lg text-white/80 mb-10 leading-relaxed font-light">
            ProjectBridge is the premier platform connecting students with expert developers to turn academic concepts into production-ready software.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">Secure Escrow Payments</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">Real-time Collaboration Workspace</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="text-brand-300" size={20} />
              <span className="font-medium">Verified Expert Developers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <BackgroundAnimation />
        {/* Mobile-only background effects */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          <Link to="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-10 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Homepage
          </Link>

          <div className="mb-10">
            <h2 className="font-display text-4xl font-black text-[var(--text)] mb-3">Welcome Back</h2>
            <p className="text-[var(--text-muted)] text-base">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--text)] ml-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md"
                placeholder="you@university.edu"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-[var(--text)]">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors">
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {showResend && (
              <div className="bg-amber-500/10 border-2 border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm flex flex-col gap-2 shadow-sm animate-fade-in">
                <p className="font-semibold">Your account email has not been verified yet.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-fit text-xs font-bold text-brand-500 hover:text-brand-600 underline transition-colors cursor-pointer disabled:opacity-50"
                >
                  {resendLoading ? 'Resending verification email...' : 'Click here to resend verification email'}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
              ) : (
                <><LogIn size={20} /> Sign In</>
              )}
            </button>
          </form>

          {/* Quick Demo Section - Designed cleaner */}
          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--bg)] text-[var(--text-muted)] font-medium">Quick Demo Access</span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button onClick={() => setForm({ email: 'student@demo.com', password: 'demo123' })}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-blue-500/20 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-500/10 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold transition-all flex items-center justify-center gap-2 text-sm">
              🎓 Student
            </button>
            <button onClick={() => setForm({ email: 'dev@demo.com', password: 'demo123' })}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-violet-500/20 bg-violet-50/50 hover:bg-violet-50 dark:border-violet-500/10 dark:bg-violet-900/10 dark:hover:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-semibold transition-all flex items-center justify-center gap-2 text-sm">
              💻 Developer
            </button>
          </div>

          <p className="text-center text-base text-[var(--text-muted)] mt-10">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-bold ml-1">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
