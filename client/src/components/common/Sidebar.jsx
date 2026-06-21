import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, FolderOpen, MessageSquare, CreditCard, User,
  PlusCircle, Search, Briefcase, DollarSign, Star, FileText, LogOut, ChevronLeft, ChevronRight,
  Users, Bell
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/create-project', icon: PlusCircle, label: 'Post Project' },
  { to: '/student/projects', icon: FolderOpen, label: 'My Projects' },
  { to: '/student/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/student/payments', icon: CreditCard, label: 'Payments' },
  { to: '/student/profile', icon: User, label: 'Profile' },
];

const developerLinks = [
  { to: '/developer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/developer/browse', icon: Search, label: 'Browse Projects' },
  { to: '/developer/bids', icon: FileText, label: 'My Bids' },
  { to: '/developer/assigned', icon: Briefcase, label: 'Assigned' },
  { to: '/developer/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/developer/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/developer/profile', icon: Star, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'student' ? studentLinks : developerLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--card)] border-r border-[var(--border)] z-30`}>
      {/* Logo Section - Clickable to Landing Page */}
      <Link to="/" className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] overflow-hidden hover:opacity-90 transition-opacity">
        {collapsed ? (
          <div className="w-10 h-10 mx-auto flex-shrink-0 flex items-center justify-start overflow-hidden">
            <img 
              src="/logo.png" 
              alt="ProjectBridge" 
              className="h-8 w-auto max-w-none object-contain object-left translate-x-[4px]" 
            />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-start overflow-hidden">
              <img 
                src="/logo.png" 
                alt="ProjectBridge" 
                className="h-8 w-auto max-w-none object-contain object-left" 
              />
            </div>
            <span className="text-xl font-display font-black tracking-tight text-[var(--text)] select-none">
              Project<span className="text-brand-500">Bridge</span>
            </span>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] mb-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-3' : ''}`}>
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-600 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
