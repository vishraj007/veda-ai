import { create } from 'zustand';
import type { Assignment, QuestionPaper, AssignmentStatus } from '@vedaai/shared';
import api from '@/services/api';

interface AssignmentStore {
  assignments: Assignment[];
  currentPaper: QuestionPaper | null;
  loading: boolean;
  error: string | null;
  generationStatus: AssignmentStatus | 'idle';
  generationProgress: number;
  generationMessage: string;

  fetchAssignments: () => Promise<void>;
  createAssignment: (data: Record<string, unknown>) => Promise<string>;
  deleteAssignment: (id: string) => Promise<void>;
  fetchPaper: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<void>;
  setGenerationStatus: (status: AssignmentStatus | 'idle', progress: number, message: string) => void;
  setCurrentPaper: (paper: QuestionPaper) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentPaper: null,
  loading: false,
  error: null,
  generationStatus: 'idle',
  generationProgress: 0,
  generationMessage: '',

  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/assignments');
      set({ assignments: res.data.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createAssignment: async (data) => {
    set({ loading: true, error: null, generationStatus: 'generating', generationProgress: 0, generationMessage: 'Submitting assignment...' });
    try {
      const res = await api.post('/assignments', data);
      const assignment = res.data.data as Assignment;
      set((state) => ({
        assignments: [assignment, ...state.assignments],
        loading: false,
      }));
      return assignment._id;
    } catch (err) {
      set({ error: (err as Error).message, loading: false, generationStatus: 'failed' });
      throw err;
    }
  },

  deleteAssignment: async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchPaper: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/assignments/${id}/paper`);
      set({ currentPaper: res.data.data, loading: false, generationStatus: 'completed', generationProgress: 100 });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  regenerate: async (id) => {
    set({ generationStatus: 'generating', generationProgress: 0, generationMessage: 'Regenerating...', currentPaper: null });
    try {
      await api.post(`/assignments/${id}/regenerate`);
    } catch (err) {
      set({ error: (err as Error).message, generationStatus: 'failed' });
    }
  },

  setGenerationStatus: (status, progress, message) => {
    set({ generationStatus: status, generationProgress: progress, generationMessage: message });
  },

  setCurrentPaper: (paper) => {
    set({ currentPaper: paper, generationStatus: 'completed', generationProgress: 100 });
  },

  reset: () => {
    set({
      currentPaper: null,
      generationStatus: 'idle',
      generationProgress: 0,
      generationMessage: '',
      error: null,
    });
  },
}));
