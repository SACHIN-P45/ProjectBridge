import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, LogIn, ArrowLeft, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import AuthVisualShowcase from '../../components/common/AuthVisualShowcase';
import api from '../../api/axios';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Handle OAuth error param (from server redirect on failure)
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const messages = {
        google_failed: 'Google sign-in failed. Please try again or use email/password.',
        github_failed: 'GitHub sign-in failed. Please try again or use email/password.',
      };
      toast.error(messages[oauthError] || 'OAuth sign-in failed.');
    }
  }, [searchParams]);

  // Load remembered credentials on mount
  useEffect(() => {
    const savedRemember = localStorage.getItem('rememberMe') === 'true';
    if (savedRemember) {
      setRememberMe(true);
      const savedEmail = localStorage.getItem('rememberedEmail') || '';
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  useEffect(() => {
    if (error) { 
      if (error === 'first_login_password_change_required') {
        toast.error('First-time login: Please set your password first.');
        navigate('/developer/set-password', { state: { email: form.email } });
        dispatch(clearError());
        return;
      }
      
      toast.error(error); 
      if (error.toLowerCase().includes('verify')) {
        setShowResend(true);
      }
      dispatch(clearError()); 
    }
  }, [error, dispatch, navigate, form.email]);

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
      // Save or clear remembered credentials based on state
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', form.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      
      const role = result.payload.role;
      toast.success(`Welcome back, ${result.payload.name}!`);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
      else navigate('/developer/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] transition-colors duration-300">
      {/* Left Panel - Dynamic Visual Showcase */}
      <AuthVisualShowcase />

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        <BackgroundAnimation />
        
        {/* Mobile-only background ambient glows */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/20 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full filter blur-3xl" />
        </div>

        {/* Form Container (Glassmorphic) */}
        <div className="w-full max-w-[480px] relative z-10 animate-slide-up glassmorphic-card p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5">
          <Link to="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-8 text-sm font-semibold group">
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to Homepage
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-4xl font-black text-[var(--text)] tracking-tight mb-2">Welcome Back</h2>
            <p className="text-[var(--text-muted)] text-sm">Enter your credentials to access your dashboard.</p>
          </div>

          {/* ── OAuth Buttons ─────────────────────────────── */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <a
              href={`${SERVER_URL}/api/auth/google`}
              id="login-google-oauth"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-white dark:hover:bg-white/5 hover:border-[#4285F4]/50 hover:shadow-[0_0_20px_rgba(66,133,244,0.15)] text-[var(--text)] font-semibold text-sm transition-all transform active:scale-[0.98] group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="group-hover:text-[#4285F4] transition-colors">Continue with Google</span>
            </a>

            {/* GitHub */}
            <a
              href={`${SERVER_URL}/api/auth/github`}
              id="login-github-oauth"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[#24292e] hover:border-[#24292e] hover:shadow-[0_0_20px_rgba(36,41,46,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-[var(--text)] hover:text-white font-semibold text-sm transition-all transform active:scale-[0.98] group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </a>
          </div>

          {/* ── OR Divider ────────────────────────────────── */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[var(--bg)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field with Floating Label */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors pointer-events-none z-10">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder=" "
                id="login-email"
                className="peer w-full pl-11 pr-4 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm"
                required
              />
              <label 
                htmlFor="login-email"
                className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
              >
                Email Address
              </label>
            </div>

            {/* Password Field with Floating Label */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors pointer-events-none z-10">
                <Lock size={18} />
              </div>
              <input
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder=" "
                id="login-password"
                className="peer w-full pl-11 pr-12 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm"
                required
              />
              <label 
                htmlFor="login-password"
                className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
              >
                Password
              </label>
              
              <button 
                type="button" 
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors z-10"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember Me iOS toggle & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                    className="sr-only" 
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors duration-300 ${rememberMe ? 'bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${rememberMe ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Verification Warning Alert */}
            {showResend && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-xs flex flex-col gap-2 shadow-sm animate-fade-in">
                <p className="font-semibold">Your account email has not been verified yet.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-fit text-[11px] font-bold text-brand-500 hover:text-brand-600 underline transition-colors cursor-pointer disabled:opacity-50"
                >
                  {resendLoading ? 'Resending verification email...' : 'Click here to resend verification email'}
                </button>
              </div>
            )}

            {/* Gradient Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 mt-2 bg-gradient-to-r from-brand-500 via-indigo-600 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] animate-gradient-bg"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn size={18} /> 
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Section */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-transparent text-[var(--text-muted)] font-bold uppercase tracking-wider">Quick Demo Access</span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-5">
            <button 
              onClick={() => setForm({ email: 'student@demo.com', password: 'demo123' })}
              className="flex-1 py-3 px-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-700 dark:text-blue-400 font-bold transition-all flex items-center justify-center gap-2 text-xs transform active:scale-[0.97] group"
            >
              <span className="group-hover:animate-bounce">🎓</span> Student
            </button>
            <button 
              onClick={() => setForm({ email: 'dev@demo.com', password: 'demo123' })}
              className="flex-1 py-3 px-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] text-violet-700 dark:text-violet-400 font-bold transition-all flex items-center justify-center gap-2 text-xs transform active:scale-[0.97] group"
            >
              <span className="group-hover:animate-bounce">💻</span> Developer
            </button>
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-bold ml-1 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
