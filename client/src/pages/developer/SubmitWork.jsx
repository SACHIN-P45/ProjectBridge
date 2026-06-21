import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../api/axios';
import { Upload, Github, Globe, FileText, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitWork() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ githubRepo: '', liveUrl: '', progressUpdate: '', status: '' });
  const [sourceCode, setSourceCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    } catch { toast.error('Failed to update project'); }
    finally { setSubmitting(false); }
  };

  const handleSourceUpload = async () => {
    if (!sourceCode) return toast.error('Select a ZIP file first');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('sourceCode', sourceCode);
      await api.post(`/projects/${projectId}/upload-source`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Source code uploaded! Project marked as Delivered.');
      navigate('/developer/assigned');
    } catch { toast.error('Failed to upload source code'); }
    finally { setSubmitting(false); }
  };

  if (!project) return <DashboardLayout title="Submit Work"><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Submit Work">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/developer/assigned')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 mb-6 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Assigned Projects
        </button>

        <div className="space-y-5">
          {/* Project Info */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-xl text-[var(--text)] mb-1">{project.title}</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Student: {project.student?.name} · Budget: ₹{project.budget?.toLocaleString()}
            </p>
            <div className="mt-3">
              <span className={`status-${project.status}`}>{project.status}</span>
            </div>
          </div>

          {/* Project Links */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-[var(--text)] mb-5">Deliverable Links</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="input-label flex items-center gap-2"><Github size={14} />GitHub Repository URL</label>
                <input type="url" value={form.githubRepo} onChange={e => setForm({ ...form, githubRepo: e.target.value })}
                  className="input" placeholder="https://github.com/username/repo" />
              </div>
              <div>
                <label className="input-label flex items-center gap-2"><Globe size={14} />Live Demo URL</label>
                <input type="url" value={form.liveUrl} onChange={e => setForm({ ...form, liveUrl: e.target.value })}
                  className="input" placeholder="https://your-project.vercel.app" />
              </div>
              <div>
                <label className="input-label">Progress Update (optional)</label>
                <textarea value={form.progressUpdate} onChange={e => setForm({ ...form, progressUpdate: e.target.value })}
                  className="input resize-none" rows={3} placeholder="Share an update with the student..." />
              </div>
              <div>
                <label className="input-label">Update Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input">
                  <option value="">Keep current status</option>
                  <option value="in-progress">In Progress</option>
                  <option value="testing">Testing</option>
                </select>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                <Send size={16} /> Save Updates
              </button>
            </form>
          </div>

          {/* Source Code Upload */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">Upload Final Source Code</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">Upload a ZIP file of your complete source code. This will mark the project as <span className="text-emerald-500 font-semibold">Delivered</span>.</p>

            <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-all">
              <Upload size={28} className={sourceCode ? 'text-emerald-500' : 'text-[var(--text-muted)]'} />
              {sourceCode ? (
                <div className="text-center">
                  <p className="font-semibold text-emerald-500">{sourceCode.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{(sourceCode.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-[var(--text)]">Upload Source Code ZIP</p>
                  <p className="text-xs text-[var(--text-muted)]">ZIP files up to 50MB</p>
                </div>
              )}
              <input type="file" accept=".zip" onChange={e => setSourceCode(e.target.files[0])} className="hidden" />
            </label>

            {sourceCode && (
              <button onClick={handleSourceUpload} disabled={submitting}
                className="btn-success w-full justify-center mt-4">
                {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={16} /> Mark as Delivered</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
