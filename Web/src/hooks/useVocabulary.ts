import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabularyApi } from '../api/vocabulary.api';
import { QUERY_KEYS } from '../constants';
import { Difficulty, type CreateVocabularyDTO, type UpdateVocabularyDTO, type VocabularyFilters } from '../types';
import { toast } from '../components/Toast/Toast';

export const useVocabulary = (filters: VocabularyFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VOCABULARY, filters],
    queryFn: () => vocabularyApi.getAll(filters),
  });
};

export const useTodayVocabulary = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.VOCABULARY_TODAY],
    queryFn: vocabularyApi.getToday,
  });
};

export const useQuickReviewVocabulary = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.VOCABULARY_TODAY, 'quick_review'],
    queryFn: vocabularyApi.getQuickReview,
  });
};

export const useVocabularyByTopic = (topicId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VOCABULARY, 'topic', topicId],
    queryFn: () => vocabularyApi.getByTopic(topicId),
    enabled: !!topicId,
  });
};

export const useCreateVocabulary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateVocabularyDTO) => vocabularyApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.VOCABULARY] });
      toast.success('Vocabulary added successfully!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateVocabulary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateVocabularyDTO }) => vocabularyApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.VOCABULARY] });
      toast.success('Vocabulary updated!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteVocabulary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vocabularyApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.VOCABULARY] });
      toast.success('Vocabulary deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useMarkLearned = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isLearned }: { id: string; isLearned: boolean }) =>
      vocabularyApi.markLearned(id, isLearned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.VOCABULARY] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateSRS = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, difficulty }: { id: string; difficulty: Difficulty }) =>
      vocabularyApi.updateSRS(id, difficulty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.VOCABULARY] });
      toast.success('Progress updated via Spaced Repetition!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

