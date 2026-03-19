import type {
  AuthResponse,
  Budget,
  DashboardStats,
  Expense,
  Team,
  UserRef,
} from './types';

const TOKEN_KEY = 'pennytrack_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export const auth = {
  register: (body: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{ user: UserRef }>('/auth/me'),
};

export const teams = {
  list: () => request<Team[]>('/teams'),
  create: (name: string) =>
    request<Team>('/teams', { method: 'POST', body: JSON.stringify({ name }) }),
  addMember: (id: string, email: string, role: string) =>
    request<Team>(`/teams/${id}/members`, { method: 'POST', body: JSON.stringify({ email, role }) }),
};

export const expenses = {
  list: (team: string) => request<Expense[]>(`/expenses?team=${team}`),
  create: (body: Partial<Expense> & { team: string; amount: number; category: string }) =>
    request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Expense>) =>
    request<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) => request<{ ok: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
};

export const budgets = {
  list: (team: string) => request<Budget[]>(`/budgets?team=${team}`),
  create: (body: { team: string; category: string; limit: number; period?: string }) =>
    request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Budget>) =>
    request<Budget>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) => request<{ ok: boolean }>(`/budgets/${id}`, { method: 'DELETE' }),
};

export const dashboard = {
  stats: (team: string) => request<DashboardStats>(`/dashboard/stats?team=${team}`),
};

export async function downloadExport(team: string, type: 'csv' | 'pdf'): Promise<void> {
  const token = getToken();
  const res = await fetch(`/api/export/${type}?team=${team}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = type === 'csv' ? 'expenses.csv' : 'expenses.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
