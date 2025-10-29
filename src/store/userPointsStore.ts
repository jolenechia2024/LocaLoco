import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPointsState {
  currentPoints: number;
  setCurrentPoints: (points: number) => void;
}

export const useUserPointsStore = create<UserPointsState>()(
  persist(
    (set) => ({
      currentPoints: 0,
      setCurrentPoints: (points) => set({ currentPoints: points }),
    }),
    {
      name: 'user-points-storage', // localStorage key name
      getStorage: () => localStorage, // (optional) by default uses localStorage
    }
  )
);
