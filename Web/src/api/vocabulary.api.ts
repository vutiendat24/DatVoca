import { mockVocabulary } from './mockData';
import {
  Difficulty,
  type Vocabulary,
  type CreateVocabularyDTO,
  type UpdateVocabularyDTO,
  type VocabularyFilters,
  type PaginatedResponse,
} from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

let vocabulary = [...mockVocabulary];

export const vocabularyApi = {
  getAll: async (filters: VocabularyFilters = {}): Promise<PaginatedResponse<Vocabulary>> => {
    await delay();
    let result = [...vocabulary];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        v =>
          v.word.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q) ||
          v.topicName?.toLowerCase().includes(q),
      );
    }
    if (filters.topicId) result = result.filter(v => v.topicId === filters.topicId);
    if (filters.difficulty) result = result.filter(v => v.difficulty === filters.difficulty);
    if (filters.isLearned !== undefined) result = result.filter(v => v.isLearned === filters.isLearned);

    if (filters.sort) {
      const key = filters.sort as keyof Vocabulary;
      const order = filters.order === 'desc' ? -1 : 1;
      result = result.sort((a, b) => (String(a[key]) > String(b[key]) ? order : -order));
    }

    const total = result.length;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getToday: async (): Promise<Vocabulary[]> => {
    await delay();
    const todayStr = new Date().toISOString().slice(0, 10);
    return vocabulary.filter(v => v.createdAt.startsWith(todayStr));
  },

  getByTopic: async (topicId: string): Promise<Vocabulary[]> => {
    await delay();
    return vocabulary.filter(v => v.topicId === topicId);
  },

  getById: async (id: string): Promise<Vocabulary> => {
    await delay();
    const v = vocabulary.find(item => item.id === id);
    if (!v) throw new Error('Vocabulary not found');
    return { ...v };
  },

  create: async (dto: CreateVocabularyDTO): Promise<Vocabulary> => {
    await delay();
    const newVoca: Vocabulary = {
      id: `v_${Date.now()}`,
      ...dto,
      topicName: undefined,
      isLearned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vocabulary = [...vocabulary, newVoca];
    return newVoca;
  },

  update: async (id: string, dto: UpdateVocabularyDTO): Promise<Vocabulary> => {
    await delay();
    const index = vocabulary.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vocabulary not found');
    const updated = { ...vocabulary[index], ...dto, updatedAt: new Date().toISOString() };
    vocabulary = vocabulary.map(v => v.id === id ? updated : v);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    vocabulary = vocabulary.filter(v => v.id !== id);
  },

  markLearned: async (id: string, isLearned: boolean): Promise<Vocabulary> => {
    await delay();
    const index = vocabulary.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vocabulary not found');
    const updated = { ...vocabulary[index], isLearned, updatedAt: new Date().toISOString() };
    vocabulary = vocabulary.map(v => v.id === id ? updated : v);
    return updated;
  },

  updateSRS: async (id: string, difficulty: Difficulty): Promise<Vocabulary> => {
    await delay();
    const index = vocabulary.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vocabulary not found');
    const prev = vocabulary[index];

    let q = 3;
    if (difficulty === Difficulty.Easy) q = 5;
    else if (difficulty === Difficulty.Medium) q = 4;
    else if (difficulty === Difficulty.Hard) q = 3;
    else if (difficulty === Difficulty.SuperHard) q = 1;

    let reps = prev.repetitions ?? 0;
    let ef = prev.easeFactor ?? 2.5;
    let interval = prev.interval ?? 0;

    if (q >= 3) {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }
      reps++;
    } else {
      reps = 0;
      interval = 1;
    }

    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ef < 1.3) ef = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const updated: Vocabulary = {
      ...prev,
      difficulty,
      isLearned: true,
      repetitions: reps,
      easeFactor: ef,
      interval,
      nextReviewAt: nextReviewDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vocabulary = vocabulary.map(v => v.id === id ? updated : v);
    return updated;
  },
};

