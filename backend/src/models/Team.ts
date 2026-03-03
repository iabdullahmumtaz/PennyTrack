import mongoose, { Document, Schema, Types } from 'mongoose';
import type { TeamRole } from '../types/express.js';

export interface ITeamMember {
  user: Types.ObjectId;
  role: TeamRole;
}

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  members: ITeamMember[];
  getMemberRole(userId: Types.ObjectId | string): TeamRole | null;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<ITeamMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
  },
  { timestamps: true }
);

teamSchema.methods.getMemberRole = function getMemberRole(userId: Types.ObjectId | string): TeamRole | null {
  const id = userId.toString();
  if (this.owner.toString() === id) return 'admin';
  const m = this.members.find((x: ITeamMember) => x.user.toString() === id);
  return m?.role || null;
};

export default mongoose.model<ITeam>('Team', teamSchema);
