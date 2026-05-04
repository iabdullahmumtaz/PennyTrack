import type { ITeam } from '../models/Team.js';

export type TeamRole = 'admin' | 'member';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      team?: ITeam;
      teamRole?: TeamRole;
    }
  }
}

export {};
