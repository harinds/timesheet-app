import axios from 'axios';
import type { TimeEntry, Project, TimeEntrySummary, CreateTimeEntryDTO } from './types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Time Entries
export const timeEntriesAPI = {
  getAll: async (params?: { date?: string; project?: string }): Promise<TimeEntry[]> => {
    const response = await api.get<TimeEntry[]>('/entries', { params });
    return response.data;
  },

  getById: async (id: number): Promise<TimeEntry> => {
    const response = await api.get<TimeEntry>(`/entries/${id}`);
    return response.data;
  },

  create: async (data: CreateTimeEntryDTO): Promise<{ id: number; message: string }> => {
    const response = await api.post('/entries', data);
    return response.data;
  },

  update: async (id: number, data: CreateTimeEntryDTO): Promise<{ message: string }> => {
    const response = await api.put(`/entries/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
  },
};

// Projects
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },
};

// Summary
export const summaryAPI = {
  get: async (params?: { start_date?: string; end_date?: string }): Promise<TimeEntrySummary[]> => {
    const response = await api.get<TimeEntrySummary[]>('/summary', { params });
    return response.data;
  },
};

export default api;
