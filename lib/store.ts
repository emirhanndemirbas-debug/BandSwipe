import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null | undefined;
  onboardingCompleted: boolean | undefined;
  newMatchCount: number;
  setSession: (session: Session | null) => void;
  setOnboardingCompleted: (val: boolean | undefined) => void;
  incrementMatchCount: () => void;
  resetMatchCount: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: undefined,
  onboardingCompleted: undefined,
  newMatchCount: 0,
  setSession: (session) => set({ session }),
  setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),
  incrementMatchCount: () => set((s) => ({ newMatchCount: s.newMatchCount + 1 })),
  resetMatchCount: () => set({ newMatchCount: 0 }),
}));
