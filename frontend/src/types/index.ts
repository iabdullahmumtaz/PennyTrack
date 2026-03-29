import type { Dispatch, SetStateAction } from 'react';

export type TeamRole = 'admin' | 'member';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

export interface TeamMember {
  user: UserRef;
  role: TeamRole;
}

export interface Team {
  _id: string;
  name: string;
  owner: UserRef;
  members: TeamMember[];
  role: TeamRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  team: string;
  user: UserRef;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  _id: string;
  team: string;
  category: string;
  limit: number;
  period: BudgetPeriod;
  spent: number;
  remaining: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryStat {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyStat {
  label: string;
  total: number;
}

export interface DashboardStats {
  totalSpent: number;
  byCategory: CategoryStat[];
  monthly: MonthlyStat[];
  recent: Expense[];
}

export interface AuthResponse {
  user: UserRef & { name: string };
  token: string;
}

export interface TeamContextValue {
  team: Team | null;
  setTeam: Dispatch<SetStateAction<Team | null>>;
  teamList: Team[];
  setTeamList: Dispatch<SetStateAction<Team[]>>;
}
