/**
 * API endpoint constants
 */

const API_BASE = "/api";

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },

  // Guests
  GUESTS: {
    LIST: `${API_BASE}/guests`,
    CREATE: `${API_BASE}/guests`,
    DETAIL: (id: string) => `${API_BASE}/guests/${id}`,
    UPDATE: (id: string) => `${API_BASE}/guests/${id}`,
    DELETE: (id: string) => `${API_BASE}/guests/${id}`,
  },

  // Announcements
  ANNOUNCEMENTS: {
    LIST: `${API_BASE}/announcements`,
    DETAIL: (id: string) => `${API_BASE}/announcements/${id}`,
    MARK_READ: (id: string) => `${API_BASE}/announcements/${id}/read`,
  },

  // Payments
  PAYMENTS: {
    LIST: `${API_BASE}/payments`,
    DETAIL: (id: string) => `${API_BASE}/payments/${id}`,
    CREATE_INTENT: (id: string) => `${API_BASE}/payments/${id}/intent`,
    CONFIRM: (id: string) => `${API_BASE}/payments/${id}/confirm`,
  },

  // Vehicle stickers
  STICKERS: {
    LIST: `${API_BASE}/stickers`,
    CREATE: `${API_BASE}/stickers`,
    DETAIL: (id: string) => `${API_BASE}/stickers/${id}`,
    RENEW: (id: string) => `${API_BASE}/stickers/${id}/renew`,
    UPLOAD_DOCUMENT: (id: string) => `${API_BASE}/stickers/${id}/documents`,
  },

  // Permits
  PERMITS: {
    LIST: `${API_BASE}/permits`,
    CREATE: `${API_BASE}/permits`,
    DETAIL: (id: string) => `${API_BASE}/permits/${id}`,
    UPDATE: (id: string) => `${API_BASE}/permits/${id}`,
    SUBMIT: (id: string) => `${API_BASE}/permits/${id}/submit`,
    UPLOAD_DOCUMENT: (id: string) => `${API_BASE}/permits/${id}/documents`,
  },

  // Incidents
  INCIDENTS: {
    LIST: `${API_BASE}/incidents`,
    CREATE: `${API_BASE}/incidents`,
    DETAIL: (id: string) => `${API_BASE}/incidents/${id}`,
    UPLOAD_PHOTO: (id: string) => `${API_BASE}/incidents/${id}/photos`,
  },

  // Messages
  MESSAGES: {
    LIST: `${API_BASE}/messages`,
    CONVERSATION: (id: string) => `${API_BASE}/messages/${id}`,
    SEND: `${API_BASE}/messages`,
    MARK_READ: (id: string) => `${API_BASE}/messages/${id}/read`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_BASE}/notifications`,
    MARK_READ: (id: string) => `${API_BASE}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE}/notifications/read-all`,
    DELETE: (id: string) => `${API_BASE}/notifications/${id}`,
  },

  // Household
  HOUSEHOLD: {
    DETAIL: `${API_BASE}/household`,
    UPDATE: `${API_BASE}/household`,
    MEMBERS: `${API_BASE}/household/members`,
  },

  // Profile
  PROFILE: {
    DETAIL: `${API_BASE}/profile`,
    UPDATE: `${API_BASE}/profile`,
    UPDATE_AVATAR: `${API_BASE}/profile/avatar`,
    UPDATE_PASSWORD: `${API_BASE}/profile/password`,
  },

  // Rules
  RULES: {
    LIST: `${API_BASE}/rules`,
  },

  // File upload
  UPLOAD: {
    SINGLE: `${API_BASE}/upload`,
    MULTIPLE: `${API_BASE}/upload/multiple`,
  },
} as const;
