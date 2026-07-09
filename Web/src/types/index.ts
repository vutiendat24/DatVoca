// ─── Enums ───────────────────────────────────────────────────────────────────

export const Difficulty = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
  SuperHard: 'super_hard',
} as const;
export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const ReadingDifficulty = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
} as const;
export type ReadingDifficulty = typeof ReadingDifficulty[keyof typeof ReadingDifficulty];

// ─── Topic ───────────────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  vocabularyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicDTO {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export type UpdateTopicDTO = Partial<CreateTopicDTO>;

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export interface Vocabulary {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  exampleEn: string;
  exampleVi: string;
  topicId?: string;
  topicName?: string;
  difficulty?: Difficulty;
  isLearned: boolean;
  nextReviewAt?: string;
  interval?: number; // in days
  easeFactor?: number;
  repetitions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyDTO {
  word: string;
  ipa: string;
  meaning: string;
  exampleEn: string;
  exampleVi: string;
  topicId?: string;
  difficulty?: Difficulty;
}

export type UpdateVocabularyDTO = Partial<CreateVocabularyDTO>;

export interface VocabularyFilters {
  search?: string;
  topicId?: string;
  difficulty?: Difficulty;
  isLearned?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Sentence ─────────────────────────────────────────────────────────────────

export interface Sentence {
  id: string;
  english: string;
  vietnamese: string;
  topicId?: string;
  topicName?: string;
  difficulty?: Difficulty;
  isLearned: boolean;
  nextReviewAt?: string;
  interval?: number; // in days
  easeFactor?: number;
  repetitions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSentenceDTO {
  english: string;
  vietnamese: string;
  topicId?: string;
  difficulty?: Difficulty;
}

export type UpdateSentenceDTO = Partial<CreateSentenceDTO>;

export interface SentenceFilters {
  search?: string;
  topicId?: string;
  difficulty?: Difficulty;
  isLearned?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Reading ──────────────────────────────────────────────────────────────────

export interface ReadingQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Reading {
  id: string;
  title: string;
  topicId: string;
  topicName?: string;
  paragraph: string;
  translation: string;
  difficulty: ReadingDifficulty;
  estimatedMinutes: number;
  vocabularyHighlights: string[];
  questions: ReadingQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReadingDTO {
  title: string;
  topicId: string;
  paragraph: string;
  translation: string;
  difficulty: ReadingDifficulty;
  estimatedMinutes: number;
  vocabularyHighlights: string[];
  questions: Omit<ReadingQuestion, 'id'>[];
}

export type UpdateReadingDTO = Partial<CreateReadingDTO>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalVocabulary: number;
  learnedToday: number;
  totalReadings: number;
  totalTopics: number;
  weeklyProgress: number[];
  streakDays: number;
  masteredWords: number;
}

// ─── AI Generator ─────────────────────────────────────────────────────────────

export interface AIGenerateRequest {
  prompt: string;
}

export interface AIGeneratedReading {
  title: string;
  paragraph: string;
  translation: string;
  difficulty: ReadingDifficulty;
  estimatedMinutes: number;
  vocabularyHighlights: string[];
  questions: Omit<ReadingQuestion, 'id'>[];
}
