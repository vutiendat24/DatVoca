import { supabase } from '../lib/supabase';
import {
  Difficulty,
  type Vocabulary,
  type CreateVocabularyDTO,
  type UpdateVocabularyDTO,
  type VocabularyFilters,
  type PaginatedResponse,
} from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';

export const vocabularyApi = {
  getAll: async (filters: VocabularyFilters = {}): Promise<PaginatedResponse<Vocabulary>> => {
    let query = supabase.from('vocabularies').select('*', { count: 'exact' });

    if (filters.search) {
      const q = filters.search;
      query = query.or(`word.ilike.%${q}%,meaning.ilike.%${q}%,topicName.ilike.%${q}%`);
    }
    if (filters.topicId) query = query.eq('topicId', filters.topicId);
    if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters.isLearned !== undefined) query = query.eq('isLearned', filters.isLearned);

    if (filters.sort) {
      const order = filters.order === 'desc' ? false : true;
      query = query.order(filters.sort, { ascending: order });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
    const start = (page - 1) * limit;
    
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const total = count || 0;
    return { data: data || [], total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getToday: async (): Promise<Vocabulary[]> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .or(`nextReviewAt.is.null,nextReviewAt.lte.${now}`);
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  getQuickReview: async (): Promise<Vocabulary[]> => {
    const now = new Date().toISOString();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .or(`nextReviewAt.is.null,nextReviewAt.lte.${now},and(updatedAt.gte.${startOfToday.toISOString()},isLearned.eq.true)`);
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  getByTopic: async (topicId: string): Promise<Vocabulary[]> => {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('topicId', topicId);
      
    if (error) throw new Error(error.message);
    return data || [];
  },

  getById: async (id: string): Promise<Vocabulary> => {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Vocabulary not found');
    return data;
  },

  create: async (dto: CreateVocabularyDTO): Promise<Vocabulary> => {
    const { data, error } = await supabase
      .from('vocabularies')
      .insert([{ ...dto, isLearned: false }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id: string, dto: UpdateVocabularyDTO): Promise<Vocabulary> => {
    const { data, error } = await supabase
      .from('vocabularies')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('vocabularies')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  },

  markLearned: async (id: string, isLearned: boolean): Promise<Vocabulary> => {
    const { data, error } = await supabase
      .from('vocabularies')
      .update({ isLearned, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  updateSRS: async (id: string, difficulty: Difficulty): Promise<Vocabulary> => {
    const prev = await vocabularyApi.getById(id);

    const newReps = (prev.repetitions || 0) + 1;
    let interval = 1;

    if (newReps > 10) {
      interval = 120; // 4 tháng
    } else {
      if (difficulty === Difficulty.SuperHard) interval = 1;
      else if (difficulty === Difficulty.Hard) interval = 2;
      else if (difficulty === Difficulty.Medium) interval = 4;
      else if (difficulty === Difficulty.Easy) interval = 7;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const { data, error } = await supabase
      .from('vocabularies')
      .update({
        difficulty,
        isLearned: true,
        repetitions: newReps,
        interval,
        nextReviewAt: nextReviewDate.toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

