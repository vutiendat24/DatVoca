import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingApi } from '../api/reading.api';
import { QUERY_KEYS } from '../constants';
import type { CreateReadingDTO, UpdateReadingDTO, AIGenerateRequest } from '../types';
import { toast } from '../components/Toast/Toast';

export const useReadings = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.READINGS],
    queryFn: readingApi.getAll,
  });
};

export const useReading = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.READINGS, id],
    queryFn: () => readingApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateReading = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReadingDTO) => readingApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.READINGS] });
      toast.success('Reading created!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateReading = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReadingDTO }) => readingApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.READINGS] });
      toast.success('Reading updated!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteReading = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.READINGS] });
      toast.success('Reading deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useGenerateReading = () => {
  return useMutation({
    mutationFn: (req: AIGenerateRequest) => readingApi.generateWithAI(req),
    onError: (err: Error) => toast.error(err.message),
  });
};
