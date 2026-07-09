import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sentenceApi } from '../api/sentence.api';
import type { SentenceFilters, CreateSentenceDTO, UpdateSentenceDTO, Difficulty } from '../types';

export const SENTENCE_KEYS = {
  all: ['sentences'] as const,
  today: ['sentences', 'today'] as const,
  list: (filters: SentenceFilters) => ['sentences', 'list', filters] as const,
};

export function useSentences(filters: SentenceFilters) {
  return useQuery({
    queryKey: SENTENCE_KEYS.list(filters),
    queryFn: () => sentenceApi.getAll(filters),
  });
}

export const useTodaySentences = () => {
  return useQuery({
    queryKey: ['sentences_today'],
    queryFn: sentenceApi.getToday,
  });
};

export const useQuickReviewSentences = () => {
  return useQuery({
    queryKey: ['sentences_today', 'quick_review'],
    queryFn: sentenceApi.getQuickReview,
  });
};

export function useCreateSentence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSentenceDTO) => sentenceApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SENTENCE_KEYS.all });
    },
  });
}

export function useUpdateSentence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSentenceDTO }) => sentenceApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SENTENCE_KEYS.all });
    },
  });
}

export function useDeleteSentence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sentenceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SENTENCE_KEYS.all });
    },
  });
}

export function useUpdateSentenceSRS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, difficulty }: { id: string; difficulty: Difficulty }) => sentenceApi.updateSRS(id, difficulty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SENTENCE_KEYS.all });
    },
  });
}

export function useMarkSentenceLearned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isLearned }: { id: string; isLearned: boolean }) => sentenceApi.markLearned(id, isLearned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SENTENCE_KEYS.all });
    },
  });
}
