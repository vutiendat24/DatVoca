import type { Topic, CreateTopicDTO, UpdateTopicDTO } from '../types';
import { supabase } from '../lib/supabase';

export const topicApi = {
  getAll: async (): Promise<Topic[]> => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getById: async (id: string): Promise<Topic> => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Topic not found');
    return data;
  },

  create: async (dto: CreateTopicDTO): Promise<Topic> => {
    const { data, error } = await supabase
      .from('topics')
      .insert([dto])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id: string, dto: UpdateTopicDTO): Promise<Topic> => {
    const { data, error } = await supabase
      .from('topics')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};
