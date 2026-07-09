import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Zap, Tag, FileText, CalendarDays, X, MessageCircle
} from 'lucide-react';
import { useUIStore } from '../../store/ui.store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
  { to: '/vocabulary', label: 'Vocabulary', icon: <BookOpen size={20} /> },
  { to: '/sentences', label: 'Sentences', icon: <MessageCircle size={20} /> },
  { to: '/flashcards', label: 'Flashcards', icon: <Zap size={20} /> },
  { to: '/topics', label: 'Topics', icon: <Tag size={20} /> },
  { to: '/reading', label: 'Reading', icon: <FileText size={20} /> },
  { to: '/today', label: "Today's Words", icon: <CalendarDays size={20} /> },
];

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode; end?: boolean; onClick?: () => void }> = ({
  to, label, icon, end, onClick,
}) => (
  <li>
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group relative ${
          isActive
            ? 'bg-linear-to-r from-pink-500 to-pink-400 text-white shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30'
            : 'text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-pink-500 transition-colors'}>
            {icon}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  </li>
);

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-200">
            <span className="text-white text-xl">🌸</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">DatVoca</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">English Learning</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-sm font-bold">D</div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">DatVoca Learner</p>
            <p className="text-xs text-gray-400">🔥 7-day streak!</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 h-screen sticky top-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
