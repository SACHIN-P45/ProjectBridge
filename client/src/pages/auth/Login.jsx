import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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
