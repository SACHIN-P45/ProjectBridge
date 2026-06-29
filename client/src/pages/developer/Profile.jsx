import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, setUser } from '../../store/slices/authSlice';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Camera, Save, Star, Github, Globe, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const techOptions = ['React', 'Node.js', 'MongoDB', 'Python', 'Django', 'Flask', 'Angular', 'Vue.js', 'Machine Learning', 'TensorFlow', 'MySQL', 'PostgreSQL', 'Docker', 'AWS', 'Firebase', 'Next.js', 'Express'];

export default function DevProfile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '', bio: user?.bio || '', location: user?.location || '',
    githubUrl: user?.githubUrl || '', portfolioUrl: user?.portfolioUrl || '',
    skills: user?.skills || [], techStack: user?.techStack || [],
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        dispatch(setUser(res.data));
        setForm({
          name: res.data.name || '',
          bio: res.data.bio || '',
          location: res.data.location || '',
          githubUrl: res.data.githubUrl || '',
          portfolioUrl: res.data.portfolioUrl || '',
          skills: res.data.skills || [],
          techStack: res.data.techStack || [],
        });
        setPreview(res.data.avatar || '');
      } catch (err) {
        console.error('Failed to sync profile data:', err);
      }
    };
    fetchUser();
  }, [dispatch]);

  const handleAvatar = (e) => {
    const f = e.target.files[0];
    if (f) { setAvatar(f); setPreview(URL.createObjectURL(f)); }
  };

  const addSkill = (s) => {
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] });
  };
  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter(x => x !== s) });
  const toggleTech = (t) => setForm({ ...form, techStack: form.techStack.includes(t) ? form.techStack.filter(x => x !== t) : [...form.techStack, t] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('bio', form.bio);
    fd.append('location', form.location);
    fd.append('githubUrl', form.githubUrl);
    fd.append('portfolioUrl', form.portfolioUrl);
    fd.append('skills', JSON.stringify(form.skills));
    fd.append('techStack', JSON.stringify(form.techStack));
    if (avatar) fd.append('avatar', avatar);
    const result = await dispatch(updateProfile(fd));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Profile updated!');
    else toast.error('Failed to update profile');
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 animate-fade-in">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {preview ? (
                <img src={preview} alt="" className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-400 to-brand-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-600 shadow-lg">
                <Camera size={14} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
              </label>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-[var(--text)]">{user?.name}</h2>
              <p className="text-[var(--text-muted)]">Developer</p>
              <div className="flex items-center gap-2 mt-2">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-[var(--text)]">{user?.rating || 0}</span>
                <span className="text-xs text-[var(--text-muted)]">({user?.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-[var(--bg-secondary)] rounded-2xl">
            <div className="text-center">
              <p className="text-2xl font-display font-black text-[var(--text)]">{user?.completedProjects || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">Completed</p>
            </div>
            <div className="text-center border-x border-[var(--border)]">
              <p className="text-2xl font-display font-black text-emerald-500">₹{(user?.totalEarnings || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-black text-amber-400">{user?.rating || 0}★</p>
              <p className="text-xs text-[var(--text-muted)]">Rating</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="input-label">Location</label>
                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input" placeholder="City, Country" />
              </div>
            </div>

            <div>
              <label className="input-label flex items-center gap-2"><Github size={14} />GitHub Profile URL</label>
              <input type="url" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} className="input" placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="input-label flex items-center gap-2"><Globe size={14} />Portfolio Website</label>
              <input type="url" value={form.portfolioUrl} onChange={e => setForm({ ...form, portfolioUrl: e.target.value })} className="input" placeholder="https://yourportfolio.com" />
            </div>

            {/* Skills */}
            <div>
              <label className="input-label">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skills.map(s => (
                  <span key={s} className="badge-violet flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput.trim()); setSkillInput(''); } }}
                  className="input flex-1" placeholder="Type a skill and press Enter..." />
                <button type="button" onClick={() => { addSkill(skillInput.trim()); setSkillInput(''); }} className="btn-secondary py-3 px-4">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="input-label">Technology Stack</label>
              <div className="flex flex-wrap gap-2">
                {techOptions.map(t => (
                  <button key={t} type="button" onClick={() => toggleTech(t)}
                    className={`text-sm px-3 py-1.5 rounded-lg border-2 transition-all font-medium ${form.techStack.includes(t) ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Professional Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                className="input resize-none" rows={4} placeholder="Tell students about your experience, expertise, and what makes you the right developer for their project..." />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
