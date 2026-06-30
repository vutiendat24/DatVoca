import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <div 
      className={`fixed md:relative inset-y-0 left-0 z-50 w-64 h-screen bg-pink-50 dark:bg-pink-950 border-r border-pink-100 dark:border-pink-900/30 text-pink-900 dark:text-pink-100 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-6 border-b border-pink-100 dark:border-pink-900/30">
        <h2 className="text-2xl font-extrabold text-pink-600 dark:text-pink-300 tracking-wide">
          DatVoca 🌸
        </h2>
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-pink-600 dark:text-pink-300 hover:bg-pink-100/50 dark:hover:bg-pink-900/40 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </div>
      <ul className="flex-1 py-4 space-y-1 px-3">
        <li>
          <NavLink 
            to="/" 
            onClick={onClose}
            className={({ isActive }) => 
              `block px-4 py-3 rounded-xl cursor-pointer font-semibold no-underline transition-all duration-200 ${
                isActive 
                  ? 'bg-pink-200/80 dark:bg-pink-900 text-pink-800 dark:text-pink-100 shadow-sm' 
                  : 'text-pink-600 dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-100'
              }`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/voca" 
            onClick={onClose}
            className={({ isActive }) => 
              `block px-4 py-3 rounded-xl cursor-pointer font-semibold no-underline transition-all duration-200 ${
                isActive 
                  ? 'bg-pink-200/80 dark:bg-pink-900 text-pink-800 dark:text-pink-100 shadow-sm' 
                  : 'text-pink-600 dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-100'
              }`
            }
          >
            Voca
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/about" 
            onClick={onClose}
            className={({ isActive }) => 
              `block px-4 py-3 rounded-xl cursor-pointer font-semibold no-underline transition-all duration-200 ${
                isActive 
                  ? 'bg-pink-200/80 dark:bg-pink-900 text-pink-800 dark:text-pink-100 shadow-sm' 
                  : 'text-pink-600 dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-100'
              }`
            }
          >
            About
          </NavLink>
        </li>
      </ul>
      <div className="p-4 border-t border-pink-100 dark:border-pink-900/30 text-xs text-center text-pink-400 dark:text-pink-500 font-medium">
        Made with 💖
      </div>
    </div>
  );
}

export default Sidebar;