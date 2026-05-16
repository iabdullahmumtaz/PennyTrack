import { Types } from 'mongoose';
import Team, { type ITeam } from '../models/Team.js';
import type { TeamRole } from '../types/express.js';

export async function getUserTeams(userId: string | Types.ObjectId) {
  const teams = await Team.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  }).populate('owner', 'name email').populate('members.user', 'name email');
  return teams.map((t) => ({
    ...t.toObject(),
    role: t.getMemberRole(userId),
  }));
}

type TeamAccessSuccess = { team: ITeam; role: TeamRole };
type TeamAccessFailure = { error: string; status: number };

export async function assertTeamMember(
  teamId: string | Types.ObjectId,
  userId: string | undefined
): Promise<TeamAccessSuccess | TeamAccessFailure> {
  if (!userId) return { error: 'Authentication required', status: 401 };
  const team = await Team.findById(teamId);
  if (!team) return { error: 'Team not found', status: 404 };
  const role = team.getMemberRole(userId);
  if (!role) return { error: 'Not a team member', status: 403 };
  return { team, role };
}
