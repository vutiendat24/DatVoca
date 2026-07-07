import { mockTopics } from './mockData';
import type { Topic, CreateTopicDTO, UpdateTopicDTO } from '../types';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

let topics = [...mockTopics];

export const topicApi = {
  getAll: async (): Promise<Topic[]> => {
    await delay();
    return [...topics];
  },

  getById: async (id: string): Promise<Topic> => {
    await delay();
    const topic = topics.find(t => t.id === id);
    if (!topic) throw new Error('Topic not found');
    return { ...topic };
  },

  create: async (dto: CreateTopicDTO): Promise<Topic> => {
    await delay();
    const newTopic: Topic = {
      id: `t_${Date.now()}`,
      ...dto,
      vocabularyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    topics = [...topics, newTopic];
    return newTopic;
  },

  update: async (id: string, dto: UpdateTopicDTO): Promise<Topic> => {
    await delay();
    const index = topics.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Topic not found');
    const updated = { ...topics[index], ...dto, updatedAt: new Date().toISOString() };
    topics = topics.map(t => t.id === id ? updated : t);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    topics = topics.filter(t => t.id !== id);
  },
};
