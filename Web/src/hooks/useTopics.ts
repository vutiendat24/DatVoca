import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicApi } from '../api/topic.api';
import { QUERY_KEYS } from '../constants';
import type { CreateTopicDTO, UpdateTopicDTO } from '../types';
import { toast } from '../components/Toast/Toast';

export const useTopics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOPICS],
    queryFn: topicApi.getAll,
  });
};

export const useCreateTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTopicDTO) => topicApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOPICS] });
      toast.success('Topic created!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTopicDTO }) => topicApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOPICS] });
      toast.success('Topic updated!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => topicApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TOPICS] });
      toast.success('Topic deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
