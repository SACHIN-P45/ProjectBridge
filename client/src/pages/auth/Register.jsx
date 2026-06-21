import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, UserPlus, ArrowLeft, ShieldCheck, Zap, Globe2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', // Enforce student role
  });
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

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
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-violet-800 to-brand-600 relative overflow-hidden items-center justify-center p-16">
        {/* Abstract Background Elements */}
        <BackgroundAnimation />
        
        {/* Content */}
        <div className="relative z-10 max-w-xl text-white">
          <div className="flex items-center mb-10">
            <img src="/logo.png" alt="ProjectBridge Logo" className="h-20 w-auto object-contain drop-shadow-2xl" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 className="text-5xl font-display font-black mb-6 leading-[1.1] tracking-tight">
            Start your journey with ProjectBridge.
          </h1>
          <p className="text-lg text-white/80 mb-12 leading-relaxed font-light">
            Join the elite community of students bringing their academic requirements to life.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-brand-300" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Guaranteed Delivery</h3>
                <p className="text-sm text-white/70">Your funds are held securely in escrow until you approve the final source code.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/30 flex items-center justify-center shrink-0">
                <Globe2 className="text-violet-300" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Global Expert Network</h3>
                <p className="text-sm text-white/70">Connect with highly-rated developers specialized in exactly the tech stack you need.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                <Zap className="text-emerald-300" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Real-Time Sync</h3>
                <p className="text-sm text-white/70">Chat instantly, share requirements, and track milestones directly in the app.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <BackgroundAnimation />
        {/* Mobile-only background effects */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
          <Link to="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-10 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Homepage
          </Link>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="font-display text-4xl font-black text-[var(--text)] mb-3">Create Account</h2>
                <p className="text-[var(--text-muted)] text-base">Setup your student profile to post your first project request.</p>
              </div>

              {/* Admin Note regarding Developer Registration */}
              <div className="bg-brand-50/50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400 p-4 rounded-xl text-sm mb-8 flex items-start gap-3 border border-brand-200/50 dark:border-brand-800/50 shadow-sm">
                <div className="mt-0.5"><ShieldCheck size={18} /></div>
                <p><strong>Registering as a Student.</strong> To maintain quality, Developer accounts must be provisioned manually by an Administrator.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--text)] ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md" 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--text)] ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md" 
                    placeholder="john@university.edu" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--text)] ml-1">Password</label>
                  <div className="relative">
                    <input 
                      type={show ? 'text' : 'password'} 
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md pr-12" 
                      placeholder="Min 6 characters" 
                      required 
                    />
                    <button type="button" onClick={() => setShow(!show)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors">
                      {show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--text)] ml-1">Confirm Password</label>
                  <input 
                    type="password" 
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3.5 bg-[var(--bg-secondary)] border-2 border-transparent focus:border-brand-500 rounded-xl outline-none text-[var(--text)] transition-all shadow-sm focus:shadow-md" 
                    placeholder="Re-enter password" 
                    required 
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                  ) : (
                    <><UserPlus size={20} /> Create Account</>
                  )}
                </button>
              </form>

              <p className="text-center text-base text-[var(--text-muted)] mt-10">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold ml-1">Sign in here</Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-display text-3xl font-black text-[var(--text)] mb-4">Check your email</h2>
              <p className="text-[var(--text-muted)] text-base mb-8 leading-relaxed font-light">
                We've sent a verification link to <strong className="text-[var(--text)] font-semibold">{form.email}</strong>. Please check your inbox and click the link to activate your account.
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
