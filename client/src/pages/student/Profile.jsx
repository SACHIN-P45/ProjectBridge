import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import {
  User, Camera, Save, Star, CheckCircle, Mail, MapPin, School,
  Github, Globe, Calendar, Plus, X, Award, ShieldCheck, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    location: user?.location || '',
    githubUrl: user?.githubUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
  });

  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('skills', JSON.stringify(skills));
    if (avatar) fd.append('avatar', avatar);

    const result = await dispatch(updateProfile(fd));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-6xl mx-auto space-y-8 animate-[slide-up_0.5s_ease_out]">
        
        {/* ========================================================= */}
        {/* HEADER HERO CARD                                          */}
        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* HEADER HERO CARD                                          */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-all duration-300 hover:shadow-brand-500/5">
          
          {/* Cover Mesh Banner (Reduced to h-28) */}
          <div className="relative h-28 bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 overflow-hidden">
            {/* Animated Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.12] pointer-events-none animate-scroll-grid" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            {/* Design elements inside the violet area */}
            <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 112">
              {/* Wavy abstract waves (representing data flow / bridge connection) */}
              <path d="M-50,60 C100,20 150,100 250,40 C350,-20 400,80 500,40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              <path d="M-50,80 C120,40 130,120 220,60 C310,0 380,100 500,60" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" className="animate-flow-dash" />
              
              {/* Concentric node dots representing connections with glowing pulses */}
              <g>
                <circle cx="80" cy="50" r="4.5" fill="#ffffff" opacity="0.3" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="80" cy="50" r="2.5" fill="#ffffff" />
                
                <circle cx="210" cy="65" r="6" fill="#a78bfa" opacity="0.4" className="animate-ping" style={{ animationDuration: '4s' }} />
                <circle cx="210" cy="65" r="3.5" fill="#a78bfa" />
                
                <circle cx="330" cy="30" r="5" fill="#f472b6" opacity="0.4" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                <circle cx="330" cy="30" r="3" fill="#f472b6" />
              </g>
              
              {/* Radial Blur Glowing spots with float slow animations */}
              <circle cx="40" cy="20" r="45" fill="#6366f1" opacity="0.5" filter="blur(16px)" className="animate-float-slow-1 origin-center" />
              <circle cx="360" cy="90" r="50" fill="#ec4899" opacity="0.4" filter="blur(20px)" className="animate-float-slow-2 origin-center" />
            </svg>
            
            {/* Gradient Dark/Light fade to match theme base */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117]/60 to-transparent dark:block hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:hidden block"></div>
          </div>

          {/* User Info Overlay Section (h-28 on desktop to match violet banner height) */}
          <div className="relative px-6 sm:px-10 py-4 md:h-28 flex items-center bg-[var(--card)]">
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 text-center md:text-left">
              
              {/* Left group: Avatar and Core Details */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                
                {/* Symmetrical Circular Avatar centered on the boundary */}
                <div className="relative -mt-14 sm:-mt-16 z-20">
                  <div className="w-28 h-28 rounded-full overflow-hidden p-1 bg-[var(--card)] border-4 border-[var(--border)] shadow-2xl transition-all duration-300 hover:scale-105 hover:border-brand-500 flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-3xl font-display font-black">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                    
                    {/* Hover Camera Overlay */}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-semibold text-xs gap-1.5 rounded-full select-none">
                      <Camera size={16} className="text-brand-300 animate-pulse" />
                      <span>Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
                    </label>
                  </div>
                </div>

                {/* Identity details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h2 className="text-2xl font-display font-black text-[var(--text)] tracking-tight leading-none drop-shadow-sm">{user?.name}</h2>
                    {user?.isVerified && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-sm">
                        <ShieldCheck size={13} className="fill-emerald-500/10" />
                        Verified Student
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-sm font-semibold text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 text-xs font-bold uppercase tracking-wider">
                      <Award size={13} />
                      Student Account
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors">
                      <Mail size={15} className="text-violet-500" />
                      {user?.email}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right group: Balanced Academic metadata to fill whitespace */}
              {(form.college || form.location) && (
                <div className="hidden md:flex flex-col items-end text-right gap-2">
                  {form.college && (
                    <div className="flex items-center gap-2 text-sm font-black text-[var(--text)] bg-[var(--bg-secondary)]/60 px-4 py-2 rounded-2xl border border-[var(--border)]/80 shadow-sm max-w-xs transition-all duration-300 hover:border-brand-500/30">
                      <School size={16} className="text-brand-500 flex-shrink-0" />
                      <span className="truncate">{form.college}</span>
                    </div>
                  )}
                  {form.location && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)]/30 px-3 py-1.5 rounded-xl border border-[var(--border)]/40 transition-all duration-300 hover:text-[var(--text)]">
                      <MapPin size={13} className="text-violet-500 flex-shrink-0" />
                      <span>{form.location}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TWO COLUMN GRID DETAILS & FORM                            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: ACTIVITY & DETAILS                           */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* STATS CARD */}
            <div className="card p-6 bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-violet-500/5 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors"></div>
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border)]/60 pb-3 mb-5">Activity Dashboard</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3.5 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border)]/60 hover:border-brand-500/40 hover:bg-[var(--card)] transition-all duration-200">
                  <p className="text-2xl font-display font-black text-[var(--text)]">{user?.completedProjects || 0}</p>
                  <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1.5">Completed</p>
                </div>
                
                <div className="text-center p-3.5 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border)]/60 hover:border-brand-500/40 hover:bg-[var(--card)] transition-all duration-200 group/rating">
                  <p className="text-2xl font-display font-black text-amber-500 flex items-center justify-center gap-0.5">
                    {user?.rating || 0}
                    <Star size={14} className="fill-amber-500 stroke-none group-hover/rating:scale-110 transition-transform" />
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1.5">Rating</p>
                </div>
                
                <div className="text-center p-3.5 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border)]/60 hover:border-brand-500/40 hover:bg-[var(--card)] transition-all duration-200">
                  <p className="text-2xl font-display font-black text-[var(--text)]">{user?.totalReviews || 0}</p>
                  <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1.5">Reviews</p>
                </div>
              </div>
            </div>

            {/* QUICK STATS & CONTACT DETAILS */}
            <div className="card p-6 bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-indigo-500/5 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors"></div>
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border)]/60 pb-3 mb-5">Overview & Info</h3>
              
              <div className="space-y-4">
                
                <div className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--bg-secondary)]/30 border border-transparent hover:border-[var(--border)]/60 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 flex-shrink-0 shadow-sm border border-violet-500/15">
                    <School size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">College / University</p>
                    <p className="font-bold text-[var(--text)] mt-1 truncate text-sm">{form.college || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--bg-secondary)]/30 border border-transparent hover:border-[var(--border)]/60 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 flex-shrink-0 shadow-sm border border-brand-500/15">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Location</p>
                    <p className="font-bold text-[var(--text)] mt-1 truncate text-sm">{form.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--bg-secondary)]/30 border border-transparent hover:border-[var(--border)]/60 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0 shadow-sm border border-emerald-500/15">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Member Since</p>
                    <p className="font-bold text-[var(--text)] mt-1 text-sm">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'June 2026'}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: EDITABLE SETTINGS FORM                         */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
            
            {/* PERSONAL DETAILS CARD */}
            <div className="card p-6 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-brand-500/5">
              <div className="border-b border-[var(--border)]/60 pb-4 mb-6">
                <h3 className="text-xl font-display font-black text-[var(--text)]">Personal Credentials</h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">Manage your identity, university, location and short bio details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name input */}
                <div className="group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-muted)] group-focus-within/input:text-brand-500 transition-colors">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input pl-11"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Location input */}
                <div className="group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">Location</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-muted)] group-focus-within/input:text-brand-500 transition-colors">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="input pl-11"
                      placeholder="Mumbai, India"
                    />
                  </div>
                </div>

                {/* College / University Input */}
                <div className="sm:col-span-2 group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">College / University</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-muted)] group-focus-within/input:text-brand-500 transition-colors">
                      <School size={16} />
                    </span>
                    <input
                      type="text"
                      value={form.college}
                      onChange={e => setForm({ ...form, college: e.target.value })}
                      className="input pl-11"
                      placeholder="IIT Bombay, MIT, Harvard, Delhi University, etc."
                    />
                  </div>
                </div>

                {/* Bio / Headline textarea */}
                <div className="sm:col-span-2 group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">Bio / Academic Summary</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="input resize-none h-32 py-3 px-4 transition-all duration-300"
                    placeholder="Tell us a little bit about yourself, what you study, or details about the types of projects you would love to build..."
                  />
                </div>
                
              </div>
            </div>

            {/* PROFESSIONAL LINKS CARD */}
            <div className="card p-6 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-brand-500/5">
              <div className="border-b border-[var(--border)]/60 pb-4 mb-6">
                <h3 className="text-xl font-display font-black text-[var(--text)]">Professional Links</h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">Add links to your social profiles and active repositories.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* GitHub Input */}
                <div className="group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">GitHub URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-muted)] group-focus-within/input:text-brand-500 transition-colors">
                      <Github size={16} />
                    </span>
                    <input
                      type="url"
                      value={form.githubUrl}
                      onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                      className="input pl-11"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                {/* Portfolio Input */}
                <div className="group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">Portfolio / Website</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-muted)] group-focus-within/input:text-brand-500 transition-colors">
                      <Globe size={16} />
                    </span>
                    <input
                      type="url"
                      value={form.portfolioUrl}
                      onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
                      className="input pl-11"
                      placeholder="https://myportfolio.dev"
                    />
                  </div>
                </div>
                
              </div>
            </div>

            {/* SKILLS & INTERESTS CARD */}
            <div className="card p-6 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-brand-500/5">
              <div className="border-b border-[var(--border)]/60 pb-4 mb-6">
                <h3 className="text-xl font-display font-black text-[var(--text)]">Skills & Interests</h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">List academic interests or technologies you are studying to find suitable developers.</p>
              </div>

              <div className="space-y-4">
                <div className="group/input">
                  <label className="input-label group-focus-within/input:text-brand-500 transition-colors">Add Skills & Interests</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[var(--text-muted)] group-focus-within/input:text-brand-500 transition-colors">
                        <LinkIcon size={16} />
                      </span>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleAddSkill(e);
                          }
                        }}
                        className="input pl-11"
                        placeholder="Type a skill and press Enter (e.g. React, Python, UI Design)"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="btn-secondary px-5 flex items-center justify-center shrink-0 border border-brand-500/25 hover:border-brand-500/50 hover:bg-brand-500/5 hover:text-brand-500 transition-all rounded-xl shadow-sm"
                    >
                      <Plus size={20} className="mr-1 text-brand-500" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Skill tag list container */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {skills.length > 0 ? (
                    skills.map(s => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/25 hover:border-brand-500/50 hover:bg-brand-500/15 transition-all cursor-default select-none shadow-sm"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-red-500 focus:outline-none transition-colors ml-0.5"
                        >
                          <X size={13} className="hover:scale-125 transition-transform" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-[var(--text-muted)] italic py-2">No skills or interests listed yet. Type above and click add!</p>
                  )}
                </div>
              </div>
            </div>

            {/* SAVE ALL CHANGES FLOATING BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-10 py-4 text-base font-bold shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 active:scale-98 transition-all duration-300"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save All Changes
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
