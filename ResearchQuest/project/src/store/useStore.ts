import { create } from 'zustand';
import type { User, ResearchPhase, Community } from '../types';

interface Store {
  user: User | null;
  currentPhase: ResearchPhase | null;
  communities: Community[];
  setUser: (user: User | null) => void;
  setCurrentPhase: (phase: ResearchPhase) => void;
  setCommunities: (communities: Community[]) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  currentPhase: null,
  communities: [],
  setUser: (user) => set({ user }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  setCommunities: (communities) => set({ communities }),
}));