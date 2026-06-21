import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjects, deleteProject } from '../../store/slices/adminSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  FolderOpen, Trash2, Eye, Calendar, DollarSign, Clock, 
  Search, X, Code2, Users, FileText, Tag, Link as LinkIcon, 
  AlertTriangle, CheckCircle2, ChevronRight, Github, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminProjects() {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((s) => s.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    dispatch(fetchAllProjects());
  }, [dispatch]);

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      dispatch(deleteProject(projectId));
      toast.success('Project deleted successfully');
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
      }
    }
  };

  // Compute metrics dynamically
  const totalCount = projects ? projects.length : 0;
  const activeCount = projects ? projects.filter(p => ['in-progress', 'testing'].includes(p.status)).length : 0;
  const completedCount = projects ? projects.filter(p => ['completed', 'delivered'].includes(p.status)).length : 0;
  const totalEscrowAmount = projects ? projects.reduce((sum, p) => sum + (p.budget || 0), 0) : 0;

  // Filter projects
  const filteredProjects = projects ? projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400';
      case 'in-progress': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400';
      case 'testing': return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400';
      case 'completed':
      case 'delivered': return 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900/30 dark:text-violet-400';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getCategoryLabel = (category) => {
    const map = {
      web: 'Web Development',
      mobile: 'Mobile Apps',
      ml: 'Machine Learning',
      'data-science': 'Data Science',
      blockchain: 'Blockchain',
      iot: 'Internet of Things',
      other: 'Other'
    };
    return map[category] || category;
  };

  return (
    <DashboardLayout title="Projects">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text)]">Platform Projects</h1>
          <p className="text-[var(--text-muted)] mt-1">Audit scope descriptions, tracking, code repos, and escrow states.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Listings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><FolderOpen size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{totalCount}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Workspace</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{activeCount}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{completedCount}</p>
        </div>

        <div className="card p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Budget Value</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center"><DollarSign size={16} /></div>
          </div>
          <p className="text-2xl font-black text-[var(--text)]">{formatCurrency(totalEscrowAmount)}</p>
        </div>
      </div>

      {/* Main Table & Filter container */}
      <div className="card overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col lg:flex-row gap-4 justify-between bg-[var(--bg-secondary)] items-center">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] w-full lg:w-auto">
            {['all', 'open', 'in-progress', 'testing', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === status 
                    ? 'bg-brand-500 text-white shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search by title or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/55 text-[var(--text-muted)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold pl-6">Project Title</th>
                <th className="p-4 font-semibold">Student / Developer</th>
                <th className="p-4 font-semibold">Budget</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Created Date</th>
                <th className="p-4 font-semibold text-right pr-6">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[var(--text-muted)]">
                    No projects found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p._id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                    {/* Title */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex items-center justify-center flex-shrink-0 border border-brand-500/10">
                          <FolderOpen size={20} />
                        </div>
                        <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                          <p className="font-bold text-[var(--text)] truncate">{p.title}</p>
                          <span className="text-xs text-[var(--text-muted)] capitalize">{getCategoryLabel(p.category)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Student/Dev */}
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <p className="text-[var(--text)]"><span className="font-semibold text-[var(--text-muted)]">Student:</span> {p.student?.name || 'N/A'}</p>
                        <p className="text-[var(--text)]"><span className="font-semibold text-[var(--text-muted)]">Dev:</span> {p.assignedDeveloper?.name || <span className="text-amber-500 italic">Unassigned</span>}</p>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="p-4 font-bold text-[var(--text)]">
                      {formatCurrency(p.budget)}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(p.status)} capitalize`}>
                        {p.status.replace('-', ' ')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-[var(--text-muted)] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {p.createdAt ? format(new Date(p.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5 opacity-100">
                        <button
                          onClick={() => setSelectedProject(p)}
                          className="p-2 rounded-xl border text-brand-500 border-brand-200 hover:bg-brand-500 hover:text-white dark:border-brand-900/30 dark:hover:bg-brand-900/20 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-xl border text-red-500 border-red-200 hover:bg-red-500 hover:text-white dark:border-red-900/30 dark:hover:bg-red-900/20 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROJECT INSPECTOR MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-4xl rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider bg-brand-500/10 px-2.5 py-1 rounded-full">{getCategoryLabel(selectedProject.category)}</span>
                <h2 className="text-xl font-display font-black text-[var(--text)] mt-2">{selectedProject.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Scope details */}
              <div className="md:col-span-3 space-y-6">
                
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Scope & Description</h3>
                  <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                    {selectedProject.description}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techStack && selectedProject.techStack.length > 0 ? (
                      selectedProject.techStack.map((tech) => (
                        <span key={tech} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[var(--border)] text-[var(--text)] font-semibold border border-[var(--border)]">
                          <Tag size={12} className="text-brand-500" /> {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">No specific tech stack listed.</span>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedProject.attachments && selectedProject.attachments.length > 0 ? (
                      selectedProject.attachments.map((file, idx) => (
                        <a 
                          key={idx} 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-brand-500/40 hover:bg-brand-50/5 dark:hover:bg-brand-900/5 transition-all text-xs font-semibold text-brand-500 group"
                        >
                          <span className="flex items-center gap-2 truncate text-[var(--text)]">
                            <FileText size={16} className="text-[var(--text-muted)] flex-shrink-0" />
                            <span className="truncate group-hover:text-brand-500 transition-colors">{file.originalName || `Attachment_${idx + 1}`}</span>
                          </span>
                          <ExternalLink size={14} className="flex-shrink-0" />
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic">No attachments provided.</p>
                    )}
                  </div>
                </div>

                {/* Progress Updates (Timeline) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Progress log</h3>
                  <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                    {selectedProject.progressUpdates && selectedProject.progressUpdates.length > 0 ? (
                      selectedProject.progressUpdates.map((update, idx) => (
                        <div key={idx} className="pl-6 relative">
                          <span className="absolute left-0.5 top-1.5 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-[var(--card)] shadow-sm"></span>
                          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <p className="text-xs font-bold text-[var(--text-muted)]">{format(new Date(update.timestamp), 'MMM dd, yyyy hh:mm a')}</p>
                            <p className="text-xs text-[var(--text)] mt-1">{update.message}</p>
                            {update.attachmentUrl && (
                              <a 
                                href={update.attachmentUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-1 text-[10px] text-brand-500 font-bold mt-2 hover:underline"
                              >
                                <ExternalLink size={10} /> View attachment
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic pl-6">No progress updates recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Roles & Escrow Stats */}
              <div className="md:col-span-2 space-y-6 border-t md:border-t-0 md:border-l border-[var(--border)] pt-6 md:pt-0 md:pl-6">
                
                {/* Student */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Student (Owner)</h3>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    {selectedProject.student?.avatar ? (
                      <img src={selectedProject.student.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {selectedProject.student?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text)] truncate">{selectedProject.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{selectedProject.student?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                {/* Developer */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Assigned Developer</h3>
                  {selectedProject.assignedDeveloper ? (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                      {selectedProject.assignedDeveloper.avatar ? (
                        <img src={selectedProject.assignedDeveloper.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {selectedProject.assignedDeveloper.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[var(--text)] truncate">{selectedProject.assignedDeveloper.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{selectedProject.assignedDeveloper.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] italic">
                      <AlertTriangle size={14} className="text-amber-500" /> Project has no assigned developer.
                    </div>
                  )}
                </div>

                {/* Financial and Timelines */}
                <div className="card p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl space-y-3.5">
                  <h4 className="font-bold text-sm text-[var(--text)] pb-2 border-b border-[var(--border)]">Listing Metadata</h4>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)] font-medium">Budget:</span>
                    <span className="font-bold text-sm text-[var(--text)]">{formatCurrency(selectedProject.budget)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)] font-medium">Deadline:</span>
                    <span className="font-bold text-[var(--text)]">{format(new Date(selectedProject.deadline), 'MMM dd, yyyy')}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)] font-medium">Bids Count:</span>
                    <span className="font-bold text-[var(--text)]">{selectedProject.bidCount || 0} bids</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)] font-medium">Github Integration:</span>
                    {selectedProject.githubRepo ? (
                      <a href={selectedProject.githubRepo} target="_blank" rel="noreferrer" className="font-bold text-brand-500 flex items-center gap-1 hover:underline">
                        <Github size={12} /> Connected
                      </a>
                    ) : (
                      <span className="text-[var(--text-muted)] italic">Not connected</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)] font-medium">Live Website:</span>
                    {selectedProject.liveUrl ? (
                      <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="font-bold text-brand-500 flex items-center gap-1 hover:underline">
                        <ExternalLink size={12} /> Live Link
                      </a>
                    ) : (
                      <span className="text-[var(--text-muted)] italic">Not connected</span>
                    )}
                  </div>

                  {/* Payment Milestone Statuses */}
                  <div className="pt-2 border-t border-[var(--border)] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Milestone 1 (50%):</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        selectedProject.isPaymentReleased ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        selectedProject.isPaid ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {selectedProject.isPaymentReleased ? 'Released' : selectedProject.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Milestone 2 (50%):</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        selectedProject.isSecondPaymentReleased ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        selectedProject.isSecondPaid ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {selectedProject.isSecondPaymentReleased ? 'Released' : selectedProject.isSecondPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleDelete(selectedProject._id)}
                    className="btn-danger flex-1 justify-center py-3 flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Project
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
