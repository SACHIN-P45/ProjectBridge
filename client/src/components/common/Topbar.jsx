import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function Topbar({ title, onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { unread } = useSelector((s) => s.notifications);
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] flex-shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg sm:text-xl font-display font-bold text-[var(--text)] truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
        </div>
      </div>
    </header>
  );
}
