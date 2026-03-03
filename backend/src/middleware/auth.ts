import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { ITeam } from '../models/Team.js';

const secret = process.env.JWT_SECRET || 'dev-secret';

interface JwtPayload {
  id: string;
}

export function signToken(user: { _id: { toString(): string } }): string {
  return jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '7d' });
}

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), secret) as JwtPayload;
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export async function loadTeamAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const Team = (await import('../models/Team.js')).default;
  const teamId = req.params.teamId || (req.body.team as string) || (req.query.team as string);
  const team = await Team.findById(teamId);
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  const role = team.getMemberRole(req.userId!);
  if (!role) {
    res.status(403).json({ error: 'Not a team member' });
    return;
  }
  req.team = team as ITeam;
  req.teamRole = role;
  next();
}

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.teamRole !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
