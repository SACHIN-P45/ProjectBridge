import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../components/common/BackgroundAnimation';
import AuthVisualShowcase from '../../components/common/AuthVisualShowcase';
import api from '../../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const strength = getPasswordStrength(password);

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
    <div className="min-h-screen flex bg-[var(--bg)] transition-colors duration-300">
      {/* Left Panel - Dynamic Visual Showcase */}
      <AuthVisualShowcase />

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        <BackgroundAnimation />
        
        {/* Mobile-only ambient background glows */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-500/20 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full filter blur-3xl" />
        </div>

        {/* Form Card (Glassmorphic) */}
        <div className="w-full max-w-[480px] relative z-10 animate-slide-up glassmorphic-card p-8 sm:p-10 rounded-3xl border border-white/20 dark:border-white/5">
          
          <div className="mb-8">
            <div className="w-12 h-12 bg-brand-500/10 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-float">
              <Lock size={22} />
            </div>
            <h2 className="font-display text-3xl font-black text-[var(--text)] tracking-tight mb-2">Reset Password</h2>
            <p className="text-[var(--text-muted)] text-sm">Enter and confirm your new secure account password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password Input with Floating Label */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                id="reset-password"
                className="peer w-full pl-11 pr-12 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm" 
                required 
              />
              <label 
                htmlFor="reset-password"
                className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
              >
                New Password
              </label>
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors z-10"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Dynamic Password Strength Indicator */}
            {password && (
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
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                id="reset-confirm"
                className="peer w-full pl-11 pr-12 pt-5 pb-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl outline-none text-[var(--text)] transition-all input-glow-focus text-sm" 
                required 
              />
              <label 
                htmlFor="reset-confirm"
                className="absolute left-11 top-3.5 text-sm text-[var(--text-muted)] pointer-events-none transition-all duration-200 origin-[0] transform -translate-y-2.5 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-brand-500"
              >
                Confirm New Password
              </label>
              
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 transition-colors z-10"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirmation Password Match Indicator */}
            {confirmPassword && (
              <div className={`text-[11px] font-bold px-1 animate-fade-in ${
                password === confirmPassword ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
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
                  Saving password...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> 
                  Save New Password
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold ml-1 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
