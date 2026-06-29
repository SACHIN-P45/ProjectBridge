import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../api/axios';
import { 
  Upload, Github, Globe, FileText, Send, CheckCircle, ArrowLeft, 
  Loader, Check, Trash2, Calendar, AlertCircle, Info, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitWork() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ githubRepo: '', liveUrl: '', progressUpdate: '', status: '' });
  const [sourceCode, setSourceCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState(''); // '', 'uploading', 'verifying', 'storing', 'done'

  useEffect(() => {
    api.get(`/projects/${projectId}`).then(r => {
      setProject(r.data);
      setForm(f => ({
        ...f,
        githubRepo: r.data.githubRepo || '',
        liveUrl: r.data.liveUrl || '',
        status: r.data.status,
      }));
    });
  }, [projectId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${projectId}`, {
        githubRepo: form.githubRepo,
        liveUrl: form.liveUrl,
        progressUpdate: form.progressUpdate || undefined,
        status: form.status || undefined,
      });
      toast.success('Project updated successfully!');
      setForm(f => ({ ...f, progressUpdate: '' }));
      // Automatically redirect to assigned projects page
      navigate('/developer/assigned');
    } catch { 
      toast.error('Failed to update project'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleSourceUpload = async () => {
    if (!sourceCode) return toast.error('Select a ZIP file first');
    
    // Check file size (100MB limit)
    const maxSizeBytes = 100 * 1024 * 1024;
    if (sourceCode.size > maxSizeBytes) {
      return toast.error('File size exceeds the 100MB limit. Please select a smaller archive.');
    }

    setSubmitting(true);
    
    // Animate a professional upload progress state for premium feel
    setUploadProgress(10);
    setUploadState('uploading');
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 45) {
          return prev + Math.floor(Math.random() * 10) + 2;
        } else if (prev < 80) {
          setUploadState('verifying');
          return prev + Math.floor(Math.random() * 5) + 1;
        } else if (prev < 98) {
          setUploadState('storing');
          return prev + 1;
        }
        return prev;
      });
    }, 150);

    try {
      const fd = new FormData();
      fd.append('sourceCode', sourceCode);
      
      await api.post(`/projects/${projectId}/upload-source`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadState('done');
      
      setTimeout(() => {
        toast.success('Source code uploaded! Project marked as Delivered.');
        navigate('/developer/assigned');
      }, 500);

    } catch (err) { 
      clearInterval(interval);
      setUploadState('');
      setUploadProgress(0);
      const errMsg = err.response?.data?.message || 'Failed to upload source code';
      toast.error(errMsg); 
    } finally { 
      setSubmitting(false); 
    }
  };

  if (!project) {
    return (
      <DashboardLayout title="Submit Work">
        <div className="flex items-center justify-center h-96">
          <Loader size={32} className="animate-spin text-brand-500" />
        </div>
      </DashboardLayout>
    );
  }

  // Determine active steps for the submission timeline
  const isDelivered = project.status === 'delivered' || project.status === 'completed';
  const isTesting = project.status === 'testing';

  return (
    <DashboardLayout title="Submit Work">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/developer/assigned')} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-brand-500 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Assigned Projects
          </button>
          <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5 bg-[var(--bg-secondary)]/60 px-3 py-1.5 rounded-xl border border-[var(--border)]">
            <Calendar size={13} className="text-brand-500" /> Deadline: {new Date(project.deadline).toLocaleDateString()}
          </span>
        </div>

        {/* Professional Submission Progress Tracker */}
        <div className="card p-6 bg-gradient-to-br from-[var(--card)] to-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-[25%] -translate-y-[25%] w-32 h-32 bg-brand-500/5 rounded-full blur-xl" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6 text-left">Deliverable Pipeline</h3>
          
          <div className="relative flex justify-between items-center w-full">
            {/* Background progress line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--border)] z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-500 to-emerald-500 z-0 transition-all duration-500" 
              style={{ width: isDelivered ? '100%' : isTesting ? '50%' : '0%' }}
            />

            {[
              { label: 'In Development', desc: 'Working on features', active: true, done: isTesting || isDelivered, color: 'bg-brand-500' },
              { label: 'Testing & QA', desc: 'Verifying deliverables', active: isTesting || isDelivered, done: isDelivered, color: 'bg-violet-500' },
              { label: 'Code Delivered', desc: 'Milestone submission', active: isDelivered, done: isDelivered, color: 'bg-emerald-500' }
            ].map((step, idx) => (
              <div key={step.label} className="relative z-10 flex flex-col items-center text-center">
                <div 
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    step.done 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : step.active
                        ? `bg-[var(--card)] border-brand-500 text-brand-500 font-bold shadow-[0_0_12px_rgba(59,130,246,0.2)]`
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  {step.done ? <Check size={16} className="stroke-[3]" /> : idx + 1}
                </div>
                <p className={`text-xs font-black mt-2.5 ${step.active || step.done ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{step.label}</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5 font-semibold hidden sm:block">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Header Info card */}
        <div className="card p-6 bg-[var(--card)] border border-[var(--border)] rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-brand-500" />
          <div className="text-left">
            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 mb-2`}>
              Active Contract
            </span>
            <h2 className="font-display font-black text-2xl text-[var(--text)] tracking-tight leading-tight">{project.title}</h2>
            <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">
              Client: <span className="text-[var(--text)]">{project.student?.name}</span> · Contract Budget: <span className="text-emerald-500 font-bold">₹{project.budget?.toLocaleString()}</span>
            </p>
          </div>
          <div className="shrink-0">
            <span className={`status-${project.status} shadow-xs font-bold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-xl border`}>
              {project.status}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Main Deliverables Form - Left 3 cols */}
          <div className="md:col-span-3 space-y-6">
            <div className="card p-6 border border-[var(--border)] bg-[var(--card)] rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-black text-lg text-[var(--text)] tracking-tight">Deliverable Links</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Keep your student updated on repository assets and demos.</p>
                </div>
                <div className="p-2.5 bg-brand-500/5 border border-brand-500/10 text-brand-500 rounded-2xl">
                  <Send size={16} />
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5">
                {/* GitHub input */}
                <div className="text-left space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Github size={13} className="text-[var(--text)]" /> GitHub Repository URL
                  </label>
                  <div className="relative">
                    <input 
                      type="url" 
                      value={form.githubRepo} 
                      onChange={e => setForm({ ...form, githubRepo: e.target.value })}
                      className="input w-full pl-4 pr-10 focus:ring-2 focus:ring-brand-500 transition-all text-xs font-semibold placeholder-[var(--text-muted)]" 
                      placeholder="https://github.com/username/repo" 
                    />
                    {form.githubRepo.startsWith('https://github.com/') && (
                      <CheckCircle size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Live Demo input */}
                <div className="text-left space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} className="text-emerald-500" /> Live Demo URL
                  </label>
                  <div className="relative">
                    <input 
                      type="url" 
                      value={form.liveUrl} 
                      onChange={e => setForm({ ...form, liveUrl: e.target.value })}
                      className="input w-full pl-4 pr-10 focus:ring-2 focus:ring-brand-500 transition-all text-xs font-semibold placeholder-[var(--text-muted)]" 
                      placeholder="https://your-project.vercel.app" 
                    />
                    {form.liveUrl.startsWith('http') && (
                      <CheckCircle size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Progress Update textarea */}
                <div className="text-left space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Progress Update (optional)</label>
                    <span className="text-[9px] text-[var(--text-muted)] font-bold">{form.progressUpdate.length}/500</span>
                  </div>
                  <textarea 
                    value={form.progressUpdate} 
                    maxLength={500}
                    onChange={e => setForm({ ...form, progressUpdate: e.target.value })}
                    className="input w-full resize-none focus:ring-2 focus:ring-brand-500 transition-all text-xs font-semibold" 
                    rows={3} 
                    placeholder="Share an update on what you completed today with the student..." 
                  />
                </div>

                {/* Custom Status Picker Grid */}
                <div className="text-left space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Project Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { 
                        id: 'in-progress', 
                        label: 'In Progress', 
                        desc: 'Development ongoing', 
                        border: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
                        activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        dot: 'bg-amber-500'
                      },
                      { 
                        id: 'testing', 
                        label: 'Testing & QA', 
                        desc: 'Verifying code stability', 
                        border: 'border-brand-500/20 bg-brand-500/5 text-brand-600 dark:text-brand-400',
                        activeBorder: 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400',
                        dot: 'bg-brand-500'
                      }
                    ].map((statusOption) => {
                      const isActive = form.status === statusOption.id;
                      return (
                        <button
                          key={statusOption.id}
                          type="button"
                          onClick={() => setForm({ ...form, status: statusOption.id })}
                          className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all relative ${
                            isActive ? statusOption.activeBorder : 'border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--text-muted)]'
                          }`}
                        >
                          <div className="mt-1 flex items-center justify-center shrink-0">
                            <span className={`w-2 h-2 rounded-full ${statusOption.dot} ${isActive ? 'animate-pulse' : 'opacity-60'}`} />
                          </div>
                          <div>
                            <p className="text-xs font-black">{statusOption.label}</p>
                            <p className="text-[9px] text-[var(--text-muted)] font-semibold mt-0.5 leading-tight">{statusOption.desc}</p>
                          </div>
                          {isActive && (
                            <CheckCircle size={14} className="absolute right-3 top-3 text-current" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn-primary w-full justify-center py-2.5 text-xs font-black uppercase tracking-wider shadow-sm"
                  >
                    {submitting ? <Loader size={16} className="animate-spin" /> : <><Send size={14} /> Save Updates & Exit</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Upload Final Source Code ZIP - Right 2 cols */}
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6 border border-[var(--border)] bg-[var(--card)] rounded-3xl shadow-sm h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-base text-[var(--text)] tracking-tight">Deliver Source Code</h3>
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 rounded-2xl">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed text-left">
                  Upload a complete ZIP package of your project files. This secures the deliverables and automatically flags the contract as <span className="text-emerald-500 font-bold">Delivered</span> for student audit.
                </p>

                {/* Upload Zone */}
                {uploadState === '' ? (
                  <label className="flex flex-col items-center justify-center gap-3.5 p-6 border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all group select-none">
                    <div className="p-3 bg-[var(--bg-secondary)]/80 rounded-2xl border border-[var(--border)] group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-colors shrink-0">
                      <Upload size={20} className={sourceCode ? 'text-emerald-500' : 'text-[var(--text-muted)]'} />
                    </div>
                    {sourceCode ? (
                      <div className="text-center">
                        <p className="font-bold text-xs text-emerald-500 truncate max-w-[170px]">{sourceCode.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">{(sourceCode.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <p className="font-bold text-xs text-[var(--text)]">Select ZIP Archive</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-semibold">ZIP file format up to 100MB</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept=".zip" 
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const maxSizeBytes = 100 * 1024 * 1024;
                          if (file.size > maxSizeBytes) {
                            toast.error('File size exceeds the 100MB limit. Please select a smaller archive.');
                            e.target.value = null; // Reset input
                            return;
                          }
                          setSourceCode(file);
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                ) : (
                  /* Animated Upload Progress card */
                  <div className="p-5 bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-2xl space-y-3 text-left">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {uploadState === 'uploading' && 'Uploading Archive...'}
                        {uploadState === 'verifying' && 'Verifying Integrity...'}
                        {uploadState === 'storing' && 'Encrypting & Storing...'}
                        {uploadState === 'done' && 'Upload Settled!'}
                      </span>
                      <span className="font-mono font-black text-brand-500">{uploadProgress}%</span>
                    </div>
                    
                    {/* Progress Bar background */}
                    <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <div 
                        className="progress-bar h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>

                    <p className="text-[9px] text-[var(--text-muted)] font-semibold leading-normal">
                      {uploadState === 'uploading' && 'Streaming file segments to platform gateway...'}
                      {uploadState === 'verifying' && 'Running automated code architecture audit...'}
                      {uploadState === 'storing' && 'Securing asset ledger in decentralized vault...'}
                      {uploadState === 'done' && 'Package uploaded and archived.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Trigger */}
              {sourceCode && uploadState === '' && (
                <div className="pt-4 flex gap-2">
                  <button 
                    onClick={() => setSourceCode(null)}
                    className="p-2.5 rounded-xl border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-[var(--text-muted)] transition-colors flex items-center justify-center shrink-0"
                    title="Remove File"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button 
                    onClick={handleSourceUpload} 
                    disabled={submitting}
                    className="btn-success flex-1 justify-center text-xs font-black uppercase tracking-wider py-2.5 shadow-sm"
                  >
                    {submitting ? <Loader size={16} className="animate-spin" /> : <><CheckCircle size={14} /> Submit & Deliver</>}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Security / Help Info Footer banner */}
        <div className="p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-2xl flex items-start sm:items-center gap-3 text-left">
          <Info size={16} className="text-brand-500 mt-0.5 sm:mt-0 shrink-0" />
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-normal">
            <strong>Escrow Security Policy:</strong> When you mark a project as <em>Delivered</em>, the student is notified to review and approve the repository. Platform administration maintains strict oversight over escrow releases to guarantee fair dispute settlements.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
