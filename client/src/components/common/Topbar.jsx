import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function Topbar({ title }) {
  const { theme, toggleTheme } = useTheme();
  const { unread } = useSelector((s) => s.notifications);
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
      <h1 className="text-xl font-display font-bold text-[var(--text)]">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] relative"
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
