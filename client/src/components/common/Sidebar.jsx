import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, FolderOpen, MessageSquare, CreditCard, User,
  PlusCircle, Search, Briefcase, DollarSign, Star, FileText, LogOut,
  ChevronLeft, ChevronRight, Users, Bell, X
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
  { to: '/admin/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'student' ? studentLinks : developerLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Logo Section */}
      <Link
        to="/"
        onClick={handleNavClick}
        className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] overflow-hidden hover:opacity-90 transition-opacity"
      >
        {!isMobile && collapsed ? (
          <div className="w-10 h-10 mx-auto flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/logo.png"
              alt="ProjectBridge"
              className="w-10 h-10 object-contain object-top logo-img"
              style={{ objectPosition: '40% 10%', transform: 'scale(2.2) translate(3px, 3px)' }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="ProjectBridge"
              className="h-8 w-auto flex-shrink-0 object-contain logo-img"
            />
            <span className="text-xl font-display font-black tracking-tight text-[var(--text)] select-none truncate">
              Project<span className="text-brand-500">Bridge</span>
            </span>
          </div>
        )}
        {isMobile && (
          <button
            onClick={(e) => { e.preventDefault(); onClose?.(); }}
            className="ml-auto p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </Link>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${!isMobile && collapsed ? 'justify-center px-3' : ''}`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {(isMobile || !collapsed) && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
        {(isMobile || !collapsed) && user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] mb-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 ${!isMobile && collapsed ? 'justify-center px-3' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(isMobile || !collapsed) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex-shrink-0 h-screen sticky top-0 flex-col bg-[var(--card)] border-r border-[var(--border)] z-30 relative`}
      >
        <SidebarContent isMobile={false} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-600 transition-colors z-40"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {/* Backdrop overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-72 max-w-[85vw] flex flex-col bg-[var(--card)] border-r border-[var(--border)] z-50 transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile={true} />
      </aside>
    </>
  );
}
