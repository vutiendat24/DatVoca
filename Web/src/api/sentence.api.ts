import { supabase } from '../lib/supabase';
import type { Sentence, CreateSentenceDTO, UpdateSentenceDTO, SentenceFilters, PaginatedResponse, Difficulty } from '../types';

function calculateNextReview(difficulty: Difficulty, currentReps = 0) {
  const newReps = currentReps + 1;
  let interval = 1;

  if (newReps > 10) {
    interval = 120; // 4 tháng
  } else {
    if (difficulty === 'super_hard') interval = 1;
    else if (difficulty === 'hard') interval = 2;
    else if (difficulty === 'medium') interval = 4;
    else if (difficulty === 'easy') interval = 7;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { 
    interval, 
    repetitions: newReps, 
    nextReviewAt: nextReview.toISOString() 
  };
}

export const sentenceApi = {
  getAll: async (filters: SentenceFilters): Promise<PaginatedResponse<Sentence>> => {
    let query = supabase.from('sentences').select('*', { count: 'exact' });

    if (filters.search) {
      const s = filters.search;
      query = query.or(`english.ilike.%${s}%,vietnamese.ilike.%${s}%,topicName.ilike.%${s}%`);
    }
    if (filters.topicId) {
      query = query.eq('topicId', filters.topicId);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.isLearned !== undefined) {
      query = query.eq('isLearned', filters.isLearned);
    }

    if (filters.sort) {
      const order = filters.order === 'desc' ? false : true;
      query = query.order(filters.sort, { ascending: order });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return { data: data || [], total, page, limit, totalPages };
  },

  getToday: async (): Promise<Sentence[]> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .or(`nextReviewAt.is.null,nextReviewAt.lte.${now}`);
      
    if (error) throw new Error(error.message);
    return data || [];
  },

  getQuickReview: async (): Promise<Sentence[]> => {
    const now = new Date().toISOString();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .or(`nextReviewAt.is.null,nextReviewAt.lte.${now},and(updatedAt.gte.${startOfToday.toISOString()},isLearned.eq.true)`);
      
    if (error) throw new Error(error.message);
    return data || [];
  },

  getById: async (id: string): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Sentence not found');
    return data;
  },

  create: async (dto: CreateSentenceDTO): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .insert([{ ...dto, isLearned: false }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id: string, dto: UpdateSentenceDTO): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('sentences')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  },

  updateSRS: async (id: string, difficulty: Difficulty): Promise<Sentence> => {
    const s = await sentenceApi.getById(id);
    const srs = calculateNextReview(difficulty, s.repetitions);
    
    const { data, error } = await supabase
      .from('sentences')
      .update({
        ...srs,
        difficulty,
        isLearned: true,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  markLearned: async (id: string, isLearned: boolean): Promise<Sentence> => {
    const { data, error } = await supabase
      .from('sentences')
      .update({ isLearned, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  }
};
