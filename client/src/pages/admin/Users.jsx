import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserStatus, deleteUser, createDeveloper, updateDeveloper } from '../../store/slices/adminSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Search, Plus, ShieldAlert, CheckCircle, XCircle, Trash2, 
  Users, Code2, UserX, Calendar, Mail, UserCheck, X, Pencil,
  KeyRound, Save
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((s) => s.admin);
  
  const [activeTab, setActiveTab] = useState('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [devForm, setDevForm] = useState({ name: '', email: '', password: '' });
  const [creatingDev, setCreatingDev] = useState(false);

  // Edit developer state
  const [editingDev, setEditingDev] = useState(null); // the user object being edited
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Compute stats dynamically
  const studentCount = users.filter((u) => u.role === 'student').length;
  const developerCount = users.filter((u) => u.role === 'developer').length;
  const inactiveCount = users.filter((u) => u.isActive === false).length;

  const filteredUsers = users.filter(
    (u) => 
      u.role === activeTab && 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleStatus = (userId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      dispatch(updateUserStatus({ userId, isActive: !currentStatus }));
      toast.success(`User successfully ${currentStatus ? 'deactivated' : 'activated'}`);
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      dispatch(deleteUser(userId));
      toast.success('User permanently deleted');
    }
  };

  const handleCreateDeveloper = async (e) => {
    e.preventDefault();
    setCreatingDev(true);
    const res = await dispatch(createDeveloper(devForm));
    setCreatingDev(false);
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Developer created! A verification email has been sent.');
      setShowCreateModal(false);
      setDevForm({ name: '', email: '', password: '' });
      setActiveTab('developer');
    } else {
      toast.error(res.payload || 'Failed to create developer');
    }
  };

  const openEditModal = (dev) => {
    setEditingDev(dev);
    setEditForm({ name: dev.name, email: dev.email });
  };

  const handleEditDeveloper = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    const res = await dispatch(updateDeveloper({ id: editingDev._id, data: editForm }));
    setSavingEdit(false);
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Developer details updated successfully!');
      setEditingDev(null);
    } else {
      toast.error(res.payload || 'Failed to update developer');
    }
  };

  return (
    <DashboardLayout title="Users">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text)]">User Directory</h1>
          <p className="text-[var(--text-muted)] mt-1">Audit, activate, and manage platform participants.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn-primary bg-violet-500 hover:bg-violet-600 border-violet-500 hover:border-violet-600 shadow-glow-violet self-start md:self-auto"
        >
          <Plus size={18} /> Create Developer Account
        </button>
      </div>

      {/* Mini Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* Student Stats */}
        <div className="card p-5 flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Students</p>
            <p className="text-2xl font-black text-[var(--text)] mt-0.5">{studentCount}</p>
          </div>
        </div>

        {/* Developer Stats */}
        <div className="card p-5 flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center flex-shrink-0">
            <Code2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Developers</p>
            <p className="text-2xl font-black text-[var(--text)] mt-0.5">{developerCount}</p>
          </div>
        </div>

        {/* Banned/Inactive Stats */}
        <div className="card p-5 flex items-center gap-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Inactive / Blocked</p>
            <p className="text-2xl font-black text-[var(--text)] mt-0.5">{inactiveCount}</p>
          </div>
        </div>

      </div>

      {/* Main Filter & Table Card */}
      <div className="card overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 justify-between bg-[var(--bg-secondary)] items-center">
          <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'student' 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Users size={16} /> Students ({studentCount})
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'developer' 
                  ? 'bg-violet-500 text-white shadow-md' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Code2 size={16} /> Developers ({developerCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/55 text-[var(--text-muted)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold pl-6">Profile</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">Status</th>
                {activeTab === 'developer' && (
                  <th className="p-4 font-semibold">Pwd Status</th>
                )}
                <th className="p-4 font-semibold text-right pr-6">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'developer' ? 6 : 5} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'developer' ? 6 : 5} className="p-12 text-center text-[var(--text-muted)]">
                    No {activeTab} accounts match your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                    
                    {/* User Profile */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--border)]" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              u.role === 'developer' ? 'bg-gradient-to-br from-violet-400 to-indigo-600' : 'bg-gradient-to-br from-brand-400 to-blue-600'
                            }`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {u.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[var(--card)] rounded-full animate-pulse" title="Online now"></span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--text)] truncate">{u.name}</p>
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date Joined */}
                    <td className="p-4 text-xs text-[var(--text-muted)] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </td>

                    {/* Email Verification */}
                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10">
                          <UserCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/10">
                          <ShieldAlert size={12} /> Pending Verification
                        </span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="p-4">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-500/10">
                          <XCircle size={12} /> Deactivated
                        </span>
                      )}
                    </td>

                    {/* Password Status - Only for developers */}
                    {activeTab === 'developer' && (
                      <td className="p-4">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/20 border border-orange-500/10">
                            <KeyRound size={12} /> Awaiting Setup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950/20 border border-sky-500/10">
                            <CheckCircle size={12} /> Password Set
                          </span>
                        )}
                      </td>
                    )}

                    {/* Operations */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5 opacity-100">
                        {/* Edit button - ONLY for developers */}
                        {u.role === 'developer' && (
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl border text-violet-500 border-violet-200 hover:bg-violet-500 hover:text-white dark:border-violet-900/30 dark:hover:bg-violet-900/30 transition-all"
                            title="Edit Developer"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                          className={`p-2 rounded-xl border transition-all ${
                            u.isActive !== false 
                              ? 'text-amber-500 border-amber-200 hover:bg-amber-500 hover:text-white dark:border-amber-900/30 dark:hover:bg-amber-900/20' 
                              : 'text-emerald-500 border-emerald-200 hover:bg-emerald-500 hover:text-white dark:border-emerald-900/30 dark:hover:bg-emerald-900/20'
                          }`}
                          title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          <ShieldAlert size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-2 rounded-xl border text-red-500 border-red-200 hover:bg-red-500 hover:text-white dark:border-red-900/30 dark:hover:bg-red-900/20 transition-all"
                          title="Delete User"
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

      {/* CREATE DEVELOPER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gradient-to-r from-violet-500/10 to-indigo-500/10">
              <div>
                <h2 className="text-xl font-display font-black text-[var(--text)]">Create Developer</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">A verification email will be sent. Developer must verify then set their own password.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {/* Step indicators */}
            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-violet-500/30">1</div>
                  <span className="text-xs font-semibold text-[var(--text)]">Admin Creates Account</span>
                </div>
                <div className="w-8 h-px bg-[var(--border)]" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-bold flex items-center justify-center">2</div>
                  <span className="text-xs text-[var(--text-muted)]">Developer Verifies Email</span>
                </div>
                <div className="w-8 h-px bg-[var(--border)]" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-bold flex items-center justify-center">3</div>
                  <span className="text-xs text-[var(--text-muted)]">Sets Own Password</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleCreateDeveloper} className="p-6 space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="input" 
                  placeholder="e.g. John Doe"
                  value={devForm.name} 
                  onChange={e => setDevForm({...devForm, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="input" 
                  placeholder="dev@example.com"
                  value={devForm.email} 
                  onChange={e => setDevForm({...devForm, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="input-label">Temporary Password <span className="text-[var(--text-muted)] font-normal">(developer will change this)</span></label>
                <input 
                  required 
                  minLength={6} 
                  type="password" 
                  className="input" 
                  placeholder="••••••••"
                  value={devForm.password} 
                  onChange={e => setDevForm({...devForm, password: e.target.value})} 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creatingDev}
                  className="btn-primary flex-1 justify-center bg-violet-500 hover:bg-violet-600 border-violet-500 hover:border-violet-600 shadow-glow-violet disabled:opacity-50"
                >
                  {creatingDev ? 'Creating...' : 'Create & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEVELOPER MODAL */}
      {editingDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gradient-to-r from-violet-500/10 to-indigo-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                  {editingDev.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-[var(--text)]">Edit Developer</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Update name or email address.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingDev(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditDeveloper} className="p-6 space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="input" 
                  placeholder="Full name"
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="input" 
                  placeholder="email@example.com"
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})} 
                />
                {editForm.email.toLowerCase() !== editingDev.email && (
                  <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                    <ShieldAlert size={12} /> Changing email will require re-verification.
                  </p>
                )}
              </div>

              {/* Current status info */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border)] space-y-2">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Account Status</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    editingDev.isVerified 
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10' 
                      : 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/10'
                  }`}>
                    {editingDev.isVerified ? <><UserCheck size={11}/> Verified</> : <><ShieldAlert size={11}/> Not Verified</>}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    editingDev.mustChangePassword 
                      ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border border-orange-500/10' 
                      : 'text-sky-600 bg-sky-50 dark:bg-sky-950/20 border border-sky-500/10'
                  }`}>
                    {editingDev.mustChangePassword ? <><KeyRound size={11}/> Password Not Set</> : <><CheckCircle size={11}/> Password Set</>}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingDev(null)} 
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingEdit}
                  className="btn-primary flex-1 justify-center bg-violet-500 hover:bg-violet-600 border-violet-500 hover:border-violet-600 shadow-glow-violet disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
