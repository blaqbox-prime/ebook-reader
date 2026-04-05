import { create } from 'zustand';

interface UserStatsState {
  totalMinutesRead: number;
  setTotalMinutesRead: (minutes: number) => void;
}

export const useUserStatsStore = create<UserStatsState>(set => ({
  totalMinutesRead: 0,
  setTotalMinutesRead: (minutes: number) => set({ totalMinutesRead: minutes }),
}));
