import mongoose, { Document, Schema, Types } from 'mongoose';
import type { BudgetPeriod } from '../types/express.js';

export interface IBudget extends Document {
  _id: Types.ObjectId;
  team: Types.ObjectId;
  category: string;
  limit: number;
  period: BudgetPeriod;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  },
  { timestamps: true }
);

export default mongoose.model<IBudget>('Budget', budgetSchema);
