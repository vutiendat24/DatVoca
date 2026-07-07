import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Palette, Bell, Info, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card/Card';

const SettingRow: React.FC<{ icon: React.ReactNode; label: string; desc?: string; action?: React.ReactNode }> = ({
  icon, label, desc, action,
}) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-gray-800 last:border-0 group">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">{action ?? <ChevronRight size={16} className="text-gray-300" />}</div>
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <motion.div
      animate={{ x: checked ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
    />
  </button>
);

export default function SettingsPage() {
  const [notifications, setNotifications] = React.useState(true);
  const [dailyReminder, setDailyReminder] = React.useState(false);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize your DatVoca experience</p>
      </div>

      <div className="flex flex-col gap-5">
        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Appearance</h3>
          <p className="text-xs text-gray-500 mb-4">Customize look and feel</p>
          <SettingRow icon={<Moon size={18} />} label="Dark Mode" desc="Use the dark theme" action={<Toggle checked={document.documentElement.classList.contains('dark')} onChange={() => document.documentElement.classList.toggle('dark')} />} />
          <SettingRow icon={<Palette size={18} />} label="Color Theme" desc="Pink (default)" />
          <SettingRow icon={<Sun size={18} />} label="Font Size" desc="Medium" />
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Notifications</h3>
          <p className="text-xs text-gray-500 mb-4">Control what you get notified about</p>
          <SettingRow icon={<Bell size={18} />} label="Push Notifications" desc="Enable in-app notifications" action={<Toggle checked={notifications} onChange={() => setNotifications(n => !n)} />} />
          <SettingRow icon={<Bell size={18} />} label="Daily Reminder" desc="Remind me to study every day" action={<Toggle checked={dailyReminder} onChange={() => setDailyReminder(d => !d)} />} />
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">About</h3>
          <p className="text-xs text-gray-500 mb-4">App information</p>
          <SettingRow icon={<Info size={18} />} label="Version" desc="1.0.0" action={<span className="text-xs text-gray-400">Build 100</span>} />
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-100 dark:border-pink-900 text-center">
            <p className="text-2xl mb-1">🌸</p>
            <p className="font-bold text-gray-900 dark:text-white">DatVoca</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your personal English learning companion</p>
            <p className="text-xs text-pink-500 mt-1">Made with 💖 · React 19 + TypeScript</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
