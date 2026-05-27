import { create } from 'zustand';
import api from '@/services/api';

export interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
}

export interface AssignedPaper {
  assignmentId: string;
  assignedAt: string;
  dueDate: string;
  title: string;
}

export interface Group {
  _id: string;
  name: string;
  subject: string;
  section: string;
  description: string;
  color: string;
  icon: string;
  students: Student[];
  assignedPapers: AssignedPaper[];
  createdAt: string;
  updatedAt: string;
}

interface GroupStore {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  fetchGroup: (id: string) => Promise<void>;
  createGroup: (data: Partial<Group>) => Promise<string>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addStudent: (groupId: string, student: { name: string; email: string; rollNumber: string }) => Promise<void>;
  importStudents: (groupId: string, students: { name: string; email: string; rollNumber: string }[]) => Promise<number>;
  removeStudent: (groupId: string, studentId: string) => Promise<void>;
  assignPaper: (groupId: string, assignmentId: string, dueDate?: string) => Promise<void>;
  unassignPaper: (groupId: string, assignmentId: string) => Promise<void>;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/groups');
      set({ groups: res.data.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchGroup: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/groups/${id}`);
      set({ currentGroup: res.data.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createGroup: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/groups', data);
      const group = res.data.data;
      set((state) => ({ groups: [group, ...state.groups], loading: false }));
      return group._id;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  updateGroup: async (id, data) => {
    try {
      const res = await api.put(`/groups/${id}`, data);
      const updated = res.data.data;
      set((state) => ({
        groups: state.groups.map((g) => (g._id === id ? updated : g)),
        currentGroup: state.currentGroup?._id === id ? updated : state.currentGroup,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteGroup: async (id) => {
    try {
      await api.delete(`/groups/${id}`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== id),
        currentGroup: state.currentGroup?._id === id ? null : state.currentGroup,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addStudent: async (groupId, student) => {
    try {
      const res = await api.post(`/groups/${groupId}/students`, student);
      const updated = res.data.data;
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updated : g)),
        currentGroup: state.currentGroup?._id === groupId ? updated : state.currentGroup,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  importStudents: async (groupId, students) => {
    try {
      const res = await api.post(`/groups/${groupId}/students/import`, { students });
      const updated = res.data.data;
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updated : g)),
        currentGroup: state.currentGroup?._id === groupId ? updated : state.currentGroup,
      }));
      return res.data.added || students.length;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  removeStudent: async (groupId, studentId) => {
    try {
      const res = await api.delete(`/groups/${groupId}/students/${studentId}`);
      const updated = res.data.data;
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updated : g)),
        currentGroup: state.currentGroup?._id === groupId ? updated : state.currentGroup,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  assignPaper: async (groupId, assignmentId, dueDate) => {
    try {
      const res = await api.post(`/groups/${groupId}/papers`, { assignmentId, dueDate });
      const updated = res.data.data;
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updated : g)),
        currentGroup: state.currentGroup?._id === groupId ? updated : state.currentGroup,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  unassignPaper: async (groupId, assignmentId) => {
    try {
      const res = await api.delete(`/groups/${groupId}/papers/${assignmentId}`);
      const updated = res.data.data;
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? updated : g)),
        currentGroup: state.currentGroup?._id === groupId ? updated : state.currentGroup,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
