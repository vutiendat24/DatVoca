import { Difficulty, ReadingDifficulty } from '../types';

export const APP_NAME = 'DatVoca';

export const QUERY_KEYS = {
  VOCABULARY: 'vocabulary',
  VOCABULARY_TODAY: 'vocabulary_today',
  TOPICS: 'topics',
  READINGS: 'readings',
  DASHBOARD: 'dashboard',
} as const;

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bg: string; border: string; textClass: string; bgClass: string; borderClass: string }
> = {
  [Difficulty.Easy]: {
    label: 'Easy',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#86efac',
    textClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  [Difficulty.Medium]: {
    label: 'Medium',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fcd34d',
    textClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  [Difficulty.Hard]: {
    label: 'Hard',
    color: '#ea580c',
    bg: '#ffedd5',
    border: '#fdba74',
    textClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
  },
  [Difficulty.SuperHard]: {
    label: 'Super Hard',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fca5a5',
    textClass: 'text-red-600',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
  },
};

export const READING_DIFFICULTY_CONFIG: Record<ReadingDifficulty, { label: string; color: string }> = {
  [ReadingDifficulty.A1]: { label: 'A1 - Beginner', color: 'text-emerald-500' },
  [ReadingDifficulty.A2]: { label: 'A2 - Elementary', color: 'text-green-500' },
  [ReadingDifficulty.B1]: { label: 'B1 - Intermediate', color: 'text-blue-500' },
  [ReadingDifficulty.B2]: { label: 'B2 - Upper Intermediate', color: 'text-violet-500' },
  [ReadingDifficulty.C1]: { label: 'C1 - Advanced', color: 'text-orange-500' },
  [ReadingDifficulty.C2]: { label: 'C2 - Mastery', color: 'text-red-500' },
};

export const TOPIC_COLORS = [
  '#ec4899', '#8b5cf6', '#3b82f6', '#10b981',
  '#f59e0b', '#ef4444', '#06b6d4', '#f97316',
];

export const TOPIC_ICONS = [
  '📚', '🌍', '🎯', '💡', '🔬', '🎨', '🏃', '🍕',
  '✈️', '💼', '🌱', '🎵', '🏠', '💻', '🎓', '⚡',
];

export const DEFAULT_PAGE_SIZE = 10;
