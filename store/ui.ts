import { create } from "zustand";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

interface UIState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  toasts: Toast[];
  isLoading: boolean;
  loadingMessage: string | null;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Mobile menu actions
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Toast actions
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Loading actions
  setLoading: (loading: boolean, message?: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  toasts: [],
  isLoading: false,
  loadingMessage: null,
};

export const useUIStore = create<UIState>((set) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove toast after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  setLoading: (isLoading, loadingMessage = null) =>
    set({ isLoading, loadingMessage }),

  reset: () => set(initialState),
}));
