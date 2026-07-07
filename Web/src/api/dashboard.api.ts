import { mockDashboardStats } from './mockData';
import type { DashboardStats } from '../types';

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay();
    return { ...mockDashboardStats };
  },
};
