import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOAuthUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

/**
 * OAuthCallback — handles the redirect from the server after a successful
 * Google / GitHub OAuth flow.
 *
 * The server sends us:
 *   /oauth/callback?token=JWT&user=<encoded-JSON>
 *
 * We parse those, store them in Redux / localStorage, then forward the user
 * to their dashboard — exactly the same end-state as a normal login.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const error = searchParams.get('error');

    // ── Error from server ────────────────────────────────────
    if (error) {
      const messages = {
        google_failed: 'Google sign-in failed. Please try again.',
        github_failed: 'GitHub sign-in failed. Please try again.',
        oauth_failed: 'OAuth sign-in failed. Please try again.',
      };
      toast.error(messages[error] || 'Sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    // ── Missing data ─────────────────────────────────────────
    if (!token || !userRaw) {
      toast.error('Authentication failed. Please try signing in again.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));

      // Store in Redux & localStorage (same shape as email/password login)
      dispatch(setOAuthUser({ ...user, token }));

      toast.success(`Welcome, ${user.name}! 🎉`);

      // Redirect based on role (OAuth is student-only, but be safe)
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'developer') navigate('/developer/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    } catch {
      toast.error('Failed to process sign-in. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      {/* Animated loading screen while we process the OAuth response */}
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-3 rounded-full bg-brand-500/10 animate-pulse flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">Signing you in…</h2>
        <p className="text-sm text-[var(--text-muted)]">Just a moment while we set up your account.</p>
      </div>
    </div>
  );
}
