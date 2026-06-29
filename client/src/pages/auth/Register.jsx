import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, UserPlus, ArrowLeft, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import AuthVisualShowcase from '../../components/common/AuthVisualShowcase';

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', // Enforce student role
  });
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (error) { 
      toast.error(error); 
      dispatch(clearError()); 
    }
  }, [error, dispatch]);

  // Dynamic Password Strength Calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-transparent', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { score, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password, role: form.role }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Registration successful! Please verify your email.');
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] transition-colors duration-300">
      {/* Left Panel - Dynamic Visual Showcase */}
      <AuthVisualShowcase />

      {/* Right Panel - Register Form / Success State */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        <BackgroundAnimation />
        
        {/* Mobile-only ambient background glows */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-500/20 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full filter blur-3xl" />
        </div>

        {/* Form Card (Glassmorphic) */}
        <div className="w-full max-w-[480px] relative z-10 animate-slide-up glassmorphic-card p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5">
          
          <Link to="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-8 text-sm font-semibold group">
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to Homepage
          </Link>

          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--text)] tracking-tight mb-2">Create Account</h2>
                <p className="text-[var(--text-muted)] text-sm">Setup your student profile to post your first project request.</p>
              </div>

              {/* ── OAuth Buttons ──────────────────────────────── */}
              <div className="space-y-3 mb-6">
                {/* Google */}
                <a
                  href={`${SERVER_URL}/api/auth/google`}
                  id="register-google-oauth"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-white dark:hover:bg-white/5 hover:border-[#4285F4]/50 hover:shadow-[0_0_20px_rgba(66,133,244,0.15)] text-[var(--text)] font-semibold text-sm transition-all transform active:scale-[0.98] group"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="group-hover:text-[#4285F4] transition-colors">Sign up with Google</span>
                </a>

                {/* GitHub */}
                <a
                  href={`${SERVER_URL}/api/auth/github`}
                  id="register-github-oauth"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[#24292e] hover:border-[#24292e] hover:shadow-[0_0_20px_rgba(36,41,46,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-[var(--text)] hover:text-white font-semibold text-sm transition-all transform active:scale-[0.98] group"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Sign up with GitHub</span>
                </a>
              </div>

              {/* ── OR Divider ──────────────────────────────────── */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[var(--bg)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name Input with Floating Label */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder=" "
                    id="register-name"
                    className="peer w-full pl-11 pr-4 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm" 
                    required 
                  />
                  <label 
                    htmlFor="register-name"
                    className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
                  >
                    Full Name
                  </label>
                </div>
                
                {/* Email Input with Floating Label */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder=" "
                    id="register-email"
                    className="peer w-full pl-11 pr-4 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm" 
                    required 
                  />
                  <label 
                    htmlFor="register-email"
                    className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
                  >
                    Email Address
                  </label>
                </div>

                {/* Password Input with Floating Label */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={show ? 'text' : 'password'} 
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder=" "
                    id="register-password"
                    className="peer w-full pl-11 pr-12 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm" 
                    required 
                  />
                  <label 
                    htmlFor="register-password"
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

                {/* Dynamic Password Strength Indicator */}
                {form.password && (
                  <div className="space-y-1 px-1 animate-fade-in">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <span>Password Strength</span>
                      <span className={
                        strength.label === 'Weak' ? 'text-red-500' :
                        strength.label === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                      }>{strength.label}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-500`} />
                    </div>
                  </div>
                )}

                {/* Confirm Password Input with Floating Label */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showConfirm ? 'text' : 'password'} 
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder=" "
                    id="register-confirm"
                    className="peer w-full pl-11 pr-12 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm" 
                    required 
                  />
                  <label 
                    htmlFor="register-confirm"
                    className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
                  >
                    Confirm Password
                  </label>
                  
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors z-10"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirmation Password Match Indicator */}
                {form.confirmPassword && (
                  <div className={`text-[11px] font-bold px-1 animate-fade-in ${
                    form.password === form.confirmPassword ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-4 mt-4 bg-gradient-to-r from-brand-500 via-indigo-600 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] animate-gradient-bg"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> 
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-[var(--text-muted)] mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold ml-1 transition-colors">
                  Sign in here
                </Link>
              </p>
            </>
          ) : (
            /* Registration Success Screen */
            <div className="text-center py-4 animate-slide-up">
              {/* Drawing Circle Checkmark with Float Animation */}
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-float">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path className="animate-stroke-check" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="font-display text-3xl font-black text-[var(--text)] tracking-tight mb-3">Check your email</h2>
              
              <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed font-light">
                We've sent a verification link to <strong className="text-[var(--text)] font-semibold">{form.email}</strong>. Please check your inbox and click the link to activate your account.
              </p>
              
              <Link
                to="/login"
                className="inline-flex w-full py-4 bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] rounded-xl font-bold text-sm justify-center transition-all transform active:scale-[0.98] shadow-sm hover:shadow"
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
