/**
 * Application route constants
 */

export const ROUTES = {
  // Public routes
  HOME: "/",

  // Auth routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Dashboard
  DASHBOARD: "/dashboard",

  // Guest pre-authorization
  GUESTS: {
    LIST: "/guests",
    NEW: "/guests/new",
    DETAIL: (id: string) => `/guests/${id}`,
    EDIT: (id: string) => `/guests/${id}/edit`,
  },

  // Announcements
  ANNOUNCEMENTS: {
    LIST: "/announcements",
    DETAIL: (id: string) => `/announcements/${id}`,
  },

  // Payments
  PAYMENTS: {
    LIST: "/payments",
    DETAIL: (id: string) => `/payments/${id}`,
    PAY: (id: string) => `/payments/${id}/pay`,
  },

  // Vehicle stickers
  STICKERS: {
    LIST: "/stickers",
    NEW: "/stickers/new",
    DETAIL: (id: string) => `/stickers/${id}`,
    RENEW: (id: string) => `/stickers/${id}/renew`,
  },

  // Permits
  PERMITS: {
    LIST: "/permits",
    NEW: "/permits/new",
    DETAIL: (id: string) => `/permits/${id}`,
    EDIT: (id: string) => `/permits/${id}/edit`,
  },

  // Incidents
  INCIDENTS: {
    LIST: "/incidents",
    NEW: "/incidents/new",
    DETAIL: (id: string) => `/incidents/${id}`,
  },

  // Messages
  MESSAGES: {
    LIST: "/messages",
    CONVERSATION: (id: string) => `/messages/${id}`,
    NEW: "/messages/new",
  },

  // Household
  HOUSEHOLD: {
    PROFILE: "/household",
    MEMBERS: "/household/members",
    EDIT: "/household/edit",
  },

  // Rules and regulations
  RULES: "/rules",

  // Profile
  PROFILE: {
    VIEW: "/profile",
    EDIT: "/profile/edit",
    SETTINGS: "/profile/settings",
  },

  // Notifications
  NOTIFICATIONS: "/notifications",
} as const;
