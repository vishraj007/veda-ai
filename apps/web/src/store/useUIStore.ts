import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  activeNav: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveNav: (nav: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  activeNav: 'assignments',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveNav: (nav) => set({ activeNav: nav }),
}));
