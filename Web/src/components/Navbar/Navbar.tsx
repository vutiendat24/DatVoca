import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back! Keep learning 🌸' },
  '/vocabulary': { title: 'Vocabulary', subtitle: 'Manage your word collection' },
  '/flashcards': { title: 'Flashcards', subtitle: 'Review and memorize words' },
  '/topics': { title: 'Topics', subtitle: 'Organize by topic' },
  '/reading': { title: 'Reading Practice', subtitle: 'Improve your reading comprehension' },
  '/today': { title: "Today's Words", subtitle: 'Words you learned today' },
  '/settings': { title: 'Settings', subtitle: 'Customize your experience' },
};

export const Navbar: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { pathname } = useLocation();
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains('dark'));

  const info = pageTitles[pathname] ?? { title: 'DatVoca', subtitle: '' };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-gray-900 dark:text-white truncate">{info.title}</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{info.subtitle}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
