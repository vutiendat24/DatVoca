import { supabase } from '../lib/supabase';
import type { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { count: totalVocabulary } = await supabase
      .from('vocabularies')
      .select('*', { count: 'exact', head: true });

    const { count: totalTopics } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true });

    const { count: masteredWords } = await supabase
      .from('vocabularies')
      .select('*', { count: 'exact', head: true })
      .eq('isLearned', true);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count: learnedToday } = await supabase
      .from('vocabularies')
      .select('*', { count: 'exact', head: true })
      .eq('isLearned', true)
      .gte('updatedAt', startOfToday.toISOString());

    // Approximate weekly progress based on today
    const learned = learnedToday || 0;
    const weeklyProgress = [0, 0, 0, 0, 0, 0, learned];
    
    // We don't have a logs table to track streaks yet, so we return 1 if active today, 0 otherwise
    const streakDays = learned > 0 ? 1 : 0;

    return {
      totalVocabulary: totalVocabulary || 0,
      totalTopics: totalTopics || 0,
      masteredWords: masteredWords || 0,
      learnedToday: learned,
      totalReadings: 0, // Readings feature is not yet implemented in DB
      weeklyProgress,
      streakDays,
    };
  },
};
