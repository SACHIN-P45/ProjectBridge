import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, setUser } from '../../store/slices/authSlice';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Camera, Save, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        dispatch(setUser(res.data));
        setName(res.data.name || '');
        setPreview(res.data.avatar || '');
      } catch (err) {
        console.error('Failed to sync admin profile:', err);
      }
    };
    fetchUser();
  }, [dispatch]);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const fd = new FormData();
    fd.append('name', name);
    if (avatar) fd.append('avatar', avatar);

    const result = await dispatch(updateProfile(fd));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Admin profile updated successfully!');
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  return (
    <DashboardLayout title="Admin Profile">
      <div className="max-w-2xl mx-auto py-8">
        <div className="card p-8 animate-fade-in relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl">
          {/* Subtle Background Glow */}
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-brand-500/10 rounded-full filter blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-6 mb-8">
            <h2 className="text-2xl font-display font-black text-[var(--text)] tracking-tight">Manage Account</h2>
            <p className="text-[var(--text-muted)] text-sm -mt-4">Update your profile information and avatar picture.</p>
            
            {/* Avatar Uploader Wrapper */}
            <div className="relative mt-4">
              <div className="group relative w-32 h-32 rounded-full overflow-hidden p-1 bg-[var(--card)] border-4 border-[var(--border)] shadow-2xl transition-all duration-300 hover:scale-105 hover:border-brand-500 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-4xl font-display font-black">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                )}
                
                {/* Hover Camera Overlay */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-semibold text-xs gap-1.5 rounded-full select-none">
                  <Camera size={18} className="text-brand-300 animate-pulse" />
                  <span>Upload Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="input-label flex items-center gap-2 mb-2">
                <User size={16} className="text-violet-500" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="input-label flex items-center gap-2 mb-2">
                <Mail size={16} className="text-violet-500" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="input bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed opacity-70"
                disabled
              />
              <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">
                Email address cannot be changed. Contact the system administrator if needed.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
