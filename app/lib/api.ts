export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' });