import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface TenantUser {
  id: string;
  userProfileId: string;
  tenantId: string;
  roleId: string;
  permissions: Record<string, unknown>;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Resident {
  id: string;
  tenantUserId: string;
  householdId: string;
  isPrimaryContact: boolean;
  hasSignatoryRights: boolean;
  hasVisitingRights: boolean;
  idType: string | null;
  idUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  tenantUser: TenantUser | null;
  resident: Resident | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setTenantUser: (tenantUser: TenantUser | null) => void;
  setResident: (resident: Resident | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed values
  isAuthenticated: () => boolean;
  hasSignatoryRights: () => boolean;
  hasVisitingRights: () => boolean;
  fullName: () => string;
}

const initialState = {
  user: null,
  userProfile: null,
  tenantUser: null,
  resident: null,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setUser: (user) => set({ user }),

  setUserProfile: (userProfile) => set({ userProfile }),

  setTenantUser: (tenantUser) => set({ tenantUser }),

  setResident: (resident) => set({ resident }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),

  // Computed values
  isAuthenticated: () => {
    const state = get();
    return state.user !== null && state.userProfile !== null;
  },

  hasSignatoryRights: () => {
    const state = get();
    return state.resident?.hasSignatoryRights ?? false;
  },

  hasVisitingRights: () => {
    const state = get();
    return state.resident?.hasVisitingRights ?? false;
  },

  fullName: () => {
    const state = get();
    if (!state.userProfile) return "";
    return `${state.userProfile.firstName} ${state.userProfile.lastName}`;
  },
}));
