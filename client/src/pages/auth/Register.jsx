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
                <h2 className="font-display text-4xl font-black text-[var(--text)] tracking-tight mb-2">Create Account</h2>
                <p className="text-[var(--text-muted)] text-sm">Setup your student profile to post your first project request.</p>
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
