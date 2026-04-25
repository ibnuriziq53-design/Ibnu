import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'guru' | 'siswa';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAppUser: (appUser: AppUser | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  initialize: async () => {
    if (!supabase) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user });
        // Fetch app user profile
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data && !error) {
          set({ appUser: data as AppUser });
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      set({ isLoading: false });
      
      // Setup listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ user: session?.user || null });
        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (data) {
            set({ appUser: data as AppUser });
          }
        } else {
          set({ appUser: null });
        }
      });
    }
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, appUser: null });
  }
}));
