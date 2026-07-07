import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Zap, FileText, Tag, Flame, Trophy, TrendingUp, Plus, ArrowRight,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard.api';
import { QUERY_KEYS } from '../constants';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { LoadingPage } from '../components/Loading/Loading';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  gradient: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, gradient, iconBg }) => (
  <motion.div variants={item}>
    <div className={`rounded-2xl p-6 ${gradient} relative overflow-hidden`}>
      {/* decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/10" />

      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4 relative z-10`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-white/80 relative z-10">{label}</p>
      <p className="text-4xl font-extrabold text-white mt-1 relative z-10">{value}</p>
      {sub && <p className="text-xs text-white/70 mt-1 relative z-10">{sub}</p>}
    </div>
  </motion.div>
);

const WeeklyBar: React.FC<{ value: number; day: string; max: number }> = ({ value, day, max }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{value}</span>
      <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-end">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full rounded-xl bg-linear-to-t from-pink-500 to-pink-300"
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{day}</span>
    </div>
  );
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) return <LoadingPage />;
  if (!stats) return null;

  const weekMax = Math.max(...stats.weeklyProgress, 1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-linear-to-r from-pink-500 via-rose-500 to-pink-400 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">Good evening! 🌸</h2>
            <p className="text-pink-100 mt-1 text-sm">You're on a <strong>{stats.streakDays}-day streak</strong>. Keep it up!</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white/20! text-white! hover:bg-white/30! backdrop-blur-sm border border-white/30"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate('/vocabulary')}
            >
              Add Word
            </Button>
            <Button
              variant="secondary"
              className="bg-white! text-pink-600! hover:bg-pink-50! backdrop-blur-sm border border-white/30"
              leftIcon={<Zap size={16} />}
              onClick={() => navigate('/flashcards')}
            >
              Study Now
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={<BookOpen size={22} className="text-white" />}
          label="Total Vocabulary"
          value={stats.totalVocabulary}
          sub="words collected"
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<Trophy size={22} className="text-white" />}
          label="Mastered Words"
          value={stats.masteredWords}
          sub="fully learned"
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<FileText size={22} className="text-white" />}
          label="Readings"
          value={stats.totalReadings}
          sub="articles available"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBg="bg-white/20"
        />
        <StatCard
          icon={<Tag size={22} className="text-white" />}
          label="Topics"
          value={stats.totalTopics}
          sub="categories"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-white/20"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Chart */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Weekly Progress</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Words learned per day</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                <TrendingUp size={14} />
                <span className="text-xs font-bold">+12% this week</span>
              </div>
            </div>
            <div className="flex gap-2 h-36 items-end">
              {stats.weeklyProgress.map((v, i) => (
                <WeeklyBar key={i} value={v} day={DAYS[i]} max={weekMax} />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Streak + Today learned */}
        <motion.div variants={item} initial="hidden" animate="show" className="flex flex-col gap-4">
          <Card className="flex-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <Flame size={28} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Streak</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.streakDays} <span className="text-base font-semibold text-gray-500">days</span></p>
              </div>
            </div>
          </Card>

          <Card className="flex-1">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Today's Progress</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.learnedToday}</span>
              <span className="text-sm text-gray-400">/ {stats.totalVocabulary}</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.learnedToday / stats.totalVocabulary) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-linear-to-r from-pink-400 to-pink-600 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">words reviewed today</p>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} initial="hidden" animate="show">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Add Vocabulary', desc: 'Add a new word to your collection', icon: '📝', to: '/vocabulary', color: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 hover:from-pink-100 hover:to-rose-100', border: 'border-pink-200 dark:border-pink-800' },
            { label: 'Study Flashcards', desc: 'Review with flip cards', icon: '⚡', to: '/flashcards', color: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 hover:from-violet-100 hover:to-purple-100', border: 'border-violet-200 dark:border-violet-800' },
            { label: 'Reading Practice', desc: 'Improve comprehension', icon: '📖', to: '/reading', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100', border: 'border-blue-200 dark:border-blue-800' },
            { label: "Today's Words", desc: 'Review what you learned today', icon: '🌟', to: '/today', color: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100', border: 'border-emerald-200 dark:border-emerald-800' },
          ].map((action) => (
            <motion.button
              key={action.to}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.to)}
              className={`text-left p-5 rounded-2xl bg-linear-to-br ${action.color} border ${action.border} transition-all duration-200 group`}
            >
              <span className="text-2xl block mb-3">{action.icon}</span>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{action.label}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
              <ArrowRight size={14} className="mt-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}